import express from 'express';
import * as tableController from '../controllers/tableController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protect, tableController.getAllTables);
router.get("/:number/qr", protect, tableController.getTableQR);
router.post("/", protect, tableController.createTable);
router.put("/:id", protect, tableController.updateTable);
router.delete("/:id", protect, tableController.deleteTable);

export default router;