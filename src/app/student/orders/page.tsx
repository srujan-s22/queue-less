'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Order } from '@/types';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Clock,
  ArrowRight,
  RotateCw,
  FileText,
} from 'lucide-react';

export default function StudentOrderHistoryPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const studentOrders = orderService.getByStudentId(user.id);

  const filteredOrders = studentOrders.filter((order) => {
    if (activeTab === 'active') {
      return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['PICKED_UP', 'CANCELLED', 'REJECTED'].includes(order.status);
    }
    return true;
  });

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem(item.menuItem, item.quantity, item.customizations);
    });
    showToast({
      type: 'success',
      title: 'Items Re-added to Tray',
      message: `${order.items.length} items loaded into your food tray.`,
    });
    router.push('/student/cart');
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
            Order History & Tracking
          </h1>
          <p className="text-sm text-[#525866] mt-1">
            Review past canteen receipts, reorder favorite meals, and track active orders in real time.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#1B4332] text-white shadow-2xs'
                  : 'text-[#525866] hover:bg-gray-100 hover:text-[#1A1C1E]'
              }`}
            >
              {tab === 'all'
                ? `All Orders (${studentOrders.length})`
                : tab === 'active'
                ? `Active Orders (${studentOrders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)).length})`
                : 'Fulfilled / Past'}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isActive = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(
                order.status
              );

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Token, ID & Items */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#EBF5EE] text-[#1B4332] flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-[#525866]">Token</span>
                      <span>{order.tokenNumber}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-[#1A1C1E]">
                          Order #{order.id}
                        </span>
                        <OrderStatusBadge status={order.status} size="sm" />
                        <span className="text-xs text-[#525866]">
                          {new Date(order.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-[#525866]">
                        {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                      </p>

                      <p className="text-[11px] text-[#525866]">
                        Pickup Slot: <span className="font-semibold text-gray-700">{order.pickupSlot.label}</span> • Total Paid: <span className="font-bold text-[#1B4332]">₹{order.total}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <button
                      onClick={() => setSelectedInvoice(order)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      Receipt
                    </button>

                    {isActive ? (
                      <Link href={`/student/orders/${order.id}/track`}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Track Live Status
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleReorder(order)}
                        variant="secondary"
                        size="sm"
                        leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Clock className="w-8 h-8 text-[#1B4332]" />}
            title="No orders found"
            description="You do not have any orders in this tab. Explore the menu to place your first pre-order!"
            actionLabel="Explore Canteen Menu"
            onAction={() => router.push('/student/menu')}
          />
        )}

        {/* Invoice Modal Dialog */}
        {selectedInvoice && (
          <Modal
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            title={`Receipt — Order #${selectedInvoice.id}`}
            description={`Token ${selectedInvoice.tokenNumber} • Placed on ${new Date(selectedInvoice.createdAt).toLocaleString()}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F4F3EE] rounded-xl flex justify-between text-[#1A1C1E]">
                <div>
                  <span className="text-[#525866] block">Student Info</span>
                  <span className="font-semibold">{selectedInvoice.studentName}</span> ({selectedInvoice.studentRollNo})
                </div>
                <div className="text-right">
                  <span className="text-[#525866] block">Counter</span>
                  <span className="font-semibold text-[#1B4332]">Counter #2 Express</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {selectedInvoice.items.map((i, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {i.menuItem.name} × {i.quantity}
                      </p>
                      {i.customizations && (
                        <p className="text-[10px] text-gray-500">{i.customizations.join(', ')}</p>
                      )}
                    </div>
                    <span className="font-medium text-gray-800">
                      ₹{i.menuItem.price * i.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-200 space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco Packaging</span>
                  <span>₹{selectedInvoice.packagingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{selectedInvoice.tax}</span>
                </div>
                {selectedInvoice.lateFeeApplied > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Late Pickup Fee</span>
                    <span>+₹{selectedInvoice.lateFeeApplied}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Amount Paid</span>
                  <span className="text-base text-[#1B4332]">₹{selectedInvoice.total}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  variant="secondary"
                  size="sm"
                >
                  Close Receipt
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </StudentLayout>
  );
}
