'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import {
  ChefHat,
  BellRing,
  Clock,
  CheckCircle,
  Archive,
  ToggleLeft,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  X,
  Volume2,
} from 'lucide-react';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic order counts
  const orders = orderService.getAll();
  const incomingCount = orders.filter((o) => o.status === 'PLACED').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING' || o.status === 'ACCEPTED').length;
  const readyCount = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;

  const staffNav = [
    { href: '/staff/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { href: '/staff/orders', label: 'Incoming Orders', icon: BellRing, count: incomingCount, alert: incomingCount > 0 },
    { href: '/staff/preparation', label: 'Kitchen Queue', icon: Clock, count: preparingCount },
    { href: '/staff/ready', label: 'Ready for Pickup', icon: CheckCircle, count: readyCount },
    { href: '/staff/completed', label: 'Order History', icon: Archive },
    { href: '/staff/menu', label: 'Item 86 / Stock', icon: ToggleLeft },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1A1C1E] text-white flex-shrink-0 border-r border-white/10 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-bold shadow">
            <ChefHat className="w-6 h-6 text-[#34D399]" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none text-white">QueueLess</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399] mt-1 block">
              Kitchen Operations
            </span>
          </div>
        </div>

        {/* Counter Info */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-white/50 block text-[10px] uppercase">Active Station</span>
            <span className="font-semibold text-white">Main Counter #2</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {staffNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-current" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.alert
                        ? 'bg-[#EF4444] text-white animate-pulse'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Operator Profile in footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-xs">
              <p className="font-medium text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-white/50">Staff Operator</p>
            </div>
          </div>
          <Link
            href="/staff/login"
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Top Mobile Bar */}
      <div className="md:hidden bg-[#1A1C1E] text-white p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B4332] flex items-center justify-center text-white font-bold">
            <ChefHat className="w-5 h-5 text-[#34D399]" />
          </div>
          <div>
            <span className="font-bold text-sm leading-none block">QueueLess Kitchen</span>
            <span className="text-[10px] text-emerald-400">Counter #2</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-white/70 hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A1C1E] border-b border-white/10 p-4 space-y-1">
          {staffNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-[#1B4332] text-white' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444] text-white">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
