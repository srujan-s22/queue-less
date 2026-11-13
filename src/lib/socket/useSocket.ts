'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from './socketClient';

export const useSocket = (
  eventName: string,
  callback: (data: any) => void
): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = getSocket();
    if (!socket || !socket.on) return;

    const handler = (data: any) => {
      savedCallback.current(data);
    };

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName]);
};

export const useOrderSocket = (
  orderId: string | undefined,
  callback: (data: any) => void
): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!orderId || typeof window === 'undefined') return;

    const socket = getSocket();
    if (!socket || !socket.on) return;

    socket.emit('join:order', orderId);

    const handler = (data: any) => {
      savedCallback.current(data);
    };

    socket.on('order:status_updated', handler);
    socket.on('order:accepted', handler);
    socket.on('order:preparing', handler);
    socket.on('order:ready', handler);
    socket.on('order:picked-up', handler);
    socket.on('order:cancelled', handler);
    socket.on('order:rejected', handler);

    return () => {
      socket.emit('leave:order', orderId);
      socket.off('order:status_updated', handler);
      socket.off('order:accepted', handler);
      socket.off('order:preparing', handler);
      socket.off('order:ready', handler);
      socket.off('order:picked-up', handler);
      socket.off('order:cancelled', handler);
      socket.off('order:rejected', handler);
    };
  }, [orderId]);
};
