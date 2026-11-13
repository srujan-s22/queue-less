'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useAuth } from '@/context/AuthContext';
import { menuService } from '@/services/menuService';
import { orderService } from '@/services/orderService';
import { configService } from '@/services/configService';
import { MenuItem, Order } from '@/types';
import { FoodCard } from '@/components/student/FoodCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Wallet,
  Zap,
  TrendingUp,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const config = configService.getConfig();

  useEffect(() => {
    const allMenu = menuService.getAll();
    setFeaturedItems(allMenu.filter((item) => item.isSpecial).slice(0, 3));
    setPopularItems(allMenu.slice(0, 6));

    const currentActive = orderService.getActiveOrder(user.id);
    setActiveOrder(currentActive || null);
  }, [user.id]);

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Welcome & Campus Stats Banner */}
        <div className="bg-gradient-to-br from-[#1B4332] to-[#143226] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          {/* Subtle graphic accent */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-24 -top-12 w-32 h-32 rounded-full bg-[#34D399]/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-[#34D399] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Apex University Central Canteen</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Order during class and pick up when fresh. Never waste your 30-minute break standing in lunch counter lines.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-center">
                <span className="text-[11px] text-white/60 block uppercase font-medium">Wallet</span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-0.5 mt-0.5">
                  <Wallet className="w-3.5 h-3.5 text-[#34D399]" />
                  ₹{user.walletBalance ?? 450}
                </span>
              </div>
              <div className="text-center border-x border-white/10 px-3">
                <span className="text-[11px] text-white/60 block uppercase font-medium">Time Saved</span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-0.5 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  ~45 min
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-white/60 block uppercase font-medium">Orders</span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#34D399]" />
                  8
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Order Spotlight Banner */}
        {activeOrder && (
          <div className="bg-white rounded-2xl border-2 border-[#1B4332]/20 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {activeOrder.tokenNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-bold text-base sm:text-lg text-[#1A1C1E]">
                      Active Order #{activeOrder.id}
                    </h2>
                    <OrderStatusBadge status={activeOrder.status} />
                  </div>
                  <p className="text-xs text-[#525866] mt-1">
                    Slot: <span className="font-semibold text-[#1A1C1E]">{activeOrder.pickupSlot.label}</span> •{' '}
                    {activeOrder.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/student/orders/${activeOrder.id}/track`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Track Live Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Today's Featured Specials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1C1E] tracking-tight">
                Today&apos;s Featured Specials
              </h2>
              <p className="text-xs text-[#525866]">Freshly curated batches prepared for quick collection</p>
            </div>
            <Link
              href="/student/menu"
              className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center gap-1"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Popular Campus Bites */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1C1E] tracking-tight">
                Popular on Campus
              </h2>
              <p className="text-xs text-[#525866]">What students are ordering the most this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* How QueueLess Works Info */}
        <div className="bg-[#F4F3EE] rounded-2xl p-6 border border-[#E5E7EB]">
          <h3 className="text-sm font-bold text-[#1A1C1E] tracking-wide uppercase mb-4">
            How QueueLess Saves Your Break
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center font-bold mb-2">
                1
              </div>
              <p className="font-semibold text-[#1A1C1E] text-sm">Pre-Order In Class</p>
              <p className="text-[#525866] mt-1">Browse canteen specials and pick your meal 15-30 minutes before your lunch bell rings.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center font-bold mb-2">
                2
              </div>
              <p className="font-semibold text-[#1A1C1E] text-sm">Select Pickup Slot</p>
              <p className="text-[#525866] mt-1">Reserve a specific pickup window (e.g. 1:00-1:15 PM) with guaranteed preparation.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="font-semibold text-[#1A1C1E] text-sm">Flash Token & Collect</p>
              <p className="text-[#525866] mt-1">Walk straight to the priority express counter, show token number, and enjoy your break.</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
