'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  counter: string;
  shift: string;
  status: 'Active' | 'On Break' | 'Off Duty';
  phone: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf_01',
    name: 'Ramesh Patel',
    role: 'Head Kitchen Operator',
    counter: 'Counter #2 (Express Lunch & Bowls)',
    shift: '07:30 AM – 03:30 PM (Morning)',
    status: 'Active',
    phone: '+91 98111 22334',
  },
  {
    id: 'stf_02',
    name: 'Suresh Kumar',
    role: 'Tawa & Dosa Specialist',
    counter: 'Counter #1 (South Indian & Breakfast)',
    shift: '07:00 AM – 02:00 PM (Morning)',
    status: 'Active',
    phone: '+91 98222 33445',
  },
  {
    id: 'stf_03',
    name: 'Priya Sharma',
    role: 'Beverages & Dessert Operator',
    counter: 'Counter #3 (Cold Brews, Shakes & Juices)',
    shift: '10:00 AM – 06:00 PM (Full Day)',
    status: 'Active',
    phone: '+91 98333 44556',
  },
  {
    id: 'stf_04',
    name: 'Manoj Singh',
    role: 'Counter Handover Assistant',
    counter: 'Counter #2 (Express Lunch & Bowls)',
    shift: '12:00 PM – 04:00 PM (Peak Break)',
    status: 'On Break',
    phone: '+91 98444 55667',
  },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const { showToast } = useToast();

  const toggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === 'Active' ? 'On Break' : s.status === 'On Break' ? 'Off Duty' : 'Active';
        showToast({
          type: 'info',
          title: `Shift Updated: ${s.name}`,
          message: `Status changed to ${nextStatus}`,
        });
        return { ...s, status: nextStatus };
      })
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Canteen Staff & Station Management
            </h1>
            <p className="text-xs text-[#525866] mt-0.5">
              Roster of active kitchen operators, line cooks, and pickup counter personnel.
            </p>
          </div>
        </div>

        {/* Counters summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Station 1</span>
            <h3 className="font-bold text-sm text-gray-900">Counter #1: Breakfast & Tawa</h3>
            <p className="text-xs text-gray-500">1 Operator active • 25 tickets/hr peak capacity</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-2 border-[#1B4332]/30 p-5 rounded-2xl shadow-xs space-y-2">
            <span className="text-xs font-semibold text-[#1B4332] uppercase">Station 2 (Primary)</span>
            <h3 className="font-bold text-sm text-gray-900">Counter #2: Express Meals & Bowls</h3>
            <p className="text-xs text-gray-500">2 Operators active • QueueLess Express Lane</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Station 3</span>
            <h3 className="font-bold text-sm text-gray-900">Counter #3: Beverages & Shakes</h3>
            <p className="text-xs text-gray-500">1 Operator active • Rapid fulfillment</p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-gray-200 text-[#525866] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Staff Operator</th>
                  <th className="p-3.5">Assigned Station</th>
                  <th className="p-3.5">Shift Window</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 pr-5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#143226] text-white flex items-center justify-center font-bold text-xs">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                          <p className="text-[11px] text-gray-500">{s.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-gray-700">
                      {s.counter}
                    </td>

                    <td className="p-3.5 text-gray-600 font-medium">
                      {s.shift}
                    </td>

                    <td className="p-3.5 font-mono text-gray-600">
                      {s.phone}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'On Break'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'Active'
                              ? 'bg-emerald-500 animate-pulse'
                              : s.status === 'On Break'
                              ? 'bg-amber-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        {s.status}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        onClick={() => toggleStatus(s.id)}
                        variant="secondary"
                        size="sm"
                      >
                        Cycle Shift Status
                      </Button>
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
