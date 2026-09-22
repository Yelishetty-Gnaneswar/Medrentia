import express from 'express';
import { getEquipmentReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:equipmentId', getEquipmentReviews);
router.post('/', protect, createReview);

export default router;
