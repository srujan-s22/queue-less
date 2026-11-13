'use client';

import React, { useState, useEffect } from 'react';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { ChefHat, Check, Clock, User } from 'lucide-react';

export default function StaffPreparationPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { showToast } = useToast();

  const loadOrders = () => {
    const all = orderService.getAll();
    setOrders(all.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'));
  };

  useEffect(() => {
    queueMicrotask(() => {
      loadOrders();
    });
  }, []);

  const handleStartCooking = (orderId: string) => {
    orderService.updateStatus(orderId, 'PREPARING');
    loadOrders();
    showToast({
      type: 'info',
      title: 'Cooking Started',
      message: `Order #${orderId} marked as PREPARING`,
    });
  };

  const handleMarkReady = (orderId: string) => {
    orderService.updateStatus(orderId, 'READY_FOR_PICKUP');
    loadOrders();
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
            Kitchen Preparation Queue ({orders.length})
          </h1>
          <p className="text-xs text-[#525866] mt-0.5">
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
                    isCooking ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-base px-2.5 py-1 rounded-lg text-white ${
                          isCooking ? 'bg-amber-600' : 'bg-[#1B4332]'
                        }`}
                      >
                        {order.tokenNumber}
                      </span>
                      <span className="text-xs font-semibold text-gray-800">
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
                  <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-gray-900">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {order.studentName} ({order.studentRollNo})
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Target Slot: <span className="font-semibold text-gray-800">{order.pickupSlot.label}</span>
                    </p>
                  </div>

                  {/* Dishes */}
                  <div className="divide-y divide-gray-100 text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="py-2">
                        <div className="flex justify-between font-semibold text-gray-900">
                          <span>{i.menuItem.name}</span>
                          <span className="text-[#1B4332]">× {i.quantity}</span>
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
                  <div className="pt-2 border-t border-gray-100">
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
            icon={<ChefHat className="w-8 h-8 text-[#1B4332]" />}
            title="Kitchen prep queue is clear"
            description="No meals currently in cooking state. Check incoming orders to accept tickets."
          />
        )}
      </div>
    </StaffLayout>
  );
}
