import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICanteenSettingsWorkerDoc extends Document {
  singletonKey: string;
  lateFeeAmount: number;
  isLateFeeEnabled: boolean;
  gracePeriodMinutes: number;
}

const CanteenSettingsWorkerSchema = new Schema<ICanteenSettingsWorkerDoc>(
  {
    singletonKey: { type: String, required: true, unique: true },
    lateFeeAmount: { type: Number, default: 20 },
    isLateFeeEnabled: { type: Boolean, default: true },
    gracePeriodMinutes: { type: Number, default: 10 },
  },
  {
    timestamps: true,
  }
);

export const CanteenSettingsWorker: Model<ICanteenSettingsWorkerDoc> =
  mongoose.models.CanteenSettings ||
  mongoose.model<ICanteenSettingsWorkerDoc>('CanteenSettings', CanteenSettingsWorkerSchema);
