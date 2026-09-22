import Review from '../models/Review.js';
import Rental from '../models/Rental.js';
import Equipment from '../models/Equipment.js';

// @desc    Get reviews for an equipment
// @route   GET /api/reviews/:equipmentId
// @access  Public
export const getEquipmentReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ equipment: req.params.equipmentId })
      .populate('customer', 'name profileImage')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new verified review
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { equipmentId, rating, title, comment, hygieneRating = 5, deliveryRating = 5 } = req.body;

    // Check if customer rented this equipment
    const rental = await Rental.findOne({
      customer: req.user.id,
      equipment: equipmentId,
    });

    if (!rental && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only customers who have rented this medical equipment can submit a verified review.',
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    const review = await Review.create({
      equipment: equipmentId,
      rental: rental ? rental._id : undefined,
      customer: req.user.id,
      customerName: req.user.name,
      provider: equipment.provider,
      rating: Number(rating),
      title,
      comment,
      hygieneRating: Number(hygieneRating),
      deliveryRating: Number(deliveryRating),
      verifiedRental: true,
    });

    if (rental) {
      rental.isReviewed = true;
      await rental.save();
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
