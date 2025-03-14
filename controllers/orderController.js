import db from "../models/index.js";
import { getIO } from "../socket/index.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { Order, Table, FoodItem } = db;

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    attributes: ["id", "items", "status", "createdAt"],
    include: [{ model: Table, attributes: ["number"] }],
  });

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    table_number: order.Table.number,
    items: JSON.parse(order.items),
    status: order.status,
    created_at: order.createdAt,
  }));

  res.json({
    success: true,
    data: formattedOrders,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { token, items } = req.body;
  if (!token || !items) {
    throw new AppError("Token and items are required", 400);
  }
  const table = await Table.findOne({ where: { token } });
  if (!table) {
    throw new AppError("Invalid table token", 403);
  }
  if (
    !Array.isArray(items) ||
    items.some((item) => !item.id || !item.quantity)
  ) {
    throw new AppError("Invalid items format", 400);
  }
  const itemIds = items.map((item) => item.id);
  const foodItems = await FoodItem.findAll({ where: { id: itemIds } });
  if (foodItems.length === 0) {
    throw new AppError("No valid food items found", 400);
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
    throw new AppError("No valid items found in the order", 400);
  }

  const order = await Order.create({
    TableId: table.id,
    items: JSON.stringify(orderItems),
    status: "pending",
  });

  // Emit socket event for new order
  const io = getIO();
  if (io) {
    io.to("admin-room").emit("new_order", {
      orderId: order.id,
      tableNumber: table.number,
      items: orderItems,
      status: order.status,
    });
  }
  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order_id: order.id },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const order = await Order.findByPk(id);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  order.status = status;
  await order.save();

  // Emit socket event for status update
  const io = getIO();
  if (io) {
    io.to("admin-room").emit("order_status_updated", {
      orderId: order.id,
      status: order.status,
    });
  }

  res.json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});
