'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { OrderStatusTimeline } from '@/components/student/OrderStatusTimeline';
import { PickupCountdownCard } from '@/components/student/PickupCountdownCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useOrderSocket } from '@/lib/socket/useSocket';
import {
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const { showToast } = useToast();
  const orderId = typeof params.id === 'string' ? params.id : '';

  const [order, setOrder] = useState<Order | null>(() => orderService.getById(orderId) || null);
  const [isLoading, setIsLoading] = useState(!order);

  const refreshOrder = useCallback(async () => {
    try {
      const live = await orderService.fetchOrderById(orderId);
      if (live) setOrder({ ...live });
    } catch {
      // keep existing
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    refreshOrder();
  }, [refreshOrder]);

  // Real-time Socket.IO subscription for this order
  useOrderSocket(order?.id || orderId, (data) => {
    if (data && (data.id === orderId || data._id === orderId)) {
      setOrder((prev) => {
        if (prev?.status !== data.status) {
          showToast({
            type: data.status === 'READY_FOR_PICKUP' ? 'success' : 'info',
            title: `Order Status: ${data.status.replace('_', ' ')}`,
            message: `Ticket #${data.tokenNumber || data.id} is now ${data.status}`,
          });
        }
        return { ...data };
      });
    }
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-4 bg-[#EDEDEB] rounded w-32" />
          <div className="bg-white rounded-2xl border border-[#E5E7EB] h-64" />
          <div className="bg-white rounded-2xl border border-[#E5E7EB] h-48" />
        </div>
      </StudentLayout>
    );
  }

  if (!order) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-[#252525]">Order #{orderId} not found</h2>
          <p className="text-[#737373] text-sm mt-1">This order does not exist or may have expired.</p>
          <Link href="/student/dashboard" className="mt-4 inline-block text-sm font-semibold text-[#252525] underline">
            Return to Dashboard
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#252525] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Main Status Header Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#737373]">
                Live Kitchen Tracker
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-bold text-[#252525]">Order #{order.orderNumber || order.id}</h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Placed at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • Window: <span className="font-semibold text-[#252525]">{order.pickupSlot.label}</span>
              </p>
            </div>

            {/* Token Badge */}
            <div className="px-5 py-3 rounded-xl bg-[#EDEDEB] border border-[#E5E7EB] text-center flex-shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                Counter Token
              </span>
              <span className="text-2xl font-mono font-bold text-[#252525]">
                {order.tokenNumber}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <OrderStatusTimeline
            status={order.status}
            createdAt={order.createdAt}
            readyAt={order.readyAt}
            collectedAt={order.collectedAt}
          />
        </div>

        {/* READY FOR PICKUP: Countdown, Deadline, and Late Fee Notice */}
        {order.status === 'READY_FOR_PICKUP' && (
          <PickupCountdownCard
            order={order}
            onOrderUpdated={(updated) => setOrder({ ...updated })}
          />
        )}

        {/* COMPLETED / PICKED UP State */}
        {order.status === 'PICKED_UP' && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 text-center text-[#15803D] space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#10B981]" />
            <h3 className="font-bold text-base">Order Successfully Collected!</h3>
            <p className="text-xs text-[#15803D]/80 max-w-md mx-auto">
              Food collected from Counter #2. We hope you enjoyed your meal without waiting in the lunch queue!
            </p>
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] uppercase tracking-wider">
              Tray Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
            <span className="text-xs text-[#737373]">Counter #2 Express Line</span>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {order.items.map((i, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-[#252525] text-sm">
                    {i.menuItem.name} <span className="text-[#737373] font-normal">× {i.quantity}</span>
                  </p>
                  {i.customizations && (
                    <p className="text-[11px] text-[#737373] mt-0.5">{i.customizations.join(', ')}</p>
                  )}
                </div>
                <span className="font-bold text-[#252525]">
                  ₹{i.menuItem.price * i.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] space-y-1.5 text-xs text-[#737373]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging & Tax</span>
              <span>₹{order.packagingFee + order.tax}</span>
            </div>
            {order.lateFeeApplied > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Late Pickup Fee</span>
                <span>+₹{order.lateFeeApplied}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#E5E7EB] flex justify-between text-sm font-bold text-[#252525]">
              <span>Total Paid</span>
              <span className="text-base text-[#252525]">₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
