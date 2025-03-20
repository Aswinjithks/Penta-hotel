import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const { Admin } = db;

export const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }
  const existingAdmin = await Admin.findOne({ where: { username } });
  if (existingAdmin) {
    throw new AppError("Username already exists", 400);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ username, password_hash: hashedPassword });
  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }
  const admin = await Admin.findOne({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "10y" }
  );
  res.json({
    success: true,
    token,
  });
});
