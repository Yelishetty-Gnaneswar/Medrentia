import express from 'express';
import {
  getEquipment,
  getFeaturedEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  uploadEquipmentImage,
} from '../controllers/equipmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getEquipment);
router.get('/featured', getFeaturedEquipment);
router.get('/:id', getEquipmentById);

router.post(
  '/',
  protect,
  authorize('provider', 'admin'),
  createEquipment
);

router.put(
  '/:id',
  protect,
  authorize('provider', 'admin'),
  updateEquipment
);

router.delete(
  '/:id',
  protect,
  authorize('provider', 'admin'),
  deleteEquipment
);

router.post(
  '/upload-image',
  protect,
  authorize('provider', 'admin'),
  upload.single('image'),
  uploadEquipmentImage
);

export default router;
