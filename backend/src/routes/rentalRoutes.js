import express from 'express';
import {
  getRentals,
  getRentalById,
  extendRental,
  returnRental,
} from '../controllers/rentalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getRentals);
router.get('/:id', getRentalById);
router.put('/:id/extend', extendRental);
router.put('/:id/return', returnRental);

export default router;
