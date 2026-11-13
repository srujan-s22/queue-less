'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { totalCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState(() => configService.getConfig());

  useEffect(() => {
    configService.fetchConfig().then(setConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const navLinks = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/menu', label: 'Food Menu', icon: BookOpen },
    { href: '/student/cart', label: 'Tray / Cart', icon: ShoppingBag, count: totalCount },
    { href: '/student/orders', label: 'My Orders', icon: Clock },
    { href: '/student/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col">
      {/* Top Announcement Bar */}
      {config.announcement && (
        <div className="bg-[#252525] text-white text-xs px-4 py-2 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{config.announcement}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#252525] flex items-center justify-center text-white shadow-2xs">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#252525] leading-none">
                  QueueLess
                </span>
                <span className="text-[10px] text-[#737373] font-medium tracking-wider uppercase mt-0.5">
                  Campus Canteen
                </span>
              </div>
            </Link>

            {/* Operating status badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Canteen Open</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#15803D]/80">Until {config.operatingHours.close}</span>
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all relative ${
                    isActive
                      ? 'bg-[#252525] text-white shadow-2xs'
                      : 'text-[#737373] hover:text-[#252525] hover:bg-[#EDEDEB]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-[#252525]'
                          : 'bg-[#252525] text-white'
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
              className="md:hidden relative p-2 rounded-xl text-[#252525] hover:bg-[#EDEDEB]"
              aria-label="View Tray"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#252525] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>

            <Link
              href="/student/profile"
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors"
            >
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-xs font-semibold text-[#252525] leading-tight">{user?.name || 'Student'}</span>
                <span className="text-[10px] text-[#737373] font-mono leading-tight">{user?.rollNumber || ''}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#252525] text-white flex items-center justify-center text-xs font-bold">
                {(user?.name || 'S').charAt(0)}
              </div>
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#252525] hover:bg-[#EDEDEB]"
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
                      ? 'bg-[#252525] text-white'
                      : 'text-[#737373] hover:text-[#252525] hover:bg-[#EDEDEB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EDEDEB] text-[#252525]">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#252525]">QueueLess</span>
            <span>•</span>
            <span>Campus Canteen Pre-Ordering System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/menu" className="hover:text-[#252525]">Menu</Link>
            <Link href="/student/orders" className="hover:text-[#252525]">Track Orders</Link>
            <Link href="/staff/dashboard" className="hover:text-[#252525] text-[#252525] font-medium">Staff Portal</Link>
            <Link href="/admin/dashboard" className="hover:text-[#252525] text-[#252525] font-medium">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
