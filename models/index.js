import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CategoryModel from "./Category.js";
import FoodItemModel from "./FoodItem.js";
import AdminModel from "./Admin.js";
import TableModel from "./Table.js";
import OrderModel from "./Order.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.Category = CategoryModel(sequelize, Sequelize.DataTypes);
db.FoodItem = FoodItemModel(sequelize, Sequelize.DataTypes);
db.Admin = AdminModel(sequelize, Sequelize.DataTypes);
db.Table = TableModel(sequelize, Sequelize.DataTypes);
db.Order = OrderModel(sequelize, Sequelize.DataTypes);

// Define relationships between models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
