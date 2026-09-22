import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide equipment name'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify category'],
    },
    categoryName: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short summary description'],
      maxlength: [250, 'Short description cannot exceed 250 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
    },
    images: {
      type: [String],
      required: [true, 'At least one equipment image is required'],
      validate: [v => v.length > 0, 'Equipment must have at least one image'],
    },
    // Multi-tier Rental Prices in Indian Rupees (₹)
    dailyPrice: {
      type: Number,
      required: [true, 'Please provide daily rental price (₹)'],
      min: [0, 'Price must be positive'],
    },
    weeklyPrice: {
      type: Number,
      required: [true, 'Please provide weekly rental price (₹)'],
      min: [0, 'Price must be positive'],
    },
    monthlyPrice: {
      type: Number,
      required: [true, 'Please provide monthly rental price (₹)'],
      min: [0, 'Price must be positive'],
    },
    sixMonthPrice: {
      type: Number,
      default: function () {
        return Math.round(this.monthlyPrice * 5.2);
      },
    },
    yearlyPrice: {
      type: Number,
      default: function () {
        return Math.round(this.monthlyPrice * 9.5);
      },
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please specify security deposit (₹)'],
      default: 1000,
    },
    deliveryFee: {
      type: Number,
      default: 150,
    },
    // Inventory Management
    quantity: {
      type: Number,
      required: [true, 'Please specify total quantity'],
      min: [1, 'Quantity must be at least 1'],
      default: 5,
    },
    availableQuantity: {
      type: Number,
      default: 5,
    },
    rentedQuantity: {
      type: Number,
      default: 0,
    },
    maintenanceQuantity: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      enum: ['Brand New', 'Excellent', 'Certified Refurbished', 'Good'],
      default: 'Excellent',
    },
    availability: {
      type: String,
      enum: ['Available', 'Rented Out', 'Under Maintenance', 'Out of Stock'],
      default: 'Available',
    },
    hygieneStatus: {
      type: String,
      enum: ['Certified Sanitized & Sealed', 'Under Sterilization', 'Inspection Needed'],
      default: 'Certified Sanitized & Sealed',
    },
    location: {
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '560001' },
      area: { type: String, default: 'Indiranagar' },
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerName: {
      type: String,
      default: 'MedRentia Verified Provider',
    },
    features: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalRentals: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    lastSanitized: {
      type: Date,
      default: Date.now,
    },
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
    nextMaintenance: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast searching and filtering
equipmentSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });
equipmentSchema.index({ category: 1, availability: 1, dailyPrice: 1 });
equipmentSchema.index({ 'location.city': 1 });

equipmentSchema.pre('save', function (next) {
  if (this.name && !this.slug) {
    this.slug = `${this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
  }
  // Auto-sync availability status based on quantity
  if (this.availableQuantity <= 0) {
    this.availability = 'Out of Stock';
  } else if (this.maintenanceQuantity >= this.quantity) {
    this.availability = 'Under Maintenance';
  } else {
    this.availability = 'Available';
  }
  next();
});

export default mongoose.model('Equipment', equipmentSchema);
