import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/", protect, categoryController.createCategory);

export default router;