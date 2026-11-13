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
import {
  CheckCircle,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function StaffReadyPage() {
  const [orders, setOrders] = useState<Order[]>(() => {
    return orderService.getAll().filter((o) => o.status === 'READY_FOR_PICKUP');
  });
  const [searchToken, setSearchToken] = useState('');
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      const ready = await staffApi.getReady();
      if (ready && Array.isArray(ready)) {
        setOrders(ready);
        return;
      }
      const all = orderService.getAll();
      setOrders(all.filter((o) => o.status === 'READY_FOR_PICKUP'));
    } catch {
      const all = orderService.getAll();
      setOrders(all.filter((o) => o.status === 'READY_FOR_PICKUP'));
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useSocket('order:ready', () => { loadOrders(); });
  useSocket('order:picked-up', () => { loadOrders(); });
  useSocket('order:status_updated', () => { loadOrders(); });

  const handleConfirmHandover = async (orderId: string) => {
    await orderService.handoverOrder(orderId);
    await loadOrders();
    showToast({
      type: 'success',
      title: 'Handover Confirmed',
      message: `Order #${orderId} marked as completed/collected`,
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchToken.trim()) return true;
    const q = searchToken.toLowerCase();
    return (
      o.tokenNumber.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.studentName.toLowerCase().includes(q) ||
      o.studentRollNo.toLowerCase().includes(q)
    );
  });

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Ready at Pickup Counter ({orders.length})
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Orders currently staged at Express Counter #2 awaiting student collection.
            </p>
          </div>

          {/* Quick Token Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="Filter by Token (e.g. A-18)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#252525] text-[#252525]"
            />
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const { isLate, lateFee } = orderService.calculateLateFee(order);

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 shadow-2xs transition-all ${
                    isLate
                      ? 'border-amber-400 bg-amber-50/30'
                      : 'border-[#BBF7D0] bg-[#F0FDF4]'
                  }`}
                >
                  {/* Top Bar with Big Token */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xl px-3 py-1 rounded-xl bg-[#252525] text-white shadow-2xs">
                        {order.tokenNumber}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-[#252525] block">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-[#737373]">
                          {order.pickupSlot.label}
                        </span>
                      </div>
                    </div>

                    {isLate && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        Late (+₹{lateFee})
                      </span>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] text-xs">
                    <p className="font-semibold text-[#252525]">
                      {order.studentName} ({order.studentRollNo})
                    </p>
                    <p className="text-[11px] text-[#737373] font-mono mt-0.5">
                      Phone: {order.studentPhone}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#E5E7EB] text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between">
                        <span className="font-medium text-[#252525]">
                          {i.menuItem.name} <span className="text-[#737373]">× {i.quantity}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Handover action */}
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <Button
                      onClick={() => handleConfirmHandover(order.id)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Confirm Student Handover
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle className="w-8 h-8 text-[#252525]" />}
            title="No orders staged at counter"
            description="When kitchen finishes dishes and marks them ready, they will appear here for student collection."
          />
        )}
      </div>
    </StaffLayout>
  );
}
