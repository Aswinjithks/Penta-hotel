import db from '../models/index.js';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

const { Table } = db;

export const getAllTables = asyncHandler(async (req, res) => {
  const tables = await Table.findAll({
    attributes: ["id", "number", "qr_code_url", "token"],
  });
  res.json({
    success: true,
    data: tables
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
    data: { qr_code_url: table.qr_code_url }
  });
});

export const createTable = asyncHandler(async (req, res) => {
  const { number } = req.body;
  if (!number) {
    throw new AppError("Table number is required", 400);
  }
  const existingTable = await Table.findOne({ where: { number } });
  if (existingTable) {
    throw new AppError("Table number already exists", 400);
  }
  const token = uuidv4();
  const tableUrl = `${process.env.FRONTEND_URL}/order?token=${token}`;
  const qrCode = await QRCode.toDataURL(tableUrl);
  const table = await Table.create({ 
    number, 
    token, 
    qr_code_url: qrCode 
  });
  res.status(201).json({
    success: true,
    message: "Table created successfully",
    data: table
  });
});

export const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { number } = req.body;
  
  if (!number) {
    throw new AppError("Table number is required", 400);
  }
  
  const table = await Table.findByPk(id);
  if (!table) {
    throw new AppError("Table not found", 404);
  }
  
  // Check if another table already has this number
  const existingTable = await Table.findOne({ where: { number } });
  if (existingTable && existingTable.id !== parseInt(id)) {
    throw new AppError("Table number already exists", 400);
  }
  
  table.number = number;
  await table.save();
  
  res.json({
    success: true,
    message: "Table updated successfully",
    data: table
  });
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
      message: "Table deleted successfully"
    });
  });
  