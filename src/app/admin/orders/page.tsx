'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import {
  Search,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => orderService.getAll());
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [overrideOrder, setOverrideOrder] = useState<Order | null>(null);
  const { showToast } = useToast();

  const loadOrders = () => {
    setOrders(orderService.getAll());
  };

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (!overrideOrder) return;
    orderService.updateStatus(overrideOrder.id, newStatus);
    loadOrders();
    setOverrideOrder(null);
    showToast({
      type: 'info',
      title: 'Order Status Overridden',
      message: `Order #${overrideOrder.id} status changed to ${newStatus}`,
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.tokenNumber.toLowerCase().includes(q) ||
        order.studentName.toLowerCase().includes(q) ||
        order.studentRollNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Master Order Management ({orders.length} tickets)
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Comprehensive registry of all student canteen orders with override capabilities.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Token, Student..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F5F3] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#252525] text-[#252525]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(
              [
                'all',
                'PLACED',
                'ACCEPTED',
                'PREPARING',
                'READY_FOR_PICKUP',
                'PICKED_UP',
                'REJECTED',
              ] as const
            ).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#252525] text-white shadow-2xs'
                    : 'bg-[#EDEDEB] text-[#737373] hover:bg-[#E5E7EB]'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st.replace('_', ' ').toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Master Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDEDEB] border-b border-[#E5E7EB] text-[#737373] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Order ID & Token</th>
                  <th className="p-3.5">Student Info</th>
                  <th className="p-3.5">Pickup Slot</th>
                  <th className="p-3.5">Items Ordered</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-[#252525] text-white px-2 py-0.5 rounded text-[11px]">
                          {order.tokenNumber}
                        </span>
                        <span className="font-semibold text-[#252525]">#{order.id}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-gray-900 block">{order.studentName}</span>
                      <span className="text-[11px] text-gray-500 font-mono">{order.studentRollNo}</span>
                    </td>

                    <td className="p-3.5 text-gray-700 font-medium">
                      {order.pickupSlot.label}
                    </td>

                    <td className="p-3.5 max-w-xs truncate text-gray-700">
                      {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                    </td>

                    <td className="p-3.5 font-bold text-gray-900">
                      ₹{order.total}
                      {order.lateFeeApplied > 0 && (
                        <span className="text-[10px] text-red-600 block">
                          (+₹{order.lateFeeApplied} late)
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        onClick={() => setOverrideOrder(order)}
                        variant="secondary"
                        size="sm"
                      >
                        Override Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Override Modal */}
        {overrideOrder && (
          <Modal
            isOpen={!!overrideOrder}
            onClose={() => setOverrideOrder(null)}
            title={`Administrative Override — Order #${overrideOrder.id}`}
            description={`Customer: ${overrideOrder.studentName} • Current Status: ${overrideOrder.status}`}
          >
            <div className="space-y-4 text-xs">
              <p className="text-gray-600">
                Select a target lifecycle stage to override this order&apos;s state:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleUpdateStatus('PLACED')}
                  variant="outline"
                  size="sm"
                >
                  Set PLACED
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  variant="outline"
                  size="sm"
                >
                  Set ACCEPTED
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('PREPARING')}
                  variant="outline"
                  size="sm"
                >
                  Set PREPARING
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('READY_FOR_PICKUP')}
                  variant="primary"
                  size="sm"
                >
                  Set READY FOR PICKUP
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('PICKED_UP')}
                  variant="primary"
                  size="sm"
                >
                  Set PICKED UP (Done)
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  variant="danger"
                  size="sm"
                >
                  Cancel & Refund
                </Button>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <Button
                  onClick={() => setOverrideOrder(null)}
                  variant="secondary"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
