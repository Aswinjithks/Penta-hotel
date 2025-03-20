import db from "../models/index.js";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { Table } = db;

export const getAllTables = asyncHandler(async (req, res) => {
  const adminId = req.admin.id;
  const tables = await Table.findAll({
    where: { adminId },
    attributes: ["id", "number", "qr_code_url", "token","capacity","table_name"],
  });
  res.json({
    success: true,
    data: tables,
  });
});

export const getTableQR = asyncHandler(async (req, res) => {
  const { number } = req.params;
  const table = await Table.findOne({
    where: { number },
    attributes: ["qr_code_url"],
  });
  if (!table) {
    throw new AppError("Table not found", 404);
  }
  res.json({
    success: true,
    data: { qr_code_url: table.qr_code_url },
  });
});

export const createTable = asyncHandler(async (req, res) => {
  let { number, capacity, table_name } = req.body;
  const adminId = req.admin.id;
  number = parseInt(number, 10);
  capacity = parseInt(capacity, 10);

  if (!number || isNaN(number) || number < 1) {
    throw new AppError("Valid table number is required", 400);
  }

  if (!capacity || isNaN(capacity) || capacity < 1) {
    throw new AppError("Valid table capacity is required", 400);
  }

  if (
    !table_name ||
    typeof table_name !== "string" ||
    table_name.trim() === ""
  ) {
    throw new AppError("Valid table name is required", 400);
  }

  const token = uuidv4();
  const tableUrl = `${process.env.FRONTEND_URL}/order?token=${token}`;
  const qrCode = await QRCode.toDataURL(tableUrl);

  try {
    const existingTable = await Table.findOne({
      where: {
        number,
        adminId,
      },
    });
    if (existingTable) {
      throw new AppError("You already have a table with this number", 400);
    }
    const table = await Table.create({
      number,
      capacity,
      table_name,
      token,
      qr_code_url: qrCode,
      adminId,
    });

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new AppError("You already have a table with this number", 400);
    }
    throw error;
  }
});

export const updateTable = asyncHandler(async (req, res) => {
  let { number, capacity, table_name } = req.body;
  const { id } = req.params;
  const adminId = req.admin.id;
  number = parseInt(number, 10);
  capacity = parseInt(capacity, 10);

  if (!number || isNaN(number) || number < 1) {
    throw new AppError("Valid table number is required", 400);
  }

  if (!capacity || isNaN(capacity) || capacity < 1) {
    throw new AppError("Valid table capacity is required", 400);
  }

  if (
    !table_name ||
    typeof table_name !== "string" ||
    table_name.trim() === ""
  ) {
    throw new AppError("Valid table name is required", 400);
  }

  try {
    const table = await Table.findByPk(id);
    if (!table || table.adminId !== adminId) {
      throw new AppError("Table not found", 404);
    }

    const existingTable = await Table.findOne({
      where: {
        number,
        adminId,
      },
    });
    if (existingTable && existingTable.id !== parseInt(id, 10)) {
      throw new AppError("You already have a table with this number", 400);
    }

    const token = uuidv4();
    const tableUrl = `${process.env.FRONTEND_URL}/order?token=${token}`;
    const qrCode = await QRCode.toDataURL(tableUrl);

    table.number = number;
    table.capacity = capacity;
    table.table_name = table_name;
    table.token = token;
    table.qr_code_url = qrCode;
    await table.save();

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new AppError("You already have a table with this number", 400);
    }
    throw error;
  }
});

export const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await Table.findByPk(id);
  if (!table) {
    throw new AppError("Table not found", 404);
  }
  await table.destroy();
  res.json({
    success: true,
    message: "Table deleted successfully",
  });
});
