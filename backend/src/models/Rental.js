import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
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
      required: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    equipmentName: String,
    equipmentImage: String,
    categoryName: String,
    rentalDuration: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'sixMonth', 'yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    originalEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Expiring Soon', 'Completed', 'Extended', 'Return Requested', 'Returned', 'Cancelled'],
      default: 'Active',
    },
    rentalFee: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      required: true,
    },
    depositRefundStatus: {
      type: String,
      enum: ['Held', 'Refund Initiated', 'Refunded', 'Forfeited'],
      default: 'Held',
    },
    extensions: [
      {
        extendedOn: { type: Date, default: Date.now },
        previousEndDate: Date,
        newEndDate: Date,
        additionalFee: Number,
        extensionPeriod: String,
      },
    ],
    returnDate: Date,
    returnCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Damaged', 'Pending Inspection'],
      default: 'Pending Inspection',
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Rental', rentalSchema);
