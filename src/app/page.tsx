'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed, ArrowRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // If user is already authenticated, redirect to their role-specific dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'student') {
        router.replace('/student/dashboard');
      } else if (user.role === 'staff') {
        router.replace('/staff/dashboard');
      } else if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // While restoring session from server, render a minimal clean loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#252525] text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#737373]">
            <Loader2 className="w-4 h-4 animate-spin text-[#252525]" />
            <span>Loading QueueLess...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated and redirect is in progress, keep minimal state
  if (isAuthenticated && user?.role) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#252525] text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs text-[#737373]">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#252525] flex flex-col justify-between selection:bg-[#252525] selection:text-white">
      {/* Minimal Header */}
      <header className="w-full border-b border-[#E5E7EB] bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#252525] text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#252525]">
              QueueLess
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#737373] hover:text-[#252525] px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#252525] text-white hover:bg-[#171717] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Entry */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-8 sm:p-10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#252525] text-white flex items-center justify-center shadow-xs mx-auto">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Welcome to QueueLess
            </h1>
            <p className="text-sm text-[#737373] leading-relaxed">
              Your campus food ordering experience, simplified.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#252525] text-white text-sm font-semibold hover:bg-[#171717] shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#E5E7EB] text-[#252525] text-sm font-semibold hover:bg-[#EDEDEB] shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Register</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-[#E5E7EB] bg-white py-4 text-center">
        <p className="text-xs text-[#737373]">
          QueueLess • Campus Canteen Pre-Ordering & Collection Management
        </p>
      </footer>
    </div>
  );
}
