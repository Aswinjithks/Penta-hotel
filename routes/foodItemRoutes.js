import express from 'express';
import * as foodItemController from '../controllers/foodItemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", protect, foodItemController.createItem);
router.get("/:tableId", foodItemController.getFoodItems); //User part
router.get("/",protect, foodItemController.getAdminFoodItems); //Admin part
router.put("/:id", protect, foodItemController.editItem); 
router.put("/:id/availability", protect, foodItemController.updateItemAvailability);
router.delete("/:id", protect, foodItemController.deleteItem);
router.get("/category", foodItemController.getByCategory);



export default router;