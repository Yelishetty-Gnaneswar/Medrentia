import mongoose from 'mongoose';

const deliveryTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'Order Confirmed',
      'Preparing Equipment',
      'Sanitization & Quality Check',
      'Packed',
      'Out for Delivery',
      'Delivered',
      'Returned',
    ],
    required: true,
  },
  description: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  updatedBy: String,
});

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    currentStatus: {
      type: String,
      enum: [
        'Order Confirmed',
        'Preparing Equipment',
        'Sanitization & Quality Check',
        'Packed',
        'Out for Delivery',
        'Delivered',
        'Returned',
      ],
      default: 'Order Confirmed',
    },
    deliveryAgentName: {
      type: String,
      default: 'MedRentia Express Logistics',
    },
    deliveryAgentPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    trackingCode: {
      type: String,
      unique: true,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: Date,
    deliveryAddress: {
      street: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      contactPhone: String,
    },
    timeline: [deliveryTimelineSchema],
    sanitizationCertNumber: {
      type: String,
      default: () => 'MED-SAN-' + Math.floor(10000 + Math.random() * 90000),
    },
    sanitizationNotes: {
      type: String,
      default: 'Hospital-grade autoclaving & ultraviolet UV-C sterilization performed.',
    },
  },
  {
    timestamps: true,
  }
);

deliverySchema.pre('validate', function (next) {
  if (!this.trackingCode) {
    this.trackingCode = 'TRK-MED-' + Math.floor(100000 + Math.random() * 900000);
  }
  if (!this.estimatedDeliveryTime) {
    this.estimatedDeliveryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours standard
  }
  next();
});

export default mongoose.model('Delivery', deliverySchema);
