import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrderWorkerDoc extends Document {
  orderNumber: string;
  tokenNumber: string;
  studentName: string;
  total: number;
  status: string;
  lateFeeApplied: number;
  readyAt?: Date;
  pickupDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderWorkerSchema = new Schema<IOrderWorkerDoc>(
  {
    orderNumber: { type: String, required: true },
    tokenNumber: { type: String, required: true },
    studentName: { type: String, required: true },
    total: { type: Number, required: true },
    status: { type: String, required: true, index: true },
    lateFeeApplied: { type: Number, default: 0, index: true },
    readyAt: { type: Date },
    pickupDeadline: { type: Date, index: true },
  },
  {
    timestamps: true,
  }
);

OrderWorkerSchema.index({ status: 1, pickupDeadline: 1, lateFeeApplied: 1 });

export const OrderWorker: Model<IOrderWorkerDoc> =
  mongoose.models.Order || mongoose.model<IOrderWorkerDoc>('Order', OrderWorkerSchema);
