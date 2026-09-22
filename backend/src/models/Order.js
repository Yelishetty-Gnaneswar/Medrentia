import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  categoryName: String,
  rentalDuration: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'sixMonth', 'yearly'],
    required: true,
  },
  durationUnits: { type: Number, default: 1 },
  rentalPrice: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  rentalStartDate: { type: Date, required: true },
  rentalEndDate: { type: Date, required: true },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerName: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    items: [orderItemSchema],
    deliveryAddress: {
      street: { type: String, required: true },
      landmark: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      contactPhone: { type: String, required: true },
      alternativePhone: String,
    },
    rentalFee: { type: Number, required: true },
    totalDeposit: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 }, // 18% GST or similar
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // in ₹
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Preparing', 'Sanitized & Quality Checked', 'Packed', 'Out for Delivery', 'Delivered', 'Active Rental', 'Completed', 'Cancelled'],
      default: 'Placed',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    invoiceUrl: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('validate', function (next) {
  if (!this.orderId) {
    this.orderId = 'MED-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

export default mongoose.model('Order', orderSchema);
