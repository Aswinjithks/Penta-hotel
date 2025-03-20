import express from 'express';
import * as foodItemController from '../controllers/foodItemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", protect, foodItemController.createItem);
router.get("/", protect, foodItemController.getFoodItems);
router.put("/:id", protect, foodItemController.editItem); 
router.put("/:id/availability", protect, foodItemController.updateItemAvailability);
router.delete("/:id", protect, foodItemController.deleteItem);
router.get("/category", foodItemController.getByCategory);



export default router;