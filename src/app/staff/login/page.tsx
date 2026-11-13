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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login('staff', 'ramesh.canteen@campus.edu', 'staff123');
      showToast({
        type: 'success',
        title: 'Staff Login Successful',
        message: 'Welcome back, Ramesh Patel (Central Canteen Operations)',
      });
      router.push('/staff/dashboard');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Staff Login Failed',
        message: error.message || 'Invalid staff credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#252525] text-white flex items-center justify-center mx-auto shadow-2xs">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#252525]">
          Canteen Staff Portal
        </h2>
        <p className="mt-1 text-xs text-[#737373]">
          Authorized kitchen operators and collection counter staff terminal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Assigned Counter ID
              </label>
              <input
                type="text"
                value={counterId}
                onChange={(e) => setCounterId(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Operator Security PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono"
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
          <div className="p-3 bg-[#EDEDEB] rounded-xl border border-[#E5E7EB] text-[11px] text-[#252525] space-y-1">
            <span className="font-semibold block flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Pre-filled Evaluation Credentials:
            </span>
            <p className="text-[#737373]">Counter: COUNTER-02 • PIN: 4421 (Ramesh Patel)</p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-[#737373] hover:text-[#252525]"
            >
              ← Back to Platform Landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
