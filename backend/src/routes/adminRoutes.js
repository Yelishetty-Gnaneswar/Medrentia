import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  toggleUserStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

export default router;
