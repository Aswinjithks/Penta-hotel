import db from "../models/index.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { FoodItem, Category } = db;

export const getAllItems = asyncHandler(async (req, res) => {
  const { category_id } = req.query;
  const where = category_id
    ? { CategoryId: category_id, available: true }
    : { available: true };
  const items = await FoodItem.findAll({
    where,
    include: [{ model: Category, attributes: ["name"] }],
  });
  res.json({
    success: true,
    data: items,
  });
});

export const createItem = asyncHandler(async (req, res) => {
  const { name, category_id, price, image_url } = req.body;
  if (!name || !category_id || !price) {
    throw new AppError("Name, category and price are required", 400);
  }
  // Check if category exists
  const category = await Category.findByPk(category_id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  const item = await FoodItem.create({
    name,
    CategoryId: category_id,
    price,
    image_url,
  });
  res.status(201).json({
    success: true,
    message: "Item added successfully",
    data: item,
  });
});

export const updateItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  if (available === undefined) {
    throw new AppError("Available status is required", 400);
  }
  const item = await FoodItem.findByPk(id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }
  await item.update({ available });
  res.json({
    success: true,
    message: "Item availability updated",
    data: item,
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await FoodItem.findByPk(id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }
  await item.destroy();
  res.json({
    success: true,
    message: "Item deleted",
  });
});
