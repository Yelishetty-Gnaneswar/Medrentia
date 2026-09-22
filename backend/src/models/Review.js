import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comments'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    hygieneRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    verifiedRental: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating for equipment
reviewSchema.statics.getAverageRating = async function (equipmentId) {
  const obj = await this.aggregate([
    {
      $match: { equipment: equipmentId },
    },
    {
      $group: {
        _id: '$equipment',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('Equipment').findByIdAndUpdate(equipmentId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewCount: obj[0].reviewCount,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.equipment);
});

export default mongoose.model('Review', reviewSchema);
