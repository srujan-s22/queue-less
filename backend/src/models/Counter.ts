import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ICounter extends Document {
  counterIdentifier: string;
  name: string;
  assignedCategories: string[];
  activeOperatorId?: Types.ObjectId;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CounterSchema = new Schema<ICounter>(
  {
    counterIdentifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    assignedCategories: {
      type: [String],
      default: [],
    },
    activeOperatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
