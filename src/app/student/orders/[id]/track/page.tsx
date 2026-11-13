'use client';

import React, { useState, useEffect } from 'react';
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
import {
  ChevronLeft,
  FastForward,
  CheckCircle2,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const { showToast } = useToast();
  const orderId = typeof params.id === 'string' ? params.id : '';

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const found = orderService.getById(orderId);
      if (found) setOrder({ ...found });
    });
  }, [orderId]);

  if (!order) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-gray-800">Order #{orderId} not found</h2>
          <p className="text-gray-500 text-sm mt-1">This order does not exist or may have expired.</p>
          <Link href="/student/dashboard" className="mt-4 inline-block text-sm font-semibold text-[#1B4332] underline">
            Return to Dashboard
          </Link>
        </div>
      </StudentLayout>
    );
  }

  // Advance lifecycle simulation helper
  const handleAdvanceStatus = () => {
    const cycle: OrderStatus[] = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'PICKED_UP',
    ];
    const currentIndex = cycle.indexOf(order.status);
    if (currentIndex < cycle.length - 1) {
      const nextStatus = cycle[currentIndex + 1];
      const updated = orderService.updateStatus(order.id, nextStatus);
      if (updated) {
        setOrder({ ...updated });
        showToast({
          type: 'info',
          title: `Status Updated: ${nextStatus.replace('_', ' ')}`,
          message: `Order #${order.id} is now ${nextStatus}`,
        });
      }
    } else {
      // Loop back to PLACED for demo
      const updated = orderService.updateStatus(order.id, 'PLACED');
      if (updated) {
        setOrder({ ...updated });
        showToast({
          type: 'info',
          title: 'Status Reset to Placed',
          message: 'Simulation restarted for testing',
        });
      }
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525866] hover:text-[#1A1C1E] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>

          {/* Evaluation Simulation Button */}
          <Button
            onClick={handleAdvanceStatus}
            variant="outline"
            size="sm"
            leftIcon={<FastForward className="w-3.5 h-3.5 text-[#1B4332]" />}
          >
            Simulate Next Status ({order.status === 'PICKED_UP' ? 'Restart' : 'Advance'})
          </Button>
        </div>

        {/* Main Status Header Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#525866]">
                Live Kitchen Tracker
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-bold text-[#1A1C1E]">Order #{order.id}</h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-[#525866] mt-1">
                Placed at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • Window: <span className="font-semibold text-[#1A1C1E]">{order.pickupSlot.label}</span>
              </p>
            </div>

            {/* Token Badge */}
            <div className="px-5 py-3 rounded-2xl bg-[#EBF5EE] border border-[#1B4332]/20 text-center flex-shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-[#1B4332] font-semibold block">
                Counter Token
              </span>
              <span className="text-2xl font-mono font-bold text-[#1B4332]">
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
          <div className="bg-[#EBF5EE] border border-[#1B4332]/20 rounded-2xl p-5 text-center text-[#1B4332] space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#1B4332]" />
            <h3 className="font-bold text-base">Order Successfully Collected!</h3>
            <p className="text-xs text-[#1B4332]/80 max-w-md mx-auto">
              Food collected from Counter #2. We hope you enjoyed your meal without waiting in the lunch queue!
            </p>
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider">
              Tray Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
            <span className="text-xs text-[#525866]">Counter #2 Express Line</span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((i, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-[#1A1C1E] text-sm">
                    {i.menuItem.name} <span className="text-[#525866] font-normal">× {i.quantity}</span>
                  </p>
                  {i.customizations && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{i.customizations.join(', ')}</p>
                  )}
                </div>
                <span className="font-bold text-[#1A1C1E]">
                  ₹{i.menuItem.price * i.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-[#525866]">
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
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-[#1A1C1E]">
              <span>Total Paid</span>
              <span className="text-base text-[#1B4332]">₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
