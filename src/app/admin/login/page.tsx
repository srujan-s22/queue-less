'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email.trim(), password);
      if (user.role !== 'admin') {
        setErrorMessage('Access denied: this account does not have administrative privileges.');
        showToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Account is not an administrator.',
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Admin Session Initialized',
        message: `Welcome, ${user.name}!`,
      });
      router.push('/admin/dashboard');
    } catch (error: any) {
      const msg = error.message || 'Invalid administrator credentials.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: 'Admin Login Failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#252525] text-white flex items-center justify-center mx-auto shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#252525]">
          Canteen Administration Portal
        </h2>
        <p className="mt-1 text-xs text-[#737373]">
          Apex University Amenities, Rates & Queue Governance Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Administrator Campus Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@campus.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <Mail className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#737373] hover:text-[#252525] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Access Administrative Dashboard
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#737373] border-t border-[#F0F0F0] flex justify-between">
            <Link
              href="/login"
              className="font-semibold text-[#737373] hover:text-[#252525]"
            >
              ← Unified Sign In
            </Link>
            <Link
              href="/register"
              className="font-semibold text-[#252525] hover:underline"
            >
              Register Admin Key →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
