import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { Order } from '../models';

let io: Server | null = null;

interface SocketUser {
  id: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
}

export const initSocket = (httpServer: HttpServer): Server => {
  const allowedOrigins = env.CLIENT_URL
    ? env.CLIENT_URL.split(',').map((u) => u.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware for incoming socket connections
  io.use((socket: Socket, next) => {
    try {
      let token: string | undefined;

      // 1. Try handshake auth object
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // 2. Try handshake headers cookie
      if (!token && socket.handshake.headers.cookie) {
        const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        token = parsedCookies.token;
      }

      // 3. Try Authorization header
      if (!token && socket.handshake.headers.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as SocketUser;
          socket.data.user = decoded;
        } catch {
          // Token is invalid/expired, connection proceeds as guest/anonymous
          logger.warn(`Socket handshake token verification failed for socket ${socket.id}`);
        }
      }

      return next();
    } catch (err) {
      logger.error('Socket authentication error:', err);
      return next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as SocketUser | undefined;

    if (user) {
      logger.info(`Socket connected: ${socket.id} (User: ${user.email}, Role: ${user.role})`);

      // Join user-specific private room
      socket.join(`user:${user.id}`);
      socket.join(`student:${user.id}`);

      // Join role rooms
      if (user.role === 'staff' || user.role === 'admin') {
        socket.join('staff');
      }
      if (user.role === 'admin') {
        socket.join('admin');
      }
    } else {
      logger.info(`Guest socket connected: ${socket.id}`);
    }

    // Client can request to join order room for live tracking (with server-side authorization)
    socket.on('join:order', async (orderId: string, callback?: (res: { success: boolean; error?: string; orderId?: string; orderNumber?: string }) => void) => {
      try {
        if (!orderId || typeof orderId !== 'string') {
          socket.emit('error:bad_request', { message: 'Invalid or missing order identifier' });
          callback?.({ success: false, error: 'Invalid or missing order identifier' });
          return;
        }

        const user = socket.data.user as SocketUser | undefined;
        if (!user) {
          logger.warn(`Unauthenticated socket ${socket.id} attempted to join order room for ID: ${orderId}`);
          socket.emit('error:unauthorized', { message: 'Authentication required to join order room' });
          callback?.({ success: false, error: 'Authentication required' });
          return;
        }

        // Query the order by ObjectId or human-readable orderNumber
        const query = mongoose.isValidObjectId(orderId)
          ? { _id: orderId }
          : { orderNumber: orderId };

        const order = await Order.findOne(query);
        if (!order) {
          logger.warn(`Socket ${socket.id} (user: ${user.email}) requested non-existent order: ${orderId}`);
          socket.emit('error:not_found', { message: 'Order not found' });
          callback?.({ success: false, error: 'Order not found' });
          return;
        }

        // Verify authorization:
        // - Staff and Admin have operational authority to view any order
        // - Students may ONLY join order rooms for orders they placed
        const isAuthorized =
          user.role === 'staff' ||
          user.role === 'admin' ||
          (user.role === 'student' && order.student.toString() === user.id);

        if (!isAuthorized) {
          logger.warn(
            `Unauthorized subscription rejected: User ${user.email} (Role: ${user.role}, ID: ${user.id}) attempted to join order:${order._id} owned by student:${order.student}`
          );
          socket.emit('error:forbidden', { message: 'Forbidden: You do not have permission to join this order room' });
          callback?.({ success: false, error: 'Forbidden: Insufficient permissions' });
          return;
        }

        // Successfully authorized: join both MongoDB ID and orderNumber rooms for guaranteed event reachability
        socket.join(`order:${order._id.toString()}`);
        socket.join(`order:${order.orderNumber}`);

        logger.info(
          `Socket ${socket.id} (${user.email}, ${user.role}) authorized and joined rooms for order ${order.orderNumber} (${order._id})`
        );

        callback?.({
          success: true,
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        });
      } catch (err: any) {
        logger.error(`Error in join:order handler for socket ${socket.id}:`, err);
        socket.emit('error:server', { message: 'Internal server error while joining order room' });
        callback?.({ success: false, error: 'Internal server error' });
      }
    });

    socket.on('leave:order', (orderId: string, callback?: (res: { success: boolean }) => void) => {
      if (orderId && typeof orderId === 'string') {
        socket.leave(`order:${orderId}`);
        logger.debug(`Socket ${socket.id} left room order:${orderId}`);
        callback?.({ success: true });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  logger.info('Socket.IO Gateway Server initialized successfully');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet. Call initSocket first.');
  }
  return io;
};
