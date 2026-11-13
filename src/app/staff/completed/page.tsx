'use client';

import React, { useState } from 'react';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { orderService } from '@/services/orderService';
import { EmptyState } from '@/components/ui/EmptyState';
import { Archive, Search, CheckCircle2 } from 'lucide-react';

export default function StaffCompletedPage() {
  const [search, setSearch] = useState('');
  const allOrders = orderService.getAll();
  const completedOrders = allOrders.filter((o) => o.status === 'PICKED_UP');

  const filtered = completedOrders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.tokenNumber.toLowerCase().includes(q) ||
      o.studentName.toLowerCase().includes(q) ||
      o.studentRollNo.toLowerCase().includes(q)
    );
  });

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Fulfilled Order History ({completedOrders.length})
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Archive of tickets prepared and handed over to students at Counter #2.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Token, Student..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#252525] text-[#252525]"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EDEDEB] border-b border-[#E5E7EB] text-[#737373] uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 pl-5">Token & ID</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Pickup Slot</th>
                    <th className="p-3.5">Total Paid</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-[#252525] text-white px-2 py-0.5 rounded">
                            {order.tokenNumber}
                          </span>
                          <span className="font-medium text-[#252525]">#{order.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-[#252525]">{order.studentName}</p>
                        <p className="text-[11px] text-[#737373] font-mono">{order.studentRollNo}</p>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-[#737373]">
                        {order.items.map((i) => `${i.menuItem.name} × ${i.quantity}`).join(', ')}
                      </td>
                      <td className="p-3.5 text-[#737373] font-medium">
                        {order.pickupSlot.label}
                      </td>
                      <td className="p-3.5 font-bold text-[#252525]">
                        ₹{order.total}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Handed Over
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Archive className="w-8 h-8 text-[#252525]" />}
            title="No completed orders found"
            description="Fulfilled orders will appear in this history archive."
          />
        )}
      </div>
    </StaffLayout>
  );
}
