import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

const { Admin } = db;

export const protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Access denied. No authentication token provided", 401);
  }
  
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError("Access denied. Token not found", 401);
  }
  
  // 2) Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3) Check if admin exists
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      throw new AppError("The admin belonging to this token no longer exists", 401);
    }
    
    // 4) Grant access to protected route
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401);
    } else if (err.name === "TokenExpiredError") {
      throw new AppError("Token expired", 401);
    }
    throw err;
  }
});
