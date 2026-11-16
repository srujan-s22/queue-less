'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { configService } from '@/services/configService';
import { orderService } from '@/services/orderService';
import { PickupSlot } from '@/types';
import { SlotSelector } from '@/components/student/SlotSelector';
import { Button } from '@/components/ui/Button';
import {
  Clock,
  Wallet,
  Smartphone,
  CreditCard,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function StudentCheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax, packagingFee, total, clearCart } = useCart();
  const { user, updateUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [slots, setSlots] = useState<PickupSlot[]>(() => configService.getSlots());
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(slots[0] || null);
  const [paymentMethod, setPaymentMethod] = useState<'campus_wallet' | 'upi' | 'netbanking'>('campus_wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    configService.fetchSlots().then((liveSlots) => {
      if (liveSlots && liveSlots.length > 0) {
        setSlots(liveSlots);
        setSelectedSlot((prev) => {
          if (!prev) return liveSlots[0];
          const found = liveSlots.find((s) => s.id === prev.id);
          return found || liveSlots[0];
        });
      }
    }).catch(() => {});
  }, []);

  // If cart is empty, redirect safely inside useEffect
  useEffect(() => {
    if (items.length === 0) {
      router.push('/student/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      showToast({
        type: 'error',
        title: 'Select a Pickup Slot',
        message: 'Please choose an available collection time slot before placing your order.',
      });
      return;
    }

    if (paymentMethod === 'campus_wallet' && (user.walletBalance ?? 0) < total) {
      showToast({
        type: 'error',
        title: 'Insufficient Wallet Balance',
        message: `Your balance is ₹${user.walletBalance ?? 0}. Please top up or choose UPI.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order via centralized orderService
      const newOrder = await orderService.createOrder({
        student: user,
        items,
        pickupSlot: selectedSlot,
        paymentMethod,
      });

      // Refresh authoritative user balance after successful server wallet deduction
      if (paymentMethod === 'campus_wallet') {
        await refreshUser();
      }

      // Clear the cart
      clearCart();

      showToast({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Token #${newOrder.tokenNumber} assigned for ${selectedSlot.label}`,
      });

      router.push(`/student/order-confirmation/${newOrder.id}`);
    } catch (err: any) {
      console.error('Error placing order:', err);
      showToast({
        type: 'error',
        title: 'Checkout Failed',
        message: err.message || 'Unable to place order. The selected slot may be full.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
            Pre-Order Checkout
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Select your scheduled lunch break collection slot and verify order specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form: Pickup Slot & Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Pickup Slot Section */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-[#252525] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#252525]" />
                    <span>Select Campus Pickup Slot</span>
                  </h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Order is cooked to be ready exactly within this 15-minute window.
                  </p>
                </div>
              </div>

              <SlotSelector
                slots={slots}
                selectedSlotId={selectedSlot?.id || null}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
              />

              {/* Slot late fee warning notice */}
              <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#D97706]" />
                <p>
                  <span className="font-semibold">Collection Policy:</span> Once your order status is marked{' '}
                  <span className="font-semibold">Ready for Pickup</span>, you have a 10-minute grace window to collect. A flat ₹20 warming charge applies if collected late.
                </p>
              </div>
            </div>

            {/* 2. Payment Method Section */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
              <h2 className="font-bold text-base text-[#252525] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#252525]" />
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Campus Wallet */}
                <div
                  onClick={() => setPaymentMethod('campus_wallet')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'campus_wallet'
                      ? 'bg-[#EDEDEB] border-[#252525] ring-2 ring-[#252525]'
                      : 'bg-white border-[#E5E7EB] hover:border-gray-400'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-[#252525] mb-2" />
                  <p className="font-semibold text-xs text-[#252525]">Campus Wallet</p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Balance: <span className="font-semibold text-[#252525]">₹{user.walletBalance ?? 0}</span>
                  </p>
                </div>

                {/* Option 2: Instant UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-[#EDEDEB] border-[#252525] ring-2 ring-[#252525]'
                      : 'bg-white border-[#E5E7EB] hover:border-gray-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#252525] mb-2" />
                  <p className="font-semibold text-xs text-[#252525]">Instant UPI</p>
                  <p className="text-[11px] text-[#737373] mt-0.5">GPay, PhonePe, Paytm</p>
                </div>

                {/* Option 3: Netbanking */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-[#EDEDEB] border-[#252525] ring-2 ring-[#252525]'
                      : 'bg-white border-[#E5E7EB] hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#252525] mb-2" />
                  <p className="font-semibold text-xs text-[#252525]">Netbanking / Card</p>
                  <p className="text-[11px] text-[#737373] mt-0.5">SBI, HDFC, ICICI, etc.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#252525] uppercase tracking-wider">
                Order Review
              </h3>

              <div className="divide-y divide-[#E5E7EB] max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.menuItem.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#252525]">
                        {i.menuItem.name} <span className="text-[#737373]">× {i.quantity}</span>
                      </p>
                      {i.customizations && (
                        <p className="text-[10px] text-[#737373]">{i.customizations.join(', ')}</p>
                      )}
                    </div>
                    <span className="font-semibold text-[#252525]">
                      ₹{i.menuItem.price * i.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] space-y-2 text-xs text-[#737373]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#252525]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco Packaging</span>
                  <span className="font-semibold text-[#252525]">₹{packagingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-[#252525]">₹{tax}</span>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between text-sm font-bold text-[#252525]">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#252525]">₹{total}</span>
                </div>
              </div>

              {selectedSlot && (
                <div className="p-3 rounded-xl bg-[#EDEDEB] text-xs">
                  <span className="text-[#737373] block">Selected Pickup Window:</span>
                  <span className="font-bold text-[#252525]">{selectedSlot.label}</span>
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm Pre-Order (₹{total})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
