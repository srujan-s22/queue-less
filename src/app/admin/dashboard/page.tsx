'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { orderService } from '@/services/orderService';
import { menuService } from '@/services/menuService';
import { adminApi } from '@/lib/api/services/adminApi';
import { StatCard } from '@/components/ui/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { useSocket } from '@/lib/socket/useSocket';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  ArrowRight,
  Flame,
  BarChart2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState(() => orderService.getAll());
  const [menuItems, setMenuItems] = useState(() => menuService.getAll());
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
  });

  const loadAnalytics = useCallback(async () => {
    try {
      const [analyticsData, liveMenu] = await Promise.all([
        adminApi.getAnalytics(),
        menuService.fetchMenuItems(),
      ]);

      if (analyticsData && analyticsData.overview) {
        setMetrics({
          totalRevenue: analyticsData.overview.totalRevenue ?? 0,
          totalOrders: analyticsData.overview.totalOrders ?? 0,
          completedOrders: analyticsData.statusBreakdown?.PICKED_UP ?? 0,
          pendingOrders: Math.max(0, (analyticsData.overview.totalOrders ?? 0) - (analyticsData.statusBreakdown?.PICKED_UP ?? 0) - (analyticsData.statusBreakdown?.CANCELLED ?? 0) - (analyticsData.statusBreakdown?.REJECTED ?? 0)),
          avgOrderValue: analyticsData.overview.averageOrderValue ?? 0,
        });
      }

      if (liveMenu && liveMenu.length > 0) {
        setMenuItems(liveMenu);
      }

      setOrders(orderService.getAll());
    } catch {
      const currentOrders = orderService.getAll();
      const currentRev = currentOrders.reduce((sum, o) => sum + o.total, 0);
      const currentComp = currentOrders.filter((o) => o.status === 'PICKED_UP').length;
      const currentPend = currentOrders.filter((o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED' && o.status !== 'REJECTED').length;
      setMetrics({
        totalRevenue: currentRev,
        totalOrders: currentOrders.length,
        completedOrders: currentComp,
        pendingOrders: currentPend,
        avgOrderValue: currentOrders.length > 0 ? Math.round(currentRev / currentOrders.length) : 0,
      });
      setOrders(currentOrders);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useSocket('order:created', () => { loadAnalytics(); });
  useSocket('order:status_updated', () => { loadAnalytics(); });

  const { totalRevenue, totalOrders, completedOrders, pendingOrders, avgOrderValue } = metrics;

  // Hourly order distribution simulation
  const hourlyData = [
    { time: '11:00 AM', count: 4, height: '25%' },
    { time: '11:30 AM', count: 8, height: '40%' },
    { time: '12:00 PM', count: 18, height: '70%' },
    { time: '12:30 PM', count: 28, height: '95%', isPeak: true },
    { time: '01:00 PM', count: 32, height: '100%', isPeak: true },
    { time: '01:30 PM', count: 20, height: '75%' },
    { time: '02:00 PM', count: 12, height: '50%' },
    { time: '02:30 PM', count: 6, height: '30%' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Canteen Operations Analytics
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Real-time throughput, revenue metrics, and queue reduction overview for Apex University.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[#252525] shadow-2xs">
              Fall Semester 2026 • Live
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Gross Daily Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subValue="+18.4% vs last week"
            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+18.4%', isPositive: true }}
          />
          <StatCard
            label="Total Orders"
            value={totalOrders}
            subValue={`${completedOrders} fulfilled today`}
            icon={<ShoppingBag className="w-5 h-5 text-[#252525]" />}
          />
          <StatCard
            label="Average Order Value"
            value={`₹${avgOrderValue}`}
            subValue="Per student ticket"
            icon={<TrendingUp className="w-5 h-5 text-blue-700" />}
          />
          <StatCard
            label="Active Orders in Pipeline"
            value={pendingOrders}
            subValue="In kitchen / counter"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
          />
        </div>

        {/* Middle Row: Hourly Order Rush Distribution Chart & Top Selling Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#252525]" />
                  <span>Break Rush Distribution (Hourly Order Volume)</span>
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  Pre-orders peak at 12:45–1:15 PM as expected during class switchover intervals.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#252525] bg-[#EDEDEB] px-2.5 py-1 rounded-full">
                Capacity: 92%
              </span>
            </div>

            {/* CSS Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-[#E5E7EB]">
                {hourlyData.map((d, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${
                        d.isPeak ? 'bg-[#252525]' : 'bg-[#EDEDEB]'
                      }`}
                      style={{ height: d.height }}
                    />
                    <span className="text-[10px] text-[#737373] font-medium whitespace-nowrap">
                      {d.time.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span>Top Selling Dishes</span>
              </h2>
              <Link href="/admin/menu" className="text-xs font-semibold text-[#252525] hover:underline">
                Catalog
              </Link>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {menuItems.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-[#737373]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#252525]">{item.name}</p>
                      <p className="text-[11px] text-[#737373]">₹{item.price} • {item.reviewCount || 100}+ sold</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    ★ {item.rating?.toFixed(1) || '4.8'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Master Orders Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider">
              Live Order Feed ({orders.slice(0, 5).length} most recent)
            </h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#252525] hover:underline flex items-center gap-1">
              <span>View Master Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDEDEB] border-b border-[#E5E7EB] text-[#737373] uppercase font-semibold">
                <tr>
                  <th className="p-3 pl-4">Order ID & Token</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Slot</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-[#252525] text-white px-2 py-0.5 rounded text-[11px]">
                          {order.tokenNumber}
                        </span>
                        <span className="font-semibold text-[#252525]">#{order.orderNumber || order.id}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-[#252525] block">{order.studentName}</span>
                      <span className="text-[10px] text-[#737373] font-mono">{order.studentRollNo}</span>
                    </td>
                    <td className="p-3 text-[#737373] font-medium">{order.pickupSlot.label}</td>
                    <td className="p-3 max-w-xs truncate text-[#737373]">
                      {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                    </td>
                    <td className="p-3 font-bold text-[#252525]">₹{order.total}</td>
                    <td className="p-3 pr-4">
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
