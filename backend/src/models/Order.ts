import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'counter_cash' | 'campus_wallet' | 'upi';
export type PaymentStatus = 'pending' | 'collected' | 'refunded';

export interface IOrderItemSnapshot {
  menuItemId: Types.ObjectId;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedAddons: {
    name: string;
    price: number;
  }[];
  itemTotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  tokenNumber: string;
  student: Types.ObjectId;
  studentName: string;
  studentRollNo: string;
  studentPhone: string;
  items: IOrderItemSnapshot[];
  subtotal: number;
  tax: number;
  packagingFee: number;
  lateFeeApplied: number;
  total: number;
  status: OrderStatus;
  pickupSlot: Types.ObjectId;
  pickupSlotLabel: string;
  counterId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  readyAt?: Date;
  pickupDeadline?: Date;
  collectedAt?: Date;
  rejectionReason?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedAddons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    tokenNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentRollNo: {
      type: String,
      required: true,
      trim: true,
    },
    studentPhone: {
      type: String,
      default: '',
      trim: true,
    },
    items: {
      type: [OrderItemSnapshotSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'Order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    packagingFee: {
      type: Number,
      required: true,
      min: 0,
    },
    lateFeeApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'CANCELLED', 'REJECTED'],
      default: 'PLACED',
      index: true,
    },
    pickupSlot: {
      type: Schema.Types.ObjectId,
      ref: 'PickupSlot',
      required: true,
    },
    pickupSlotLabel: {
      type: String,
      required: true,
    },
    counterId: {
      type: String,
      default: 'COUNTER-01',
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['counter_cash', 'campus_wallet', 'upi'],
      default: 'counter_cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'collected', 'refunded'],
      default: 'pending',
    },
    readyAt: {
      type: Date,
    },
    pickupDeadline: {
      type: Date,
      index: true,
    },
    collectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
OrderSchema.index({ student: 1, createdAt: -1 });
// Compound index for background worker deadline scan:
OrderSchema.index({ status: 1, pickupDeadline: 1, lateFeeApplied: 1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
