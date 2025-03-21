import { Op } from "sequelize";
import db from "../models/index.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { FoodItem, Category, Table } = db;

export const getByCategory = asyncHandler(async (req, res) => {
  const { category_id } = req.query;
  const where = category_id
    ? { categoryId: category_id, available: true }
    : { available: true };
  const items = await FoodItem.findAll({
    where,
    include: [{ model: Category, as: "category", attributes: ["name"] }],
  });
  res.json({
    success: true,
    data: items,
  });
});

export const getFoodItems = asyncHandler(async (req, res) => {
  const tableId = req.params.tableId;
  try {
    const tableData = await Table.findOne({ where: { token: tableId } });
    if (!tableData) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }
    const adminId = tableData.adminId;

    const foodItems = await FoodItem.findAll({
      where: { available: true, adminId },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!foodItems.length) {
      return res.status(404).json({
        success: false,
        message: "No food items found for this admin",
      });
    }

    const newArrivals = foodItems.filter((item) => item.new_arrival === true);
    const popularItems = foodItems.filter((item) => item.popular === true);
    const specialItems = foodItems.filter((item) => item.special === true);
    const regularItems = foodItems.filter(
      (item) => !item.new_arrival && !item.popular && !item.special
    );

    return res.status(200).json({
      success: true,
      count: foodItems.length,
      data: {
        newArrivals,
        popularItems,
        specialItems,
        regularItems,
      },
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching food items",
      error: error.message,
    });
  }
});

export const getAdminFoodItems = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const search = req.query.search || "";
  if (!adminId) {
    throw new AppError("Unauthorized: You are not authorized", 403);
  }
  try {
    const foodItems = await FoodItem.findAll({
      where: {
        adminId,
        ...(search && {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        }),
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!foodItems.length) {
      return res.status(404).json({
        success: false,
        message: "No food items found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      count: foodItems.length,
      data: foodItems,
    });
  } catch (error) {
    console.error("Error fetching admin's food items:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching food items",
      error: error.message,
    });
  }
});

export const createItem = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const {
    name,
    category_id,
    price,
    image_url,
    time,
    enable_quantity_options = false,
    quarter_price = null,
    half_price = null,
    full_price = null,
    offer = null,
    description = null,
    special = false,
    popular = false,
    new_arrival = false,
  } = req.body;

  if (!adminId) {
    throw new AppError("Unauthorized: You are not authorized", 403);
  }

  if (!name || !category_id || !time) {
    throw new AppError("Name, category, price, and time are required", 400);
  }

  const category = await Category.findByPk(category_id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const item = await FoodItem.create({
    name,
    categoryId: category_id,
    price,
    image_url,
    time,
    enable_quantity_options,
    quarter_price,
    half_price,
    full_price,
    offer,
    description,
    adminId,
    special,
    popular,
    new_arrival,
  });
  const createdItem = await FoodItem.findByPk(item.id, {
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Item added successfully",
    data: createdItem,
  });
});

export const editItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category_id,
    price,
    image_url,
    time,
    enable_quantity_options,
    quarter_price,
    half_price,
    full_price,
    offer,
    description,
    special,
    popular,
    new_arrival,
  } = req.body;

  const item = await FoodItem.findByPk(id);
  if (!item) {
    throw new AppError("Food item not found", 404);
  }

  if (category_id) {
    const category = await Category.findByPk(category_id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  await item.update({
    name: name ?? item.name,
    categoryId: category_id ?? item.categoryId,
    price: price ?? item.price,
    image_url: image_url ?? item.image_url,
    time: time ?? item.time,
    enable_quantity_options:
      enable_quantity_options ?? item.enable_quantity_options,
    quarter_price: quarter_price ?? item.quarter_price,
    half_price: half_price ?? item.half_price,
    full_price: full_price ?? item.full_price,
    offer: offer ?? item.offer,
    description: description ?? item.description,
    special: special ?? item.special,
    popular: popular ?? item.popular,
    new_arrival: new_arrival ?? item.new_arrival,
  });

  const updatedItem = await FoodItem.findByPk(id, {
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
  });

  res.status(200).json({
    success: true,
    message: "Item updated successfully",
    data: updatedItem,
  });
});

export const updateItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let { available } = req.body;

  if (available === undefined) {
    throw new AppError("Available status is required", 400);
  }
  available = available === "true" || available === true;
  const item = await FoodItem.findByPk(id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }
  await item.update({ available });
  res.status(200).json({
    success: true,
    message: "Item availability updated successfully",
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
