require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

const Category = sequelize.define("Category", {
  name: { type: DataTypes.STRING, allowNull: false },
});

const FoodItem = sequelize.define("FoodItem", {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  image_url: { type: DataTypes.STRING, allowNull: true },
});

const Admin = sequelize.define("Admin", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
});

const Table = sequelize.define("Table", {
  number: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  token: { type: DataTypes.STRING, allowNull: false, unique: true },
  qr_code_url: { type: DataTypes.TEXT, allowNull: true }, 
});


const Order = sequelize.define("Order", {
  tableId: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "preparing", "ready", "completed", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
});


// Relationships
Category.hasMany(FoodItem);
FoodItem.belongsTo(Category);
Order.belongsTo(Table);

sequelize.sync({ alter: true }).then(() => console.log("DB Synced"));

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access Denied: No Bearer Token" });
    }
    const token = authHeader.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Access Denied: Token not found" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

let adminSocket = null;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("admin_connected", () => {
    adminSocket = socket;
    console.log("Admin connected for notifications:", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (adminSocket?.id === socket.id) {
      adminSocket = null;
    }
  });
});

app.get("/categories", async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

app.get("/items", async (req, res) => {
  const { category_id } = req.query;
  const where = category_id
    ? { CategoryId: category_id, available: true }
    : { available: true };
  const items = await FoodItem.findAll({ where });
  res.json(items);
});

// 🔹 Admin Authentication
app.post("/admin/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await Admin.create({ username, password_hash: hashedPassword });
    res.json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(400).json({ message: "Username already exists" });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ where: { username } });

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

// 🔹 Admin Routes for Items
app.post("/items", authMiddleware, async (req, res) => {
  const { name, category_id, price, image_url } = req.body;
  try {
    const item = await FoodItem.create({
      name,
      CategoryId: category_id,
      price,
      image_url,
    });
    res.json({ message: "Item added successfully", item });
  } catch (error) {
    res.status(400).json({ message: "Error adding item" });
  }
});

app.put("/items/:id/availability", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  await FoodItem.update({ available }, { where: { id } });
  res.json({ message: "Item availability updated" });
});

app.delete("/items/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  await FoodItem.destroy({ where: { id } });
  res.json({ message: "Item deleted" });
});

// 🔹 Admin Routes for Categories
app.post("/categories", authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const category = await Category.create({ name });
    res.json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(400).json({ message: "Error creating category" });
  }
});

// 🔹 Admin Routes for Tables (QR Code)
app.post("/tables", authMiddleware, async (req, res) => {  
  const { number } = req.body;
  const existingTable = await Table.findOne({ where: { number } });
  if (existingTable) {
    return res.status(400).json({ message: "Table number already exists" });
  }
  const token = uuidv4();
  const tableUrl = `${process.env.FRONTEND_URL}/order?token=${token}`;
  const qrCode = await QRCode.toDataURL(tableUrl);
  const table = await Table.create({ number, token, qr_code_url: qrCode });
  res.json({ message: "Table created successfully", table });
});

// app.get("/tables/:number/qr", async (req, res) => {
//   const { number } = req.params;
//   const table = await Table.findOne({ where: { number } });
//   if (!table) {
//     return res.status(404).json({ message: "Table not found" });
//   }
//   res.json({ qr_code_url: table.qr_code_url });
// });

app.post("/orders", async (req, res) => {
  try {
    const { token, items } = req.body;
    const table = await Table.findOne({ where: { token } });

    if (!table) {
      return res.status(403).json({ message: "Invalid table token" });
    }

    if (!Array.isArray(items) || items.some((item) => !item.id || !item.quantity)) {
      return res.status(400).json({ message: "Invalid items format" });
    }

    const itemIds = items.map((item) => item.id);
    const foodItems = await FoodItem.findAll({ where: { id: itemIds } });

    if (foodItems.length === 0) {
      return res.status(400).json({ message: "No valid food items found" });
    }

    const orderItems = items
      .map((orderItem) => {
        const foodItem = foodItems.find((item) => item.id === orderItem.id);
        if (!foodItem) return null;
        return {
          id: foodItem.id,
          name: foodItem.name,
          price: foodItem.price,
          quantity: orderItem.quantity,
        };
      })
      .filter(Boolean);

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "No valid items found in the order" });
    }

    const order = await Order.create({
      tableId: table.id,
      items: JSON.stringify(orderItems),
      status: "pending", // Set default status
    });

    if (adminSocket) {
      adminSocket.emit("new_order", {
        orderId: order.id,
        tableNumber: table.number,
        items: orderItems,
        status: order.status,
      });
    }

    res.json({ message: "Order placed successfully", order_id: order.id });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    if (adminSocket) {
      adminSocket.emit("order_status_updated", {
        orderId: order.id,
        status: order.status,
      });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/orders", authMiddleware, async (req, res) => {
  const orders = await Order.findAll({
    attributes: ["id", "tableId", "items", "status", "createdAt"],
    include: [{ model: Table, attributes: ["number"] }],
  });

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    table_number: order.Table.number,
    items: JSON.parse(order.items),
    status: order.status,
    created_at: order.createdAt,
  }));

  res.json({ orders: formattedOrders });
});

app.get("/tables/:number/qr", authMiddleware, async (req, res) => {
  const { number } = req.params;
  const table = await Table.findOne({
    where: { number },
    attributes: ["qr_code_url"],
  });
  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }
  res.json({ qr_code_url: table.qr_code_url });
});

app.get("/tables", authMiddleware, async (req, res) => {
  const tables = await Table.findAll({
    attributes: ["id", "number", "qr_code_url", "token"],
  });
  res.json({ tables });
});

app.put("/tables/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { number } = req.body;

  const table = await Table.findByPk(id);
  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }

  // Check if another table already has this number
  const existingTable = await Table.findOne({ where: { number } });
  if (existingTable && existingTable.id !== id) {
    return res.status(400).json({ message: "Table number already exists" });
  }

  table.number = number;
  await table.save();

  res.json({ message: "Table updated successfully", table });
});

app.delete("/tables/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const table = await Table.findByPk(id);
  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }

  await table.destroy();
  res.json({ message: "Table deleted successfully" });
});

// 🔹 Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
