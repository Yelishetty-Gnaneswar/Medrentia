import express from 'express';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderReceiptPDF,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/receipt', getOrderReceiptPDF);

router.put('/:id/status', authorize('provider', 'admin'), updateOrderStatus);

export default router;
