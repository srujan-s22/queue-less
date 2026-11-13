import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IAuditLogWorkerDoc extends Document {
  actorId?: Types.ObjectId;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const AuditLogWorkerSchema = new Schema<IAuditLogWorkerDoc>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const AuditLogWorker: Model<IAuditLogWorkerDoc> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogWorkerDoc>('AuditLog', AuditLogWorkerSchema);
