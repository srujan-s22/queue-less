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
} from 'lucide-react';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#171717] text-white flex-shrink-0 border-r border-[#262626] select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#262626] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#252525] border border-[#383838] text-white flex items-center justify-center font-bold shadow-2xs">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none text-white">QueueLess</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A3A3A3] mt-1 block">
              Kitchen Operations
            </span>
          </div>
        </div>

        {/* Counter Info */}
        <div className="px-6 py-4 bg-[#1F1F1F] border-b border-[#262626] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#A3A3A3] block text-[10px] uppercase font-medium">Active Station</span>
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
                    ? 'bg-[#262626] text-white border border-[#383838] shadow-2xs'
                    : 'text-[#A3A3A3] hover:bg-[#1F1F1F] hover:text-white'
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
                        ? 'bg-[#DC2626] text-white animate-pulse'
                        : 'bg-[#333333] text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#262626] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[#383838] flex items-center justify-center text-white font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-[#A3A3A3] truncate">Counter Operator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#252525] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#171717] text-white p-4 flex items-center justify-between border-b border-[#262626]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[#383838] flex items-center justify-center text-white">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-none">QueueLess</span>
            <span className="text-[10px] text-[#A3A3A3] uppercase">Kitchen Terminal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-[#252525]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171717] text-white p-4 space-y-1 border-b border-[#262626]">
          {staffNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:bg-[#1F1F1F]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
