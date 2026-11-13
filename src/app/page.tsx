'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  UtensilsCrossed,
  ArrowRight,
  GraduationCap,
  ChefHat,
  ShieldCheck,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { switchRole } = useAuth();

  const handleLaunchRole = (role: 'student' | 'staff' | 'admin', path: string) => {
    switchRole(role);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1A1C1E] flex flex-col selection:bg-[#1B4332] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
              <UtensilsCrossed className="w-5 h-5 text-[#34D399]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1A1C1E]">
              Queue<span className="text-[#1B4332]">Less</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#525866] hover:text-[#1A1C1E] px-3 py-2 rounded-xl transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleLaunchRole('student', '/student/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143226] shadow-xs transition-all active:scale-95"
            >
              <span>Launch Student App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#34D399]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] border border-[#1B4332]/20 text-[#1B4332] text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Campus Dining Reimagined • Phase 1 Production Foundation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1C1E] max-w-4xl mx-auto leading-[1.12]">
            Order during class. <br className="hidden sm:inline" />
            <span className="text-[#1B4332]">Skip the queue.</span> Collect hot meals.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-[#525866] leading-relaxed">
            QueueLess enables university students to pre-order canteen dishes with reserved pickup slots, eliminating congested counter crowds and saving 20+ minutes every break.
          </p>

          {/* Direct Portals Quick Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleLaunchRole('student', '/student/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1B4332] text-white font-semibold text-sm hover:bg-[#143226] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <GraduationCap className="w-5 h-5 text-[#34D399]" />
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleLaunchRole('staff', '/staff/dashboard')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[#1A1C1E] font-semibold text-sm hover:bg-[#F4F3EE] shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ChefHat className="w-4 h-4 text-[#1B4332]" />
              <span>Kitchen Staff Terminal</span>
            </button>

            <button
              onClick={() => handleLaunchRole('admin', '/admin/dashboard')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white border border-[#E5E7EB] text-[#1A1C1E] font-semibold text-sm hover:bg-[#F4F3EE] shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShieldCheck className="w-4 h-4 text-[#143226]" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </section>

      {/* The 3 Dedicated Role Experiences Showcase */}
      <section className="py-16 bg-[#F4F3EE] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1B4332]">
              Three Role Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C1E]">
              Dedicated Workspaces for Campus Dining
            </h2>
            <p className="text-xs sm:text-sm text-[#525866]">
              Engineered with distinct UI hierarchies for students ordering meals, kitchen staff preparing tickets, and administrators managing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role Card 1: Student */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between hover:border-[#1B4332]/40 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1C1E]">Student Portal</h3>
                  <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                    Browse menu, reserve pickup slots, track live ticket progression with countdown timers and automated late pickup protection.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Food Menu with dietary filtering & customizations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Slot selection with capacity meters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Live 5-step order tracker & countdown timer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Campus digital wallet & reorder history</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleLaunchRole('student', '/student/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143226] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Launch Student Experience</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role Card 2: Staff */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between hover:border-[#1B4332]/40 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#1B4332] flex items-center justify-center">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1C1E]">Canteen Staff Portal</h3>
                  <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                    High-efficiency kitchen pipeline to accept incoming tickets, manage prep queues, stage ready orders, and confirm student handovers.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Real-time incoming orders with reject reasons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Kitchen preparation queue tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Counter staging with quick token lookup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>One-tap Item 86 stock availability toggle</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleLaunchRole('staff', '/staff/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#1A1C1E] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Launch Kitchen Terminal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role Card 3: Admin */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between hover:border-[#1B4332]/40 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#143226] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1C1E]">Admin Console</h3>
                  <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                    Campus-level control over menu items, pickup slot capacities, grace periods, late penalty charges, and dining reports.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#143226]" />
                    <span>Executive analytics & hourly volume heatmaps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#143226]" />
                    <span>Full Menu Catalog CRUD & price updater</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#143226]" />
                    <span>Pickup slot capacity & late fee configuration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#143226]" />
                    <span>Staff rosters & downloadable CSV audits</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleLaunchRole('admin', '/admin/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#143226] text-white text-xs font-semibold hover:bg-[#0E231B] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Launch Admin Console</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After Comparison */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1C1E]">
            Transforming the Campus Lunch Break
          </h2>
          <p className="text-xs text-[#525866]">
            Why university students and food operators love QueueLess
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* The Old Way */}
          <div className="p-6 rounded-3xl bg-red-50/60 border border-red-200 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 block">
              Without QueueLess
            </span>
            <h3 className="font-bold text-base text-red-900">
              The 25-Minute Lunch Queue Nightmare
            </h3>
            <ul className="space-y-2 text-xs text-red-800/90 leading-relaxed">
              <li>• Bell rings: 400+ students rush to the counter at the exact same minute.</li>
              <li>• Standing in noisy, crowded lines for 20–25 minutes.</li>
              <li>• Popular food items run out right when you finally reach the cashier.</li>
              <li>• Barely 5 minutes left to gulp down food before the next class starts.</li>
            </ul>
          </div>

          {/* The QueueLess Way */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 block">
              With QueueLess
            </span>
            <h3 className="font-bold text-base text-emerald-950">
              Zero Queues • 2-Minute Express Handover
            </h3>
            <ul className="space-y-2 text-xs text-emerald-900/90 leading-relaxed">
              <li>• Browse today&apos;s special catalog during the final 10 minutes of lecture.</li>
              <li>• Reserve an allocated pickup slot (e.g. 1:00–1:15 PM) matching your break.</li>
              <li>• Walk directly to the express priority collection counter and show your token.</li>
              <li>• Enjoy a relaxed 25-minute lunch break with hot, freshly prepared food.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E5E7EB] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#525866]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <span className="font-bold text-[#1A1C1E]">QueueLess</span>
            <span>—</span>
            <span>Apex University Campus Canteen Pre-Ordering System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-900">Sign In</Link>
            <Link href="/register" className="hover:text-gray-900">Register</Link>
            <Link href="/student/dashboard" className="hover:text-gray-900 text-[#1B4332] font-semibold">Student Portal</Link>
            <Link href="/staff/dashboard" className="hover:text-gray-900 text-[#1B4332] font-semibold">Kitchen Staff</Link>
            <Link href="/admin/dashboard" className="hover:text-gray-900 text-[#1B4332] font-semibold">Administrator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
