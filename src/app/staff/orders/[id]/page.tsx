'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  ChevronLeft,
  User,
  Phone,
  Check,
  ChefHat,
} from 'lucide-react';

export default function StaffOrderDetailsPage() {
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
      <StaffLayout>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-[#252525]">Order not found</h2>
          <p className="text-[#737373] text-sm mt-1">Order #{orderId} could not be loaded.</p>
          <Link href="/staff/dashboard" className="mt-4 inline-block text-sm font-semibold text-[#252525] underline">
            Return to Command Center
          </Link>
        </div>
      </StaffLayout>
    );
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    const updated = await orderService.updateStatus(order.id, newStatus);
    if (updated) {
      setOrder({ ...updated });
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Order #${order.id} is now ${newStatus}`,
      });
    }
  };

  return (
    <StaffLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#252525] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>

        {/* Header Ticket Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#737373]">
                Ticket Details
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-bold text-[#252525]">Order #{order.id}</h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Requested Slot: <span className="font-semibold text-[#252525]">{order.pickupSlot.label}</span>
              </p>
            </div>

            <div className="px-5 py-3 rounded-xl bg-[#252525] text-white text-center flex-shrink-0 font-mono">
              <span className="text-[10px] uppercase tracking-wider text-[#EDEDEB] font-bold block">
                Token
              </span>
              <span className="text-2xl font-bold">{order.tokenNumber}</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#EDEDEB] text-xs">
            <div>
              <span className="text-[#737373] block">Student Customer</span>
              <span className="font-bold text-sm text-[#252525] mt-0.5 block flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#737373]" />
                {order.studentName} ({order.studentRollNo})
              </span>
            </div>
            <div>
              <span className="text-[#737373] block">Contact Phone</span>
              <span className="font-semibold text-[#252525] mt-0.5 block flex items-center gap-1.5 font-mono">
                <Phone className="w-4 h-4 text-[#737373]" />
                {order.studentPhone}
              </span>
            </div>
          </div>

          {/* Items to Cook */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#737373] mb-3">
              Items Breakdown
            </h3>
            <div className="divide-y divide-[#E5E7EB]">
              {order.items.map((i, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#252525] text-sm">
                      {i.menuItem.name} <span className="text-[#252525]">× {i.quantity}</span>
                    </span>
                    {i.customizations && (
                      <p className="text-[11px] text-amber-900 mt-1 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        Notes: {i.customizations.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#252525]">
                    ₹{i.menuItem.price * i.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Staff action buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
            {order.status === 'ACCEPTED' && (
              <Button
                onClick={() => handleStatusUpdate('PREPARING')}
                variant="primary"
                size="md"
                leftIcon={<ChefHat className="w-4 h-4" />}
              >
                Start Cooking
              </Button>
            )}

            {order.status === 'PREPARING' && (
              <Button
                onClick={() => handleStatusUpdate('READY_FOR_PICKUP')}
                variant="primary"
                size="md"
                leftIcon={<Check className="w-4 h-4" />}
              >
                Mark Ready for Pickup
              </Button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <Button
                onClick={() => handleStatusUpdate('PICKED_UP')}
                variant="primary"
                size="md"
                leftIcon={<Check className="w-4 h-4" />}
              >
                Confirm Collection Handover
              </Button>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
