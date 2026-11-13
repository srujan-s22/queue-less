import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../api/endpoints';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (typeof window === 'undefined') {
    // Return a dummy object for SSR
    return {} as Socket;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[QueueLess Socket] Connected to real-time gateway:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[QueueLess Socket] Disconnected from real-time gateway:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[QueueLess Socket] Connection error:', error.message);
    });
  }

  return socketInstance;
};

export const joinOrderRoom = (orderId: string): void => {
  const socket = getSocket();
  if (socket && socket.emit) {
    socket.emit('join:order', orderId);
  }
};

export const leaveOrderRoom = (orderId: string): void => {
  const socket = getSocket();
  if (socket && socket.emit) {
    socket.emit('leave:order', orderId);
  }
};
