'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { configService } from '@/services/configService';
import {
  UtensilsCrossed,
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Clock,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  Sparkles,
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const config = configService.getConfig();

  const navLinks = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/menu', label: 'Food Menu', icon: BookOpen },
    { href: '/student/cart', label: 'Tray / Cart', icon: ShoppingBag, count: totalCount },
    { href: '/student/orders', label: 'My Orders', icon: Clock },
    { href: '/student/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col">
      {/* Top Announcement Bar */}
      {config.announcement && (
        <div className="bg-[#1B4332] text-white text-xs px-4 py-2 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{config.announcement}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1B4332] flex items-center justify-center text-white shadow-xs">
                <UtensilsCrossed className="w-5 h-5 text-[#34D399]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#1A1C1E] leading-none">
                  Queue<span className="text-[#1B4332]">Less</span>
                </span>
                <span className="text-[10px] text-[#525866] font-medium tracking-wider uppercase mt-0.5">
                  Campus Canteen
                </span>
              </div>
            </Link>

            {/* Operating status badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF5EE] text-[#1B4332] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Canteen Open</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Until {config.operatingHours.close}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/student/dashboard' && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-2xs'
                      : 'text-[#525866] hover:text-[#1A1C1E] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#F59E0B] text-black'
                          : 'bg-[#1B4332] text-white'
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/student/cart"
              className="md:hidden relative p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              aria-label="View Tray"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1B4332] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>

            <Link
              href="/student/profile"
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-[#E5E7EB] hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-xs font-semibold text-[#1A1C1E] leading-tight">{user.name}</span>
                <span className="text-[10px] text-[#525866] font-mono leading-tight">{user.rollNumber}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/student/dashboard' && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-[#1B4332] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F59E0B] text-black">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#525866]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1A1C1E]">QueueLess</span>
            <span>•</span>
            <span>Campus Canteen Pre-Ordering System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/menu" className="hover:text-[#1A1C1E]">Menu</Link>
            <Link href="/student/orders" className="hover:text-[#1A1C1E]">Track Orders</Link>
            <Link href="/staff/dashboard" className="hover:text-[#1A1C1E] text-[#1B4332] font-medium">Staff Portal</Link>
            <Link href="/admin/dashboard" className="hover:text-[#1A1C1E] text-[#1B4332] font-medium">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
