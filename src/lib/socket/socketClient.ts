import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../api/endpoints';
import { getAuthToken } from '../api/token';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (typeof window === 'undefined') {
    // Return a dummy object for SSR
    return {} as Socket;
  }

  if (!socketInstance) {
    const token = getAuthToken();
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      auth: token ? { token } : undefined,
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

export const updateSocketAuth = (token: string | null): void => {
  if (typeof window === 'undefined') return;

  if (socketInstance) {
    socketInstance.auth = token ? { token } : {};
    if (socketInstance.connected) {
      socketInstance.disconnect().connect();
    }
  } else if (token) {
    getSocket();
  }
};

export const disconnectSocket = (): void => {
  if (typeof window === 'undefined') return;

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
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
