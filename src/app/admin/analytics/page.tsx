'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { orderService } from '@/services/orderService';
import { menuService } from '@/services/menuService';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  Zap,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const orders = orderService.getAll();
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const handleExportCSV = () => {
    // Generate simulated CSV string
    const headers = 'Order_ID,Token,Student,Roll_No,Items,Total_INR,Slot,Status,Date\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.tokenNumber}","${o.studentName}","${o.studentRollNo}","${o.items.map((i) => `${i.menuItem.name}x${i.quantity}`).join(';')}",${o.total},"${o.pickupSlot.label}","${o.status}","${o.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QueueLess_Campus_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Report Exported Successfully',
      message: 'CSV file generated with all order tickets, revenues, and slot analytics.',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Reports, Audit & Throughput Analytics
            </h1>
            <p className="text-xs text-[#525866] mt-0.5">
              Quantifiable proof of queue elimination, dining waste reduction, and kitchen throughput.
            </p>
          </div>

          <Button
            onClick={handleExportCSV}
            variant="primary"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Comprehensive CSV
          </Button>
        </div>

        {/* Quantified Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Average Queue Reduction"
            value="89.4%"
            subValue="Down from 22 mins to 2.1 mins"
            icon={<Zap className="w-5 h-5 text-amber-500" />}
            trend={{ value: 'Major Win', isPositive: true }}
          />
          <StatCard
            label="Food Wastage Reduction"
            value="-34.2%"
            subValue="Exact pre-order batching"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            trend={{ value: '-34.2%', isPositive: true }}
          />
          <StatCard
            label="Average Prep Velocity"
            value="7.4 min"
            subValue="Kitchen turnaround time"
            icon={<Clock className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            label="On-Time Collection Rate"
            value="96.8%"
            subValue="Collected within 10m window"
            icon={<CheckCircle className="w-5 h-5 text-[#143226]" />}
          />
        </div>

        {/* Breakdown sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Revenue Distribution */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#143226]" />
              <span>Revenue by Food Category</span>
            </h2>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-800">
                  <span>Lunch & Meals (Biryani, Chole Bhature, Bowls)</span>
                  <span>45% (₹{(totalRevenue * 0.45).toFixed(0)})</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-[#143226] h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-800">
                  <span>Breakfast & Tawa (Dosas, Idlis, Combos)</span>
                  <span>28% (₹{(totalRevenue * 0.28).toFixed(0)})</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-[#2D6A4F] h-full rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-800">
                  <span>Quick Bites & Wraps (Kathi Rolls, Sandwiches)</span>
                  <span>17% (₹{(totalRevenue * 0.17).toFixed(0)})</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-[#40916C] h-full rounded-full" style={{ width: '17%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold text-gray-800">
                  <span>Beverages & Desserts (Coffee, Lassi, Jamun)</span>
                  <span>10% (₹{(totalRevenue * 0.1).toFixed(0)})</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-[#52B788] h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Slot Utilization & Peak Times */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#143226]" />
              <span>Pickup Slot Congestion Index</span>
            </h2>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center">
                <div>
                  <span className="font-bold block">12:30 PM – 12:45 PM (Opening Slot)</span>
                  <span className="text-[11px] text-emerald-700">Moderate traffic • Fast turnaround</span>
                </div>
                <span className="font-bold text-emerald-800">56% Booked</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex justify-between items-center">
                <div>
                  <span className="font-bold block">12:45 PM – 01:00 PM (Switchover Break)</span>
                  <span className="text-[11px] text-amber-700">High traffic • 22/25 capacity reached</span>
                </div>
                <span className="font-bold text-amber-800">88% Booked</span>
              </div>

              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex justify-between items-center">
                <div>
                  <span className="font-bold block">01:00 PM – 01:15 PM (Universal Lunch Bell)</span>
                  <span className="text-[11px] text-red-700">Peak Throttle Reached • 25/25 Cap Filled</span>
                </div>
                <span className="font-bold text-red-800">100% Capped</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center">
                <div>
                  <span className="font-bold block">01:15 PM – 01:30 PM (Post-Break Stream)</span>
                  <span className="text-[11px] text-emerald-700">Steady volume • Rapid collection</span>
                </div>
                <span className="font-bold text-emerald-800">72% Booked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
