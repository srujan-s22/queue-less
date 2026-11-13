'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Users,
  Settings,
  BarChart3,
  Menu as MenuIcon,
  X,
  Building,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNav = [
    { href: '/admin/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu Catalog', icon: Utensils },
    { href: '/admin/orders', label: 'Order Management', icon: ClipboardList },
    { href: '/admin/staff', label: 'Staff & Counters', icon: Users },
    { href: '/admin/settings', label: 'Rates & Late Fee Config', icon: Settings },
    { href: '/admin/analytics', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#143226] text-white flex-shrink-0 border-r border-[#1B4332] select-none">
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6 text-[#34D399]" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none text-white">QueueLess</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399] mt-1 block">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Institution Info */}
        <div className="px-6 py-3.5 bg-black/15 border-b border-white/5 flex items-center gap-2.5 text-xs text-white/70">
          <Building className="w-4 h-4 text-[#34D399]" />
          <div>
            <p className="font-semibold text-white leading-tight">Apex University Campus</p>
            <p className="text-[10px] text-white/50">Canteen Operations Unit</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#143226] shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-current" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-white/10 bg-black/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#34D399] text-[#143226] flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="text-xs truncate">
            <p className="font-semibold text-white leading-tight truncate">{user.name}</p>
            <p className="text-[10px] text-white/60 truncate">Canteen Administrator</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bar */}
      <div className="md:hidden bg-[#143226] text-white p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#34D399]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm leading-none block">QueueLess Admin</span>
            <span className="text-[10px] text-white/60">Apex University</span>
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
        <div className="md:hidden bg-[#143226] border-b border-white/10 p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-white text-[#143226]' : 'text-white/75 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
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
