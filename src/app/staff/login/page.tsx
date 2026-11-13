'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { ChefHat, ArrowRight, KeyRound } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [counterId, setCounterId] = useState('COUNTER-02');
  const [pin, setPin] = useState('4421');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login('staff', 'ramesh.canteen@campus.edu');
      showToast({
        type: 'success',
        title: 'Staff Login Successful',
        message: 'Welcome back, Ramesh Patel (Counter #2 Express)',
      });
      router.push('/staff/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mx-auto shadow-md">
          <ChefHat className="w-7 h-7 text-[#34D399]" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#1A1C1E]">
          Canteen Staff Portal
        </h2>
        <p className="mt-1 text-xs text-[#525866]">
          Authorized kitchen operators and collection counter staff terminal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Assigned Counter ID
              </label>
              <input
                type="text"
                value={counterId}
                onChange={(e) => setCounterId(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Operator Security PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900 font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Kitchen Terminal
            </Button>
          </form>

          {/* Quick preset credentials notice */}
          <div className="p-3 bg-[#EBF5EE] rounded-xl border border-[#1B4332]/15 text-[11px] text-[#1B4332] space-y-1">
            <span className="font-semibold block flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Pre-filled Evaluation Credentials:
            </span>
            <p>Counter: COUNTER-02 • PIN: 4421 (Ramesh Patel)</p>
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
