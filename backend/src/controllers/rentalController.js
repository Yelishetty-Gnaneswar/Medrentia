import Rental from '../models/Rental.js';
import Equipment from '../models/Equipment.js';
import Notification from '../models/Notification.js';

// @desc    Get user's rentals (customer or provider)
// @route   GET /api/rentals
// @access  Private
export const getRentals = async (req, res, next) => {
  try {
    let query = {};
    const { status } = req.query;

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user.id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('equipment')
      .populate('customer', 'name email phone profileImage address')
      .populate('provider', 'name companyName email phone')
      .populate('order')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single rental details
// @route   GET /api/rentals/:id
// @access  Private
export const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('equipment')
      .populate('customer', 'name email phone address')
      .populate('provider', 'name companyName email phone')
      .populate('order');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: rental,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Extend active rental duration
// @route   PUT /api/rentals/:id/extend
// @access  Private
export const extendRental = async (req, res, next) => {
  try {
    const { extensionDays, extensionPeriod = 'weekly', additionalFee = 0 } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental record not found',
      });
    }

    const currentEndDate = new Date(rental.endDate);
    const newEndDate = new Date(currentEndDate);
    const daysToAdd = extensionDays || (extensionPeriod === 'daily' ? 1 : extensionPeriod === 'weekly' ? 7 : 30);
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    rental.extensions.push({
      previousEndDate: currentEndDate,
      newEndDate: newEndDate,
      additionalFee: Number(additionalFee),
      extensionPeriod,
    });

    rental.endDate = newEndDate;
    rental.status = 'Extended';
    rental.rentalFee += Number(additionalFee);
    await rental.save();

    // Create Notification
    await Notification.create({
      recipient: rental.provider,
      title: 'Rental Extended by Customer',
      message: `${req.user.name} extended rental for "${rental.equipmentName}" until ${newEndDate.toLocaleDateString('en-IN')}.`,
      type: 'Rental Starting',
    });

    res.status(200).json({
      success: true,
      message: `Rental successfully extended to ${newEndDate.toLocaleDateString('en-IN')}`,
      data: rental,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request return or mark rental returned
// @route   PUT /api/rentals/:id/return
// @access  Private
export const returnRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }

    if (req.user.role === 'customer') {
      rental.status = 'Return Requested';
      await rental.save();

      await Notification.create({
        recipient: rental.provider,
        title: 'Equipment Return Requested',
        message: `${req.user.name} has requested return pickup for "${rental.equipmentName}".`,
        type: 'Return Reminder',
      });

      return res.status(200).json({
        success: true,
        message: 'Equipment return request submitted. MedRentia logistics team will coordinate pickup.',
        data: rental,
      });
    }

    // If provider marks returned
    if (req.user.role === 'provider' || req.user.role === 'admin') {
      rental.status = 'Returned';
      rental.returnDate = new Date();
      rental.depositRefundStatus = 'Refund Initiated';
      await rental.save();

      // Restock equipment available inventory
      await Equipment.findByIdAndUpdate(rental.equipment, {
        $inc: { availableQuantity: 1, rentedQuantity: -1 },
        $set: { lastSanitized: new Date() },
      });

      await Notification.create({
        recipient: rental.customer,
        title: 'Equipment Return Inspected & Accepted',
        message: `Your return of "${rental.equipmentName}" is confirmed. Security deposit of ₹${rental.depositAmount} refund is initiated.`,
        type: 'Delivery Update',
      });

      return res.status(200).json({
        success: true,
        message: 'Rental marked as returned and inventory restocked',
        data: rental,
      });
    }
  } catch (err) {
    next(err);
  }
};
