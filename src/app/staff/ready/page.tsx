'use client';

import React, { useState, useEffect } from 'react';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import {
  CheckCircle,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function StaffReadyPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchToken, setSearchToken] = useState('');
  const { showToast } = useToast();

  const loadOrders = () => {
    const all = orderService.getAll();
    setOrders(all.filter((o) => o.status === 'READY_FOR_PICKUP'));
  };

  useEffect(() => {
    queueMicrotask(() => {
      loadOrders();
    });
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmHandover = (orderId: string) => {
    orderService.updateStatus(orderId, 'PICKED_UP');
    loadOrders();
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Ready at Pickup Counter ({orders.length})
            </h1>
            <p className="text-xs text-[#525866] mt-0.5">
              Orders currently staged at Express Counter #2 awaiting student collection.
            </p>
          </div>

          {/* Quick Token Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="Filter by Token (e.g. A-18)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#1B4332]"
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
                      : 'border-emerald-300 bg-emerald-50/20'
                  }`}
                >
                  {/* Top Bar with Big Token */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xl px-3 py-1 rounded-xl bg-[#1B4332] text-white shadow-2xs">
                        {order.tokenNumber}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-gray-500">
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
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-xs">
                    <p className="font-semibold text-gray-900">
                      {order.studentName} ({order.studentRollNo})
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      Phone: {order.studentPhone}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100 text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between">
                        <span className="font-medium text-gray-800">
                          {i.menuItem.name} <span className="text-gray-500">× {i.quantity}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Handover action */}
                  <div className="pt-2 border-t border-gray-100">
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
            icon={<CheckCircle className="w-8 h-8 text-[#1B4332]" />}
            title="No orders staged at counter"
            description="When kitchen finishes dishes and marks them ready, they will appear here for student collection."
          />
        )}
      </div>
    </StaffLayout>
  );
}
