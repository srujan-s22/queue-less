'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('ananya.iyer@campus.edu');
  const [password, setPassword] = useState('Admin@QueueLess2026');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login('admin', email);
      showToast({
        type: 'success',
        title: 'Admin Session Initialized',
        message: 'Welcome back, Dr. Ananya Iyer (Amenities & Canteen Admin)',
      });
      router.push('/admin/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#143226] text-white flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7 text-[#34D399]" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#1A1C1E]">
          Canteen Administration Portal
        </h2>
        <p className="mt-1 text-xs text-[#525866]">
          Apex University Amenities, Rates & Queue Governance Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Administrator Campus Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#143226] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Master Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#143226] text-gray-900 font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-[#143226] hover:bg-[#0E231B]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Access Administrative Dashboard
            </Button>
          </form>

          {/* Quick preset credentials notice */}
          <div className="p-3 bg-[#EBF5EE] rounded-xl border border-[#143226]/15 text-[11px] text-[#143226] space-y-1">
            <span className="font-semibold block flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Pre-filled Evaluation Credentials:
            </span>
            <p>Admin: ananya.iyer@campus.edu • (Dr. Ananya Iyer)</p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              ← Back to Platform Landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
