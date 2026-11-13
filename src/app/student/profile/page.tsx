'use client';

import React, { useState } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import {
  Wallet,
  Plus,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [department, setDepartment] = useState(user.department || 'Computer Science & Engg.');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      department,
    });
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your campus credentials and notification preferences have been saved.',
    });
  };

  const handleTopupWallet = (amount: number) => {
    const current = user.walletBalance ?? 0;
    updateUser({ walletBalance: current + amount });
    showToast({
      type: 'success',
      title: `₹${amount} Added to Wallet`,
      message: `Your new balance is ₹${current + amount}.`,
    });
  };

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
            Student Account Profile
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Manage your campus canteen credentials, balance, and collection alerts.
          </p>
        </div>

        {/* Digital Campus Wallet Card */}
        <div className="bg-[#252525] text-white rounded-2xl p-6 shadow-2xs border border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-white/70 font-semibold block">
                QueueLess Campus Wallet
              </span>
              <div className="text-3xl font-bold text-white mt-0.5">
                ₹{user.walletBalance ?? 450}
              </div>
              <p className="text-xs text-[#10B981] mt-0.5">Instant 1-tap express checkout active</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 mr-1 hidden sm:inline">Quick Top-up:</span>
            {[100, 200, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => handleTopupWallet(amt)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs">
          <form onSubmit={handleSave} className="space-y-5">
            <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider border-b border-[#E5E7EB] pb-3">
              Campus Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Roll / Registration Number
                </label>
                <input
                  type="text"
                  disabled
                  value={user.rollNumber || '2024CS1042'}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#EDEDEB] text-[#737373] font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#EDEDEB] text-[#737373] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Mobile Number (for pickup SMS)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Academic Department / School
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>
            </div>

            {/* Notification settings */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#252525]">
                Express Collection Alerts
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-[#252525] focus:ring-[#252525]"
                  />
                  <span className="text-xs text-[#737373]">
                    Receive instant SMS when order is marked <span className="font-semibold text-[#252525]">Ready for Pickup</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-[#252525] focus:ring-[#252525]"
                  />
                  <span className="text-xs text-[#737373]">
                    Receive 2-minute deadline countdown reminder before late pickup fee is applied
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}
