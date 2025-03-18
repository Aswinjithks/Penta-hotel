import db from "../models/index.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { Category } = db;

export const getAllCategories = asyncHandler(async (req, res) => {
  const userId = req.admin;

  const categories = await Category.findAll({ where: { userId } });

  res.json({
    success: true,
    data: categories,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const userId = req.admin;
  if (!name) {
    throw new AppError("Category name is required", 400);
  }
  const category = await Category.create({ name, image, userId });
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});
