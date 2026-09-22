import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

// @desc    Get delivery tracking details by orderId or tracking code
// @route   GET /api/delivery/:orderId
// @access  Public / Private
export const getDeliveryByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    let delivery = await Delivery.findOne({
      $or: [{ orderId: orderId }, { trackingCode: orderId }],
    })
      .populate('order')
      .populate('customer', 'name email phone')
      .populate('provider', 'name companyName phone');

    if (!delivery) {
      // Check if order exists and create delivery if missing
      const order = await Order.findOne({ orderId }).populate('customer');
      if (order) {
        delivery = await Delivery.create({
          order: order._id,
          orderId: order.orderId,
          customer: order.customer._id,
          provider: order.items[0]?.provider,
          deliveryAddress: order.deliveryAddress,
          currentStatus: 'Order Confirmed',
          timeline: [
            {
              status: 'Order Confirmed',
              description: 'Payment verified and rental order placed.',
              completed: true,
              timestamp: order.createdAt,
            },
            {
              status: 'Preparing Equipment',
              description: 'Provider is retrieving equipment from clean storage.',
              completed: false,
            },
            {
              status: 'Sanitization & Quality Check',
              description: 'Hospital-grade autoclaving & digital sensor calibration.',
              completed: false,
            },
            {
              status: 'Packed',
              description: 'Hygienically packaged with safety seals.',
              completed: false,
            },
            {
              status: 'Out for Delivery',
              description: 'Dispatched with MedRentia Express Healthcare Logistics.',
              completed: false,
            },
            {
              status: 'Delivered',
              description: 'Equipment safely handed over and demonstration given.',
              completed: false,
            },
            {
              status: 'Returned',
              description: 'Rental concluded and equipment returned.',
              completed: false,
            },
          ],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Delivery tracking information not found for this order',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update delivery stage (Provider / Admin / Logistics)
// @route   PUT /api/delivery/:id/stage
// @access  Private (Provider/Admin)
export const updateDeliveryStage = async (req, res, next) => {
  try {
    const { status, description, deliveryAgentName, deliveryAgentPhone } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery record not found',
      });
    }

    delivery.currentStatus = status;
    if (deliveryAgentName) delivery.deliveryAgentName = deliveryAgentName;
    if (deliveryAgentPhone) delivery.deliveryAgentPhone = deliveryAgentPhone;

    // Update timeline
    let stageFound = false;
    delivery.timeline.forEach((item) => {
      if (item.status === status) {
        item.completed = true;
        item.timestamp = new Date();
        if (description) item.description = description;
        stageFound = true;
      }
    });

    if (!stageFound) {
      delivery.timeline.push({
        status,
        description: description || `Status updated to ${status}`,
        completed: true,
        timestamp: new Date(),
        updatedBy: req.user.name,
      });
    }

    if (status === 'Delivered') {
      delivery.actualDeliveryTime = new Date();
      await Order.findByIdAndUpdate(delivery.order, { orderStatus: 'Delivered' });
    }

    await delivery.save();

    // Send customer notification
    await Notification.create({
      recipient: delivery.customer,
      title: `Delivery Update: ${status}`,
      message: `Your medical equipment order #${delivery.orderId} is now: ${status}.`,
      type: 'Delivery Update',
      orderId: delivery.orderId,
    });

    res.status(200).json({
      success: true,
      message: `Delivery stage updated to "${status}"`,
      data: delivery,
    });
  } catch (err) {
    next(err);
  }
};
