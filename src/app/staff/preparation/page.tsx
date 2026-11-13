'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { staffApi } from '@/lib/api/services/staffApi';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { useSocket } from '@/lib/socket/useSocket';
import { ChefHat, Check, Clock, User } from 'lucide-react';

export default function StaffPreparationPage() {
  const [orders, setOrders] = useState<Order[]>(() => {
    return orderService.getAll().filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING');
  });
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      const prep = await staffApi.getPreparation();
      if (prep && Array.isArray(prep)) {
        setOrders(prep);
        return;
      }
      const all = orderService.getAll();
      setOrders(all.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'));
    } catch {
      const all = orderService.getAll();
      setOrders(all.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'));
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useSocket('order:status_updated', () => { loadOrders(); });
  useSocket('order:accepted', () => { loadOrders(); });
  useSocket('order:cancelled', () => { loadOrders(); });

  const handleStartCooking = async (orderId: string) => {
    await orderService.updateStatus(orderId, 'PREPARING');
    await loadOrders();
    showToast({
      type: 'info',
      title: 'Cooking Started',
      message: `Order #${orderId} marked as PREPARING`,
    });
  };

  const handleMarkReady = async (orderId: string) => {
    await orderService.updateStatus(orderId, 'READY_FOR_PICKUP');
    await loadOrders();
    showToast({
      type: 'success',
      title: 'Order Ready for Pickup!',
      message: `Student notified via SMS for Order #${orderId}`,
    });
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
            Kitchen Preparation Queue ({orders.length})
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Orders currently accepted or on active cooking stations.
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const isCooking = order.status === 'PREPARING';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 shadow-2xs transition-all ${
                    isCooking ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#E5E7EB]'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-base px-2.5 py-1 rounded-lg text-white ${
                          isCooking ? 'bg-amber-600' : 'bg-[#252525]'
                        }`}
                      >
                        {order.tokenNumber}
                      </span>
                      <span className="text-xs font-semibold text-[#252525]">
                        #{order.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCooking
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isCooking ? 'Cooking Now' : 'Queued'}
                    </span>
                  </div>

                  {/* Student & Slot info */}
                  <div className="text-xs text-[#737373] bg-[#EDEDEB] p-2.5 rounded-xl space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-[#252525]">
                      <User className="w-3.5 h-3.5 text-[#737373]" />
                      {order.studentName} ({order.studentRollNo})
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-[#737373]">
                      <Clock className="w-3.5 h-3.5 text-[#737373]" />
                      Target Slot: <span className="font-semibold text-[#252525]">{order.pickupSlot.label}</span>
                    </p>
                  </div>

                  {/* Dishes */}
                  <div className="divide-y divide-[#E5E7EB] text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="py-2">
                        <div className="flex justify-between font-semibold text-[#252525]">
                          <span>{i.menuItem.name}</span>
                          <span className="text-[#252525]">× {i.quantity}</span>
                        </div>
                        {i.customizations && (
                          <p className="text-[10px] text-amber-800 mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                            {i.customizations.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    {!isCooking ? (
                      <Button
                        onClick={() => handleStartCooking(order.id)}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        leftIcon={<ChefHat className="w-4 h-4" />}
                      >
                        Start Cooking
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleMarkReady(order.id)}
                        variant="primary"
                        size="sm"
                        className="w-full"
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        Mark Ready for Pickup
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<ChefHat className="w-8 h-8 text-[#252525]" />}
            title="Kitchen prep queue is clear"
            description="No meals currently in cooking state. Check incoming orders to accept tickets."
          />
        )}
      </div>
    </StaffLayout>
  );
}
