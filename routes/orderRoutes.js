import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protect, orderController.getAllOrders);
router.post("/", orderController.createOrder);
router.put("/:id", protect, orderController.updateOrderStatus);

export default router;