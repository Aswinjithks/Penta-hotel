import db from "../models/index.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { Category } = db;

export const getAllCategories = asyncHandler(async (req, res) => {
  const tableId = req.body.tableId;
  const categories = await Category.findAll();
  res.json({
    success: true,
    data: categories,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const adminId = req.admin.id;
  console.log("adminId----------",adminId);
  
  if (!name) {
    throw new AppError("Category name is required", 400);
  }
  const category = await Category.create({ name, image, adminId });
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  category.name = name || category.name;
  category.image = image || category.image;

  await category.save();

  res.json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  await category.destroy();

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

export const getCategoriesByAdminId = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const categories = await Category.findAll({
    where: { adminId },
  });

  if (!categories.length) {
    throw new AppError("No categories found for this admin", 404);
  }

  res.json({
    success: true,
    data: categories,
  });
});
