import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Payment Successful',
        'Order Confirmed',
        'Delivery Update',
        'Rental Starting',
        'Rental Expiring',
        'Return Reminder',
        'Payment Reminder',
        'Provider Rental Request',
        'Equipment Approval',
        'Maintenance Reminder',
        'General',
      ],
      default: 'General',
    },
    orderId: String,
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    link: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', notificationSchema);
