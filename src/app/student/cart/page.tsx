'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useCart } from '@/context/CartContext';
import { DietaryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function StudentCartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    packagingFee,
    total,
    totalCount,
  } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto py-12">
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8 text-[#252525]" />}
            title="Your food tray is currently empty"
            description="Explore our authentic campus breakfast, hot meals, wraps and beverages to place an order before your break."
            actionLabel="Browse Canteen Menu"
            onAction={() => router.push('/student/menu')}
          />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#252525]">
              Your Food Tray ({totalCount} {totalCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Review your meal items before choosing your campus pickup slot.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Tray
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.menuItem.id}
                className="bg-white p-4 rounded-2xl border border-[#E5E7EB] flex items-center justify-between gap-4 shadow-2xs"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <DietaryBadge dietary={item.menuItem.dietary} />
                      <h3 className="font-semibold text-sm text-[#252525] truncate">
                        {item.menuItem.name}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-[#252525] mt-0.5">
                      ₹{item.menuItem.price} each
                    </p>
                    {item.customizations && item.customizations.length > 0 && (
                      <p className="text-[11px] text-[#737373] mt-0.5 truncate">
                        {item.customizations.join(' • ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity & Controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#EDEDEB] p-1 rounded-xl border border-[#E5E7EB]">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white text-[#252525] hover:bg-[#252525] hover:text-white transition-colors flex items-center justify-center font-bold"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#252525]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white text-[#252525] hover:bg-[#252525] hover:text-white transition-colors flex items-center justify-center font-bold"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="w-16 text-right font-bold text-sm text-[#252525]">
                    ₹{item.menuItem.price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeItem(item.menuItem.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick add more banner */}
            <Link
              href="/student/menu"
              className="block p-3.5 rounded-2xl border border-dashed border-[#E5E7EB] text-center text-xs font-semibold text-[#252525] hover:bg-[#EDEDEB] transition-colors"
            >
              + Add more items from Canteen Menu
            </Link>
          </div>

          {/* Order Summary & Proceed Column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider">
                Bill Summary
              </h2>

              <div className="space-y-2 text-xs text-[#737373]">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#252525]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Eco Packaging Charge</span>
                  <span className="font-semibold text-[#252525]">₹{packagingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Campus GST (5%)</span>
                  <span className="font-semibold text-[#252525]">₹{tax}</span>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex justify-between text-sm font-bold text-[#252525]">
                  <span>Total Payable</span>
                  <span className="text-lg text-[#252525]">₹{total}</span>
                </div>
              </div>

              <Link href="/student/checkout" className="block">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Proceed to Slot Selection
                </Button>
              </Link>
            </div>

            {/* Quality and Grace Period Guarantee Notice */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] text-xs text-[#737373] shadow-2xs">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-[#10B981] flex-shrink-0" />
                <p className="leading-relaxed">
                  <span className="font-semibold text-[#252525]">QueueLess Guarantee:</span> Your order is prepared hot to match your selected pickup slot. Zero waiting in line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
