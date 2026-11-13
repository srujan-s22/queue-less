import {
  OrderWorker,
  CanteenSettingsWorker,
  OrderStatusHistoryWorker,
  AuditLogWorker,
} from '../models';
import { logger } from '../config/logger';

export const processOverdueOrders = async (): Promise<number> => {
  const settings = await CanteenSettingsWorker.findOne({
    singletonKey: 'CANTEEN_GLOBAL_SETTINGS',
  });

  if (settings && !settings.isLateFeeEnabled) {
    return 0;
  }

  const lateFeeAmount = settings ? settings.lateFeeAmount : 20;
  const now = new Date();

  // Find candidate orders that are READY_FOR_PICKUP, deadline passed, no fee applied yet
  const candidates = await OrderWorker.find({
    status: 'READY_FOR_PICKUP',
    pickupDeadline: { $lt: now },
    lateFeeApplied: 0,
  });

  if (candidates.length === 0) {
    return 0;
  }

  logger.info(`Found ${candidates.length} candidate overdue order(s) for late-fee assessment.`);
  let processedCount = 0;

  for (const candidate of candidates) {
    // Atomic update ensures exactly-once execution across multiple worker replicas
    const updatedOrder = await OrderWorker.findOneAndUpdate(
      {
        _id: candidate._id,
        status: 'READY_FOR_PICKUP',
        pickupDeadline: { $lt: now },
        lateFeeApplied: 0,
      },
      {
        $set: { lateFeeApplied: lateFeeAmount },
        $inc: { total: lateFeeAmount },
      },
      { new: true }
    );

    if (updatedOrder) {
      processedCount++;
      logger.info(
        `Applied late fee of ₹${lateFeeAmount} to Order ${updatedOrder.orderNumber} (New Total: ₹${updatedOrder.total})`
      );

      // Record Order History
      await OrderStatusHistoryWorker.create({
        orderId: updatedOrder._id,
        previousStatus: 'READY_FOR_PICKUP',
        newStatus: 'READY_FOR_PICKUP',
        actorRole: 'system_worker',
        reason: `Late pickup penalty fee of ₹${lateFeeAmount} applied after exceeding collection grace period.`,
        timestamp: new Date(),
      });

      // Record Audit Log
      await AuditLogWorker.create({
        actorRole: 'system_worker',
        action: 'LATE_FEE_APPLIED',
        resourceType: 'Order',
        resourceId: updatedOrder._id.toString(),
        metadata: {
          orderNumber: updatedOrder.orderNumber,
          lateFeeAmount,
          newTotal: updatedOrder.total,
          pickupDeadline: updatedOrder.pickupDeadline,
          processedAt: new Date(),
        },
        timestamp: new Date(),
      });
    }
  }

  return processedCount;
};
