'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useAuth } from '@/context/AuthContext';
import { menuService } from '@/services/menuService';
import { orderService } from '@/services/orderService';
import { MenuItem, Order } from '@/types';
import { FoodCard } from '@/components/student/FoodCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSocket } from '@/lib/socket/useSocket';
import {
  Sparkles,
  ArrowRight,
  Wallet,
  Zap,
  TrendingUp,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [ordersCount, setOrdersCount] = useState<number>(8);

  const loadDashboardData = useCallback(async () => {
    try {
      const [allMenu, myOrders] = await Promise.all([
        menuService.fetchMenuItems(),
        orderService.fetchMyOrders(),
      ]);

      if (allMenu && allMenu.length > 0) {
        setFeaturedItems(allMenu.filter((item) => item.isSpecial).slice(0, 3));
        setPopularItems(allMenu.slice(0, 6));
      }

      if (myOrders && myOrders.length > 0) {
        setOrdersCount(myOrders.length);
        const currentActive = myOrders.find((o) =>
          ['READY_FOR_PICKUP', 'PREPARING', 'ACCEPTED', 'PLACED'].includes(o.status)
        );
        setActiveOrder(currentActive || null);
      } else {
        const cachedActive = orderService.getActiveOrder(user?.id);
        setActiveOrder(cachedActive || null);
      }
    } catch {
      const allMenu = menuService.getAll();
      setFeaturedItems(allMenu.filter((item) => item.isSpecial).slice(0, 3));
      setPopularItems(allMenu.slice(0, 6));
      const cachedActive = orderService.getActiveOrder(user?.id);
      setActiveOrder(cachedActive || null);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time synchronization
  useSocket('order:created', () => { loadDashboardData(); });
  useSocket('order:status_updated', () => { loadDashboardData(); });
  useSocket('inventory:updated', () => { loadDashboardData(); });

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Welcome & Campus Stats Banner (Monochrome Enterprise Card) */}
        <div className="bg-[#252525] text-white rounded-2xl p-6 sm:p-8 border border-[#383838] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#333333] border border-[#404040] text-xs font-medium text-[#EDEDEB] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Apex University Central Canteen</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {(user?.name || 'Student').split(' ')[0]}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Order during class and pick up when fresh. Never waste your 30-minute break standing in lunch counter lines.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-[#1E1E1E] rounded-xl p-4 border border-[#383838]">
              <div className="text-center">
                <span className="text-[10px] text-[#A3A3A3] block uppercase font-medium">Wallet</span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                  <Wallet className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  ₹{user.walletBalance ?? 450}
                </span>
              </div>
              <div className="text-center border-x border-[#383838] px-3">
                <span className="text-[10px] text-[#A3A3A3] block uppercase font-medium">Time Saved</span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  ~45 min
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[#A3A3A3] block uppercase font-medium">Orders</span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  {ordersCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Order Spotlight Banner */}
        {activeOrder && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5F5F3] border border-[#E5E7EB] text-[#252525] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {activeOrder.tokenNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-bold text-base sm:text-lg text-[#252525]">
                      Active Order #{activeOrder.id}
                    </h2>
                    <OrderStatusBadge status={activeOrder.status} />
                  </div>
                  <p className="text-xs text-[#737373] mt-1">
                    Slot: <span className="font-semibold text-[#252525]">{activeOrder.pickupSlot.label}</span> •{' '}
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
              <h2 className="text-lg sm:text-xl font-bold text-[#252525] tracking-tight">
                Today&apos;s Featured Specials
              </h2>
              <p className="text-xs text-[#737373]">Freshly curated batches prepared for quick collection</p>
            </div>
            <Link
              href="/student/menu"
              className="text-xs font-semibold text-[#252525] hover:underline flex items-center gap-1"
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
              <h2 className="text-lg sm:text-xl font-bold text-[#252525] tracking-tight">
                Popular on Campus
              </h2>
              <p className="text-xs text-[#737373]">What students are ordering the most this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* How QueueLess Works Info */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs">
          <h3 className="text-xs font-bold text-[#737373] tracking-wider uppercase mb-4">
            How QueueLess Saves Your Break
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#F5F5F3] p-4 rounded-xl border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#EDEDEB] text-[#252525] flex items-center justify-center font-bold mb-2">
                1
              </div>
              <p className="font-semibold text-[#252525] text-sm">Pre-Order In Class</p>
              <p className="text-[#737373] mt-1 leading-relaxed">Browse canteen specials and pick your meal 15-30 minutes before your lunch bell rings.</p>
            </div>
            <div className="bg-[#F5F5F3] p-4 rounded-xl border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#EDEDEB] text-[#252525] flex items-center justify-center font-bold mb-2">
                2
              </div>
              <p className="font-semibold text-[#252525] text-sm">Select Pickup Slot</p>
              <p className="text-[#737373] mt-1 leading-relaxed">Reserve a specific pickup window (e.g. 1:00-1:15 PM) with guaranteed preparation.</p>
            </div>
            <div className="bg-[#F5F5F3] p-4 rounded-xl border border-[#E5E7EB]">
              <div className="w-7 h-7 rounded-lg bg-[#EDEDEB] text-[#252525] flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="font-semibold text-[#252525] text-sm">Flash Token & Collect</p>
              <p className="text-[#737373] mt-1 leading-relaxed">Walk straight to the priority express counter, show token number, and enjoy your break.</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
