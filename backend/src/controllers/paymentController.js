import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Rental from '../models/Rental.js';
import Delivery from '../models/Delivery.js';
import Equipment from '../models/Equipment.js';
import Cart from '../models/Cart.js';
import Notification from '../models/Notification.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';

// @desc    Create Razorpay Order from cart or direct checkout
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No rental items provided for payment checkout',
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required',
      });
    }

    let rentalFee = 0;
    let totalDeposit = 0;
    let deliveryFee = 150; // Flat or maximum delivery fee

    const orderItems = [];

    for (const item of items) {
      const equipment = await Equipment.findById(item.equipment?._id || item.equipment);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: `Equipment not found: ${item.equipmentName || item.name}`,
        });
      }

      if (equipment.availableQuantity < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `Not enough units available for ${equipment.name}`,
        });
      }

      const qty = item.quantity || 1;
      const itemRentalPrice = item.rentalPrice || equipment.dailyPrice * qty;
      const itemDeposit = (equipment.securityDeposit || 0) * qty;

      rentalFee += itemRentalPrice;
      totalDeposit += itemDeposit;

      orderItems.push({
        equipment: equipment._id,
        name: equipment.name,
        image: equipment.images[0],
        categoryName: equipment.categoryName,
        rentalDuration: item.rentalDuration || 'weekly',
        durationUnits: item.durationUnits || 1,
        rentalPrice: itemRentalPrice,
        securityDeposit: itemDeposit,
        quantity: qty,
        rentalStartDate: new Date(item.rentalStartDate || Date.now()),
        rentalEndDate: new Date(item.rentalEndDate || Date.now() + 7 * 24 * 60 * 60 * 1000),
        provider: equipment.provider,
        providerName: equipment.providerName,
      });
    }

    // 18% GST on rental fee only (security deposit is exempt from GST as it is refundable)
    const tax = Math.round(rentalFee * 0.18);
    const grandTotal = Math.round(rentalFee + totalDeposit + deliveryFee + tax);

    // Create unique internal Order first in pending state
    const order = await Order.create({
      customer: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      items: orderItems,
      deliveryAddress,
      rentalFee,
      totalDeposit,
      deliveryFee,
      tax,
      totalAmount: grandTotal,
      paymentStatus: 'pending',
      orderStatus: 'Placed',
      notes,
    });

    // Create Razorpay Order
    const rzpOrder = await createRazorpayOrder(
      grandTotal,
      `rcpt_${order.orderId}`,
      { dbOrderId: order._id.toString(), orderId: order.orderId }
    );

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        dbOrderId: order._id,
        razorpayOrderId: rzpOrder.id,
        amount: grandTotal,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_medrentia123',
        customer: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
        breakdown: {
          rentalFee,
          totalDeposit,
          deliveryFee,
          tax,
          grandTotal,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment Signature and finalize order
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      dbOrderId,
      paymentMethod = 'UPI',
    } = req.body;

    const order = await Order.findById(dbOrderId).populate('customer');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order record not found for payment verification',
      });
    }

    // Idempotency check: If order is already paid, return existing data without re-decrementing inventory
    if (order.paymentStatus === 'paid') {
      const existingPayment = await Payment.findOne({ order: order._id });
      const existingDelivery = await Delivery.findOne({ order: order._id });
      const existingRentals = await Rental.find({ order: order._id });
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and order confirmed',
        data: {
          order,
          payment: existingPayment,
          rentals: existingRentals,
          deliveryId: existingDelivery?._id,
          trackingCode: existingDelivery?.trackingCode,
        },
      });
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
      });
    }

    // Create Payment Record
    const payment = await Payment.create({
      order: order._id,
      orderId: order.orderId,
      customer: req.user.id,
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_med_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'simulated_sig',
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod,
      status: 'captured',
      receiptNumber: `REC-${order.orderId}`,
    });

    // Update Order
    order.paymentStatus = 'paid';
    order.orderStatus = 'Confirmed';
    order.paymentId = payment._id;
    order.razorpayPaymentId = payment.razorpayPaymentId;
    await order.save();

    // Create active Rental records and update equipment inventory
    const rentals = [];
    for (const item of order.items) {
      // Reduce available inventory, increase rented count
      await Equipment.findByIdAndUpdate(item.equipment, {
        $inc: {
          availableQuantity: -item.quantity,
          rentedQuantity: item.quantity,
          totalRentals: 1,
          totalRevenue: item.rentalPrice,
        },
      });

      const rental = await Rental.create({
        order: order._id,
        orderId: order.orderId,
        customer: req.user.id,
        provider: item.provider,
        equipment: item.equipment,
        equipmentName: item.name,
        equipmentImage: item.image,
        categoryName: item.categoryName,
        rentalDuration: item.rentalDuration,
        startDate: item.rentalStartDate,
        endDate: item.rentalEndDate,
        originalEndDate: item.rentalEndDate,
        rentalFee: item.rentalPrice,
        depositAmount: item.securityDeposit,
        status: 'Active',
      });
      rentals.push(rental);

      // Notify Equipment Provider
      await Notification.create({
        recipient: item.provider,
        title: 'New Equipment Rental Order!',
        message: `Your equipment "${item.name}" has been booked by ${req.user.name} for ${item.rentalDuration}. Order #${order.orderId}`,
        type: 'Provider Rental Request',
        orderId: order.orderId,
        equipmentId: item.equipment,
      });
    }

    // Create Initial 7-Stage Delivery Tracker
    const delivery = await Delivery.create({
      order: order._id,
      orderId: order.orderId,
      customer: req.user.id,
      provider: order.items[0]?.provider,
      currentStatus: 'Order Confirmed',
      deliveryAddress: order.deliveryAddress,
      timeline: [
        {
          status: 'Order Confirmed',
          description: 'Payment verified and rental order confirmed.',
          completed: true,
          timestamp: new Date(),
          updatedBy: 'MedRentia System',
        },
        {
          status: 'Preparing Equipment',
          description: 'Provider is retrieving equipment from clean storage.',
          completed: false,
        },
        {
          status: 'Sanitization & Quality Check',
          description: 'Performing high-grade hospital sterilization & digital sensor calibration.',
          completed: false,
        },
        {
          status: 'Packed',
          description: 'Sealed in hygienic protective medical packaging.',
          completed: false,
        },
        {
          status: 'Out for Delivery',
          description: 'Dispatched with MedRentia Express Healthcare Logistics.',
          completed: false,
        },
        {
          status: 'Delivered',
          description: 'Equipment safely handed over and demonstration completed.',
          completed: false,
        },
        {
          status: 'Returned',
          description: 'Rental period concluded and equipment returned to provider.',
          completed: false,
        },
      ],
    });

    // Clear Customer's Cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });

    // Send Notification to Customer
    await Notification.create({
      recipient: req.user.id,
      title: 'Payment Successful & Order Confirmed!',
      message: `Your order #${order.orderId} for ₹${order.totalAmount.toLocaleString('en-IN')} has been confirmed. Medical equipment is undergoing quality sterilization.`,
      type: 'Payment Successful',
      orderId: order.orderId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and rental order created',
      data: {
        order,
        payment,
        rentals,
        deliveryId: delivery._id,
        trackingCode: delivery.trackingCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { customer: req.user.id };
    const payments = await Payment.find(query).populate('order').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};
