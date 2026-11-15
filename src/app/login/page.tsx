'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { UtensilsCrossed, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
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
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email.trim(), password);
      showToast({
        type: 'success',
        title: 'Sign In Successful',
        message: `Welcome back, ${user.name}!`,
      });

      // Role-based dashboard routing
      if (user.role === 'student') {
        router.push('/student/dashboard');
      } else if (user.role === 'staff') {
        router.push('/staff/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error: any) {
      const msg = error.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: 'Sign In Failed',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#252525] text-white flex items-center justify-center shadow-2xs">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#252525]">
            QueueLess
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#252525] mt-2">
          Sign In to QueueLess
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          Unified campus portal for Students, Kitchen Staff, and Administrators
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
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@campus.edu"
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
                Password
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
              Sign In
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#737373] border-t border-[#F0F0F0]">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="font-semibold text-[#252525] hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
