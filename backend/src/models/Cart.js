import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
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
    default: 'weekly',
  },
  durationUnits: {
    type: Number,
    default: 1,
    min: 1,
  },
  rentalPrice: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 150,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  rentalStartDate: {
    type: Date,
    default: Date.now,
  },
  rentalEndDate: {
    type: Date,
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Cart', cartSchema);
