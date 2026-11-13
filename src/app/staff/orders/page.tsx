'use client';

import React, { useState, useEffect } from 'react';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import {
  BellRing,
  Check,
  X,
  Clock,
  User,
} from 'lucide-react';

export default function StaffIncomingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Kitchen at peak rush capacity');
  const { showToast } = useToast();

  const loadOrders = () => {
    const all = orderService.getAll();
    setOrders(all.filter((o) => o.status === 'PLACED'));
  };

  useEffect(() => {
    queueMicrotask(() => {
      loadOrders();
    });
  }, []);

  const handleAccept = (orderId: string) => {
    orderService.updateStatus(orderId, 'ACCEPTED');
    loadOrders();
    showToast({
      type: 'success',
      title: 'Order Accepted',
      message: `Ticket #${orderId} accepted into kitchen queue`,
    });
  };

  const handleConfirmReject = () => {
    if (!rejectingOrder) return;
    orderService.updateStatus(rejectingOrder.id, 'REJECTED', rejectReason);
    showToast({
      type: 'warning',
      title: 'Order Rejected',
      message: `Order #${rejectingOrder.id} was rejected with reason: ${rejectReason}`,
    });
    setRejectingOrder(null);
    loadOrders();
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Incoming Order Tickets ({orders.length})
            </h1>
            <p className="text-xs text-[#525866] mt-0.5">
              Review and accept pre-orders placed by students during lectures.
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border-2 border-red-200 p-5 shadow-xs space-y-4 hover:border-red-400 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex flex-col items-center justify-center font-bold font-mono">
                      <span className="text-[9px] uppercase tracking-wider text-red-200">Token</span>
                      <span>{order.tokenNumber}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1C1E]">
                        Order #{order.id}
                      </h3>
                      <p className="text-xs text-[#525866] flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                        {order.studentName} ({order.studentRollNo})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1B4332] block">
                      ₹{order.total}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Slot info */}
                <div className="p-3 bg-[#FAF9F6] rounded-xl text-xs flex items-center justify-between">
                  <span className="text-[#525866] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1B4332]" />
                    Requested Slot:
                  </span>
                  <span className="font-bold text-[#1A1C1E]">{order.pickupSlot.label}</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100 text-xs">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="py-2 flex justify-between">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {i.menuItem.name} <span className="text-gray-500">× {i.quantity}</span>
                        </span>
                        {i.customizations && (
                          <span className="block text-[10px] text-gray-500 mt-0.5">
                            {i.customizations.join(', ')}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-700">₹{i.menuItem.price * i.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setRejectingOrder(order)}
                    className="flex-1 py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>

                  <Button
                    onClick={() => handleAccept(order.id)}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Accept Ticket
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BellRing className="w-8 h-8 text-[#1B4332]" />}
            title="No pending incoming tickets"
            description="All orders have been processed into the kitchen preparation queue."
          />
        )}

        {/* Reject Modal */}
        {rejectingOrder && (
          <Modal
            isOpen={!!rejectingOrder}
            onClose={() => setRejectingOrder(null)}
            title={`Reject Order #${rejectingOrder.id}?`}
            description="The student will be instantly notified with this reason and their payment refunded."
          >
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Reason for Rejection
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="Item 86'd / Ingredients temporarily exhausted">
                    Item 86&apos;d / Ingredients temporarily exhausted
                  </option>
                  <option value="Kitchen at peak rush capacity for this slot">
                    Kitchen at peak rush capacity for this slot
                  </option>
                  <option value="Pickup counter undergoing scheduled maintenance">
                    Pickup counter undergoing scheduled maintenance
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => setRejectingOrder(null)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReject}
                  variant="danger"
                  size="sm"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </StaffLayout>
  );
}
