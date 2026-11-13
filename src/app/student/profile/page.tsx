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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
            Student Account Profile
          </h1>
          <p className="text-xs text-[#525866] mt-0.5">
            Manage your campus canteen credentials, balance, and collection alerts.
          </p>
        </div>

        {/* Digital Campus Wallet Card */}
        <div className="bg-[#1B4332] text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#34D399]">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-white/70 font-semibold block">
                QueueLess Campus Wallet
              </span>
              <div className="text-3xl font-bold text-white mt-0.5">
                ₹{user.walletBalance ?? 450}
              </div>
              <p className="text-xs text-[#34D399] mt-0.5">Instant 1-tap express checkout active</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 mr-1 hidden sm:inline">Quick Top-up:</span>
            {[100, 200, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => handleTopupWallet(amt)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <h2 className="font-bold text-sm text-[#1A1C1E] uppercase tracking-wider border-b border-gray-100 pb-3">
              Campus Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Roll / Registration Number
                </label>
                <input
                  type="text"
                  disabled
                  value={user.rollNumber || '2024CS1042'}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Mobile Number (for pickup SMS)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Academic Department / School
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
                />
              </div>
            </div>

            {/* Notification settings */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1C1E]">
                Express Collection Alerts
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B4332] focus:ring-[#1B4332]"
                  />
                  <span className="text-xs text-gray-700">
                    Receive instant SMS when order is marked <span className="font-semibold text-[#1B4332]">Ready for Pickup</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B4332] focus:ring-[#1B4332]"
                  />
                  <span className="text-xs text-gray-700">
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
