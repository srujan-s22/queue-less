import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IOrderStatusHistoryWorkerDoc extends Document {
  orderId: Types.ObjectId;
  previousStatus?: string;
  newStatus: string;
  actorRole: string;
  reason?: string;
  timestamp: Date;
}

const OrderStatusHistoryWorkerSchema = new Schema<IOrderStatusHistoryWorkerDoc>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    actorRole: { type: String, required: true },
    reason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const OrderStatusHistoryWorker: Model<IOrderStatusHistoryWorkerDoc> =
  mongoose.models.OrderStatusHistory ||
  mongoose.model<IOrderStatusHistoryWorkerDoc>('OrderStatusHistory', OrderStatusHistoryWorkerSchema);
