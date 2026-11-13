'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { adminApi, StaffMemberDto } from '@/lib/api/services/adminApi';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMemberDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadStaff = useCallback(async () => {
    try {
      const data = await adminApi.getStaff();
      setStaff(data);
    } catch (err: any) {
      console.warn('[AdminStaff] Failed to load staff roster:', err);
      showToast({
        type: 'error',
        title: 'Roster Load Failed',
        message: err.message || 'Unable to fetch persistent staff roster',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const toggleStatus = async (id: string) => {
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateStaffStatus(id);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast({
        type: 'info',
        title: `Shift Updated: ${updated.name}`,
        message: `Status changed to ${updated.status}`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Unable to update staff status',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Canteen Staff & Station Management
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Roster of active kitchen operators, line cooks, and pickup counter personnel.
            </p>
          </div>
        </div>

        {/* Counters summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-[#737373] uppercase">Station 1</span>
            <h3 className="font-bold text-sm text-[#252525]">Counter #1: Breakfast & Tawa</h3>
            <p className="text-xs text-[#737373]">1 Operator active • 25 tickets/hr peak capacity</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#252525] shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-[#252525] uppercase">Station 2 (Primary)</span>
            <h3 className="font-bold text-sm text-[#252525]">Counter #2: Express Meals & Bowls</h3>
            <p className="text-xs text-[#737373]">2 Operators active • QueueLess Express Lane</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-[#737373] uppercase">Station 3</span>
            <h3 className="font-bold text-sm text-[#252525]">Counter #3: Beverages & Shakes</h3>
            <p className="text-xs text-[#737373]">1 Operator active • Rapid fulfillment</p>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDEDEB] border-b border-[#E5E7EB] text-[#737373] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Staff Operator</th>
                  <th className="p-3.5">Assigned Station</th>
                  <th className="p-3.5">Shift Window</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 pr-5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#737373]">
                      Loading staff roster from database...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#737373]">
                      No staff accounts found in database.
                    </td>
                  </tr>
                ) : (
                  staff.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#252525] text-white flex items-center justify-center font-bold text-xs">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#252525] text-sm">{s.name}</p>
                            <p className="text-[11px] text-[#737373]">{s.role}</p>
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
                          disabled={updatingId === s.id}
                          variant="secondary"
                          size="sm"
                        >
                          {updatingId === s.id ? 'Updating...' : 'Cycle Shift Status'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
