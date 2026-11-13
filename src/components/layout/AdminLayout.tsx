'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Users,
  Settings,
  BarChart3,
  ShieldCheck,
  Building,
  Menu as MenuIcon,
  X,
  LogOut,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#171717] text-white flex-shrink-0 border-r border-[#262626] select-none">
        {/* Brand */}
        <div className="p-6 border-b border-[#262626] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#252525] border border-[#383838] text-white flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-none text-white">QueueLess</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A3A3A3] mt-1 block">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Institution Info */}
        <div className="px-6 py-3.5 bg-[#1F1F1F] border-b border-[#262626] flex items-center gap-2.5 text-xs text-[#A3A3A3]">
          <Building className="w-4 h-4 text-[#A3A3A3]" />
          <div>
            <p className="font-semibold text-white leading-tight">Apex University Campus</p>
            <p className="text-[10px] text-[#A3A3A3]">Canteen Operations Unit</p>
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
                    ? 'bg-[#262626] text-white border border-[#383838] shadow-2xs'
                    : 'text-[#A3A3A3] hover:bg-[#1F1F1F] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-current" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-[#262626] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[#383838] flex items-center justify-center font-bold text-xs text-white">
              {user.name.charAt(0)}
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-white leading-tight truncate">{user.name}</p>
              <p className="text-[10px] text-[#A3A3A3] truncate">Canteen Administrator</p>
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

      {/* Mobile Bar */}
      <div className="md:hidden bg-[#171717] text-white p-4 flex items-center justify-between border-b border-[#262626]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[#383838] flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-none">QueueLess</span>
            <span className="text-[10px] text-[#A3A3A3] uppercase">Admin Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-[#252525]"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171717] text-white p-4 space-y-1 border-b border-[#262626]">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:bg-[#1F1F1F]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
