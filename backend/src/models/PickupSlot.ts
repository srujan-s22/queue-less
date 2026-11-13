import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPickupSlot extends Document {
  slotCode: string;
  startTime: string;
  endTime: string;
  label: string;
  maxCapacity: number;
  reservedCount: number;
  isActive: boolean;
  date: Date;
  isAvailable: boolean; // virtual
  createdAt: Date;
  updatedAt: Date;
}

const PickupSlotSchema = new Schema<IPickupSlot>(
  {
    slotCode: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 30,
      min: [1, 'Capacity must be at least 1'],
    },
    reservedCount: {
      type: Number,
      default: 0,
      min: [0, 'Reserved count cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index for slot on a specific service date
PickupSlotSchema.index({ date: 1, slotCode: 1 }, { unique: true });

// Virtual for real-time slot availability
PickupSlotSchema.virtual('isAvailable').get(function (this: IPickupSlot) {
  return this.isActive && this.reservedCount < this.maxCapacity;
});

export const PickupSlot: Model<IPickupSlot> =
  mongoose.models.PickupSlot || mongoose.model<IPickupSlot>('PickupSlot', PickupSlotSchema);
