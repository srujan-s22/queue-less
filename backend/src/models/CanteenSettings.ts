import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ICanteenSettings extends Document {
  singletonKey: string;
  isOpen: boolean;
  operatingHours: {
    openTime: string;
    closeTime: string;
  };
  announcement?: string;
  slotIntervalMinutes: number;
  defaultSlotCapacity: number;
  packagingCharge: number;
  taxRatePercent: number;
  gracePeriodMinutes: number;
  lateFeeAmount: number;
  isLateFeeEnabled: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CanteenSettingsSchema = new Schema<ICanteenSettings>(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      default: 'CANTEEN_GLOBAL_SETTINGS',
      index: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      openTime: { type: String, default: '08:00 AM' },
      closeTime: { type: String, default: '07:00 PM' },
    },
    announcement: {
      type: String,
      default: '',
    },
    slotIntervalMinutes: {
      type: Number,
      default: 15,
      min: 5,
    },
    defaultSlotCapacity: {
      type: Number,
      default: 30,
      min: 1,
    },
    packagingCharge: {
      type: Number,
      default: 10,
      min: 0,
    },
    taxRatePercent: {
      type: Number,
      default: 5,
      min: 0,
    },
    gracePeriodMinutes: {
      type: Number,
      default: 10,
      min: 1,
    },
    lateFeeAmount: {
      type: Number,
      default: 20,
      min: 0,
    },
    isLateFeeEnabled: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const CanteenSettings: Model<ICanteenSettings> =
  mongoose.models.CanteenSettings ||
  mongoose.model<ICanteenSettings>('CanteenSettings', CanteenSettingsSchema);
