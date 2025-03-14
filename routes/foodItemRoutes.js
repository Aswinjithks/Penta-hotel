import express from 'express';
import * as foodItemController from '../controllers/foodItemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", foodItemController.getAllItems);
router.post("/", protect, foodItemController.createItem);
router.put("/:id/availability", protect, foodItemController.updateItemAvailability);
router.delete("/:id", protect, foodItemController.deleteItem);

export default router;