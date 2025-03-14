import express from 'express';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import foodItemRoutes from './foodItemRoutes.js';
import tableRoutes from './tableRoutes.js';
import orderRoutes from './orderRoutes.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/items", foodItemRoutes);
router.use("/tables", tableRoutes);
router.use("/orders", orderRoutes);

export default router;