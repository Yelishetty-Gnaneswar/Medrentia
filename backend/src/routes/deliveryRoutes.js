import express from 'express';
import {
  getDeliveryByOrderId,
  updateDeliveryStage,
} from '../controllers/deliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:orderId', getDeliveryByOrderId);
router.put(
  '/:id/stage',
  protect,
  authorize('provider', 'admin'),
  updateDeliveryStage
);

export default router;
