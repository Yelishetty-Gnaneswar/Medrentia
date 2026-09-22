import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    equipmentName: String,
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['Sterilization & Sanitization', 'Routine Calibration', 'Battery Replacement', 'Mechanical Repair', 'Safety Inspection'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Failed Inspection'],
      default: 'Scheduled',
    },
    technicianName: String,
    cost: {
      type: Number,
      default: 0,
    },
    notes: String,
    scheduledDate: {
      type: Date,
      required: true,
    },
    completionDate: Date,
    hygieneCertificateIssued: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Maintenance', maintenanceSchema);
