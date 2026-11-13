'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  BellRing,
  ChefHat,
  CheckCircle,
  Archive,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Volume2,
} from 'lucide-react';

export default function StaffDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { showToast } = useToast();

  const loadOrders = () => {
    setOrders(orderService.getAll());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const incomingOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING' || o.status === 'ACCEPTED');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP');
  const completedOrders = orders.filter((o) => o.status === 'PICKED_UP');

  // Fast operational actions
  const handleAccept = (orderId: string) => {
    orderService.updateStatus(orderId, 'ACCEPTED');
    loadOrders();
    showToast({
      type: 'success',
      title: 'Order Accepted',
      message: `Ticket #${orderId} moved to kitchen queue`,
    });
  };

  const handleStartPrep = (orderId: string) => {
    orderService.updateStatus(orderId, 'PREPARING');
    loadOrders();
    showToast({
      type: 'info',
      title: 'Preparation Started',
      message: `Chef started cooking Order #${orderId}`,
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

  const handleConfirmCollected = (orderId: string) => {
    orderService.updateStatus(orderId, 'PICKED_UP');
    loadOrders();
    showToast({
      type: 'success',
      title: 'Handover Completed',
      message: `Order #${orderId} marked as collected`,
    });
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Kitchen Command Center
            </h1>
            <p className="text-xs text-[#525866] mt-0.5">
              Live operational order flow for Express Counter #2.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[#1A1C1E] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kitchen Live
            </span>
          </div>
        </div>

        {/* Operational Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Incoming Tickets"
            value={incomingOrders.length}
            subValue="Awaiting acceptance"
            icon={<BellRing className="w-5 h-5" />}
            trend={incomingOrders.length > 0 ? { value: 'New', isPositive: false } : undefined}
          />
          <StatCard
            label="In Preparation"
            value={preparingOrders.length}
            subValue="On grills & burners"
            icon={<ChefHat className="w-5 h-5 text-amber-600" />}
          />
          <StatCard
            label="Ready at Counter"
            value={readyOrders.length}
            subValue="Awaiting student pickup"
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            label="Fulfilled Today"
            value={completedOrders.length}
            subValue="Total served"
            icon={<Archive className="w-5 h-5 text-gray-600" />}
          />
        </div>

        {/* Priority Incoming Orders Alert Banner */}
        {incomingOrders.length > 0 && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 sm:p-5 text-[#991B1B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-red-100 rounded-xl">
                <BellRing className="w-5 h-5 text-red-600 animate-bounce" />
              </span>
              <div>
                <h3 className="font-bold text-sm">
                  {incomingOrders.length} New Order{incomingOrders.length > 1 ? 's' : ''} Awaiting Acceptance
                </h3>
                <p className="text-xs text-red-700/80">
                  Accept now so students receive instant confirmation for their chosen slots.
                </p>
              </div>
            </div>

            <Link href="/staff/orders">
              <Button variant="danger" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review Incoming Queue
              </Button>
            </Link>
          </div>
        )}

        {/* Active Kitchen Pipeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section A: In Preparation */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#1B4332]" />
                <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider">
                  Active Preparation Queue ({preparingOrders.length})
                </h2>
              </div>
              <Link href="/staff/preparation" className="text-xs font-semibold text-[#1B4332] hover:underline">
                View Kanban
              </Link>
            </div>

            {preparingOrders.length > 0 ? (
              <div className="space-y-3">
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-[#FAF9F6] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base bg-[#1B4332] text-white px-2 py-0.5 rounded-md">
                          {order.tokenNumber}
                        </span>
                        <span className="text-xs font-semibold text-gray-800">
                          Order #{order.id}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>

                    <div className="text-xs text-gray-700">
                      <p className="font-medium text-gray-900">
                        {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Slot: <span className="font-semibold">{order.pickupSlot.label}</span> • Student:{' '}
                        {order.studentName}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                      {order.status === 'ACCEPTED' ? (
                        <Button
                          onClick={() => handleStartPrep(order.id)}
                          variant="secondary"
                          size="sm"
                          leftIcon={<ChefHat className="w-3.5 h-3.5" />}
                        >
                          Start Cooking
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleMarkReady(order.id)}
                          variant="primary"
                          size="sm"
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                        >
                          Mark Ready for Pickup
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No dishes currently cooking.</p>
            )}
          </div>

          {/* Section B: Ready for Pickup */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider">
                  Ready at Counter ({readyOrders.length})
                </h2>
              </div>
              <Link href="/staff/ready" className="text-xs font-semibold text-[#1B4332] hover:underline">
                View All
              </Link>
            </div>

            {readyOrders.length > 0 ? (
              <div className="space-y-3">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-[#F0FDF4] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                          {order.tokenNumber}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          {order.studentName} ({order.studentRollNo})
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-800">
                        {order.pickupSlot.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 font-medium">
                      {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                      <Link href={`/staff/orders/${order.id}`} className="text-[11px] text-gray-500 hover:underline">
                        Order Details
                      </Link>

                      <Button
                        onClick={() => handleConfirmCollected(order.id)}
                        variant="primary"
                        size="sm"
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Confirm Handover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No orders waiting at counter right now.</p>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
