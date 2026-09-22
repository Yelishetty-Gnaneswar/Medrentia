import express from 'express';
import {
  getProviderDashboard,
  getProviderAnalytics,
  getProviderEquipment,
} from '../controllers/providerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('provider', 'admin'));

router.get('/dashboard', getProviderDashboard);
router.get('/analytics', getProviderAnalytics);
router.get('/equipment', getProviderEquipment);

export default router;
