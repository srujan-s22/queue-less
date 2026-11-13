'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { orderService } from '@/services/orderService';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  ArrowRight,
  QrCode,
  MapPin,
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const order = orderService.getById(orderId);

  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1B4332', '#34D399', '#F59E0B', '#10B981'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  if (!order) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
          <p className="text-gray-500 text-sm mt-1">Order #{orderId} could not be located.</p>
          <Link href="/student/dashboard" className="mt-4 inline-block text-sm font-semibold text-[#1B4332] underline">
            Return to Dashboard
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-9 h-9 text-[#1B4332]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1C1E]">
            Pre-Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-[#525866]">
            The kitchen has received your ticket. We will prepare it for your selected slot.
          </p>
        </div>

        {/* Priority Token Ticket Card */}
        <div className="bg-white rounded-3xl border-2 border-[#1B4332]/20 shadow-sm overflow-hidden">
          {/* Top Ticket Header */}
          <div className="bg-[#1B4332] text-white p-6 text-center relative">
            <span className="text-[11px] uppercase tracking-widest text-[#34D399] font-bold block mb-1">
              Priority Pickup Token
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-wider">
              {order.tokenNumber}
            </div>
            <p className="text-xs text-white/70 mt-1 font-mono">
              Order Ref: #{order.id}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-5">
            {/* Slot & Location info */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F4F3EE] text-xs">
              <div>
                <span className="text-[#525866] block font-medium">Allocated Pickup Window</span>
                <span className="font-bold text-sm text-[#1A1C1E] mt-0.5 block">
                  {order.pickupSlot.label}
                </span>
              </div>
              <div>
                <span className="text-[#525866] block font-medium">Express Collection Counter</span>
                <span className="font-bold text-sm text-[#1B4332] mt-0.5 block flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#1B4332]" />
                  Counter #2 (Express)
                </span>
              </div>
            </div>

            {/* Items Ordered */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#525866] mb-3">
                Items In Tray
              </h3>
              <div className="divide-y divide-gray-100">
                {order.items.map((i, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#1A1C1E]">
                        {i.menuItem.name} <span className="text-[#525866]">× {i.quantity}</span>
                      </p>
                      {i.customizations && (
                        <p className="text-[10px] text-gray-500">{i.customizations.join(', ')}</p>
                      )}
                    </div>
                    <span className="font-semibold text-[#1A1C1E]">
                      ₹{i.menuItem.price * i.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-gray-100 text-xs space-y-1.5 text-[#525866]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging & GST</span>
                <span>₹{order.packagingFee + order.tax}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1A1C1E] pt-2 border-t border-gray-200">
                <span>Total Paid ({order.paymentMethod.replace('_', ' ')})</span>
                <span className="text-base text-[#1B4332]">₹{order.total}</span>
              </div>
            </div>

            {/* Simulated QR graphic */}
            <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center">
              <div>
                <QrCode className="w-16 h-16 text-gray-800 mx-auto" />
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                  Scan at Express Terminal to Collect
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/student/orders/${order.id}/track`} className="flex-1">
            <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Track Live Order Status
            </Button>
          </Link>
          <Link href="/student/dashboard" className="sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
