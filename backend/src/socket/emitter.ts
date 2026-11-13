import { getIO } from './index';
import { logger } from '../config/logger';

export const socketEmitter = {
  emitToAll: (event: string, data: any) => {
    try {
      getIO().emit(event, data);
    } catch {
      // Socket not initialized (e.g. during unit tests)
    }
  },

  emitToRoom: (room: string, event: string, data: any) => {
    try {
      getIO().to(room).emit(event, data);
    } catch {
      // Socket not initialized
    }
  },

  emitToStudent: (studentId: string, event: string, data: any) => {
    try {
      getIO().to(`student:${studentId}`).emit(event, data);
    } catch {
      // Socket not initialized
    }
  },

  emitToKitchen: (event: string, data: any) => {
    try {
      getIO().to('staff').emit(event, data);
    } catch {
      // Socket not initialized
    }
  },

  emitToAdmin: (event: string, data: any) => {
    try {
      getIO().to('admin').emit(event, data);
    } catch {
      // Socket not initialized
    }
  },

  emitOrderCreated: (order: any) => {
    try {
      const io = getIO();
      // Notify kitchen staff
      io.to('staff').emit('order:created', order);
      // Notify admin
      io.to('admin').emit('order:created', order);
      // Notify student
      if (order.student) {
        const studentId = order.student.toString();
        io.to(`student:${studentId}`).emit('order:created', order);
      }
      logger.info(`Socket event emitted: order:created (${order.orderNumber})`);
    } catch {
      // Socket not initialized
    }
  },

  emitOrderStatusUpdate: (order: any, previousStatus?: string) => {
    try {
      const io = getIO();
      const payload = {
        order,
        previousStatus,
        newStatus: order.status,
        timestamp: new Date().toISOString(),
      };

      // Emit specific event
      const eventMap: Record<string, string> = {
        ACCEPTED: 'order:accepted',
        PREPARING: 'order:preparing',
        READY_FOR_PICKUP: 'order:ready',
        PICKED_UP: 'order:picked-up',
        CANCELLED: 'order:cancelled',
        REJECTED: 'order:rejected',
      };

      const eventName = eventMap[order.status] || 'order:status_updated';

      // Emit to order room
      io.to(`order:${order._id}`).emit(eventName, payload);
      io.to(`order:${order._id}`).emit('order:status_updated', payload);

      // Emit to student private room
      if (order.student) {
        const studentId = order.student.toString();
        io.to(`student:${studentId}`).emit(eventName, payload);
        io.to(`student:${studentId}`).emit('order:status_updated', payload);
      }

      // Emit to kitchen staff & admin
      io.to('staff').emit(eventName, payload);
      io.to('staff').emit('order:status_updated', payload);
      io.to('admin').emit(eventName, payload);
      io.to('admin').emit('order:status_updated', payload);

      logger.info(`Socket event emitted: ${eventName} for ${order.orderNumber}`);
    } catch {
      // Socket not initialized
    }
  },

  emitMenuUpdated: (item: any) => {
    try {
      getIO().emit('menu:updated', item);
      logger.info(`Socket event emitted: menu:updated (${item.name})`);
    } catch {
      // Socket not initialized
    }
  },

  emitInventoryUpdated: (item: any) => {
    try {
      getIO().emit('inventory:updated', item);
      logger.info(`Socket event emitted: inventory:updated (${item.name} isAvailable=${item.isAvailable})`);
    } catch {
      // Socket not initialized
    }
  },

  emitSettingsUpdated: (settings: any) => {
    try {
      getIO().emit('settings:updated', settings);
      logger.info('Socket event emitted: settings:updated');
    } catch {
      // Socket not initialized
    }
  },
};
