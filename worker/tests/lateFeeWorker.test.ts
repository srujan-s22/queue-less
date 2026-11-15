import mongoose from 'mongoose';
import { env } from '../src/config/env';
import {
  OrderWorker,
  CanteenSettingsWorker,
  OrderStatusHistoryWorker,
  AuditLogWorker,
} from '../src/models';
import { processOverdueOrders } from '../src/services/lateFeeService';

describe('Background Worker — Late Fee Engine & Deadline Scanner', () => {
  let overdueOrderId: string;
  const initialTotal = 120;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const testMongoUri =
      process.env.TEST_MONGODB_URI ||
      (env.MONGODB_URI.endsWith('/queueless') ? `${env.MONGODB_URI}_test` : env.MONGODB_URI);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Ensure CanteenSettings exists with late fee enabled
    await CanteenSettingsWorker.findOneAndUpdate(
      { singletonKey: 'CANTEEN_GLOBAL_SETTINGS' },
      {
        singletonKey: 'CANTEEN_GLOBAL_SETTINGS',
        lateFeeAmount: 20,
        isLateFeeEnabled: true,
        gracePeriodMinutes: 10,
      },
      { upsert: true, new: true }
    );

    // Create a mock order that has exceeded its pickup deadline
    const deadlinePassed = new Date(Date.now() - 5 * 60 * 1000); // 5 mins ago
    const order = await OrderWorker.create({
      orderNumber: `TEST-OVERDUE-${Date.now()}`,
      tokenNumber: 'X-99',
      studentName: 'Overdue Student',
      total: initialTotal,
      status: 'READY_FOR_PICKUP',
      lateFeeApplied: 0,
      readyAt: new Date(Date.now() - 15 * 60 * 1000),
      pickupDeadline: deadlinePassed,
    });

    overdueOrderId = order._id.toString();
  });

  afterAll(async () => {
    if (overdueOrderId) {
      await OrderWorker.findByIdAndDelete(overdueOrderId);
      await OrderStatusHistoryWorker.deleteMany({ orderId: overdueOrderId });
      await AuditLogWorker.deleteMany({ resourceId: overdueOrderId });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('should scan and atomically apply late fee to overdue order', async () => {
    const processedCount = await processOverdueOrders();
    expect(processedCount).toBeGreaterThanOrEqual(1);

    const updated = await OrderWorker.findById(overdueOrderId);
    expect(updated).not.toBeNull();
    expect(updated!.lateFeeApplied).toBe(20);
    expect(updated!.total).toBe(initialTotal + 20);

    // Verify order status history entry
    const history = await OrderStatusHistoryWorker.findOne({
      orderId: updated!._id,
      actorRole: 'system_worker',
    });
    expect(history).not.toBeNull();
    expect(history!.reason).toContain('Late pickup penalty');

    // Verify audit log entry
    const audit = await AuditLogWorker.findOne({
      action: 'LATE_FEE_APPLIED',
      resourceId: overdueOrderId,
    });
    expect(audit).not.toBeNull();
    expect(audit!.metadata?.lateFeeAmount).toBe(20);
  });

  it('should guarantee exactly-once processing (idempotency check)', async () => {
    // Run the scan a second time
    const secondPassProcessed = await processOverdueOrders();

    // The order already had lateFeeApplied: 20, so it must NOT be processed again
    const checked = await OrderWorker.findById(overdueOrderId);
    expect(checked!.lateFeeApplied).toBe(20);
    expect(checked!.total).toBe(initialTotal + 20); // Still 140, never double-charged
  });
});
