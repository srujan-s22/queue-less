import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { env } from '../config/env';
import { logger } from '../config/logger';

let io: Server | null = null;

interface SocketUser {
  id: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
}

export const initSocket = (httpServer: HttpServer): Server => {
  const allowedOrigins = env.CLIENT_URL
    ? env.CLIENT_URL.split(',').map((u) => u.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

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

    // Client can request to join order room for live tracking
    socket.on('join:order', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        logger.debug(`Socket ${socket.id} joined room order:${orderId}`);
      }
    });

    socket.on('leave:order', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
        logger.debug(`Socket ${socket.id} left room order:${orderId}`);
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
