import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:tableId", categoryController.getAllCategories);
router.post("/", protect, categoryController.createCategory);
router.put("/:id", protect, categoryController.updateCategory);
router.delete("/:id", protect, categoryController.deleteCategory);
router.get("/admin/category", protect, categoryController.getCategoriesByAdminId);

export default router;
