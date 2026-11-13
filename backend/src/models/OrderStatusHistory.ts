import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type ActorRole = 'student' | 'staff' | 'admin' | 'system_worker';

export interface IOrderStatusHistory extends Document {
  orderId: Types.ObjectId;
  previousStatus?: string;
  newStatus: string;
  changedBy?: Types.ObjectId;
  actorRole: ActorRole;
  reason?: string;
  timestamp: Date;
}

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    actorRole: {
      type: String,
      enum: ['student', 'staff', 'admin', 'system_worker'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

OrderStatusHistorySchema.index({ orderId: 1, timestamp: -1 });

export const OrderStatusHistory: Model<IOrderStatusHistory> =
  mongoose.models.OrderStatusHistory ||
  mongoose.model<IOrderStatusHistory>('OrderStatusHistory', OrderStatusHistorySchema);
