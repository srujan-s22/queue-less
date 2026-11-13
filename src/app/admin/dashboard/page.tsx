'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { orderService } from '@/services/orderService';
import { menuService } from '@/services/menuService';
import { configService } from '@/services/configService';
import { StatCard } from '@/components/ui/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  BarChart2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const orders = orderService.getAll();
  const menuItems = menuService.getAll();
  const config = configService.getConfig();

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = orders.filter((o) => o.status === 'PICKED_UP').length;
  const pendingOrders = orders.filter((o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED' && o.status !== 'REJECTED').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Canteen Operations Analytics
            </h1>
            <p className="text-xs text-[#525866] mt-0.5">
              Real-time throughput, revenue metrics, and queue reduction overview for Apex University.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-[#143226]">
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
            value={orders.length}
            subValue={`${completedOrders} fulfilled today`}
            icon={<ShoppingBag className="w-5 h-5 text-[#1B4332]" />}
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
                <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#1B4332]" />
                  <span>Break Rush Distribution (Hourly Order Volume)</span>
                </h2>
                <p className="text-xs text-[#525866] mt-0.5">
                  Pre-orders peak at 12:45–1:15 PM as expected during class switchover intervals.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1B4332] bg-[#EBF5EE] px-2.5 py-1 rounded-full">
                Capacity: 92%
              </span>
            </div>

            {/* CSS Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-gray-200">
                {hourlyData.map((d, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${
                        d.isPeak ? 'bg-[#1B4332]' : 'bg-[#E5E7EB]'
                      }`}
                      style={{ height: d.height }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
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
              <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span>Top Selling Dishes</span>
              </h2>
              <Link href="/admin/menu" className="text-xs font-semibold text-[#1B4332] hover:underline">
                Catalog
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {menuItems.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-gray-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-[11px] text-gray-500">₹{item.price} • {item.reviewCount || 100}+ sold</p>
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
            <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider">
              Live Order Feed ({orders.slice(0, 5).length} most recent)
            </h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center gap-1">
              <span>View Master Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-gray-200 text-[#525866] uppercase font-semibold">
                <tr>
                  <th className="p-3 pl-4">Order ID & Token</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Slot</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-[#143226] text-white px-2 py-0.5 rounded text-[11px]">
                          {order.tokenNumber}
                        </span>
                        <span className="font-semibold text-gray-800">#{order.id}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-gray-900 block">{order.studentName}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{order.studentRollNo}</span>
                    </td>
                    <td className="p-3 text-gray-600 font-medium">{order.pickupSlot.label}</td>
                    <td className="p-3 max-w-xs truncate text-gray-700">
                      {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                    </td>
                    <td className="p-3 font-bold text-gray-900">₹{order.total}</td>
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
