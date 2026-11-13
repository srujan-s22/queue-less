'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Role } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { UserCheck, Shield, ChefHat, GraduationCap, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { menuService } from '@/services/menuService';
import { configService } from '@/services/configService';

export const RoleDemoSwitcher: React.FC = () => {
  const { role, user, switchRole } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show on root landing page if desired, or show everywhere for convenience
  const handleRoleSelect = (targetRole: Role) => {
    switchRole(targetRole);
    showToast({
      type: 'info',
      title: `Switched to ${targetRole.toUpperCase()} mode`,
      message: `Active profile: ${targetRole === 'student' ? 'Aarav Sharma' : targetRole === 'staff' ? 'Ramesh Patel' : 'Dr. Ananya Iyer'}`,
    });

    if (targetRole === 'student' && !pathname.startsWith('/student')) {
      router.push('/student/dashboard');
    } else if (targetRole === 'staff' && !pathname.startsWith('/staff')) {
      router.push('/staff/dashboard');
    } else if (targetRole === 'admin' && !pathname.startsWith('/admin')) {
      router.push('/admin/dashboard');
    }
  };

  const handleResetData = () => {
    orderService.resetDefaults();
    menuService.resetDefaults();
    configService.resetDefaults();
    showToast({
      type: 'success',
      title: 'Mock Data Reset',
      message: 'All menu items, slots, and sample orders restored to original state.',
    });
    // Hard refresh to reload state
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 select-none">
      <div className="bg-[#1A1C1E] text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-xs transition-all duration-300">
        {/* Header Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2.5 font-medium hover:bg-white/5 transition-colors w-full text-left"
          title="Toggle Role & Demo Controls"
        >
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-white/60">Role:</span>
          <span className="font-semibold capitalize text-[#34D399] flex items-center gap-1.5">
            {role === 'student' && <GraduationCap className="w-3.5 h-3.5 inline" />}
            {role === 'staff' && <ChefHat className="w-3.5 h-3.5 inline" />}
            {role === 'admin' && <Shield className="w-3.5 h-3.5 inline" />}
            {role}
          </span>
          <span className="text-white/40 text-[10px] hidden sm:inline">({user.name.split(' ')[0]})</span>
          <span className="ml-1 text-white/40">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </span>
        </button>

        {/* Expanded Panel */}
        {isOpen && (
          <div className="p-3 pt-1 border-t border-white/10 space-y-2.5 min-w-[220px]">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Switch Environment</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleRoleSelect('student')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                  role === 'student'
                    ? 'bg-[#1B4332] border-[#34D399] text-white font-semibold shadow-sm'
                    : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1" />
                <span>Student</span>
              </button>

              <button
                onClick={() => handleRoleSelect('staff')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                  role === 'staff'
                    ? 'bg-[#1B4332] border-[#34D399] text-white font-semibold shadow-sm'
                    : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ChefHat className="w-4 h-4 mb-1" />
                <span>Staff</span>
              </button>

              <button
                onClick={() => handleRoleSelect('admin')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                  role === 'admin'
                    ? 'bg-[#1B4332] border-[#34D399] text-white font-semibold shadow-sm'
                    : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 mb-1" />
                <span>Admin</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-white/50 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {user.email}
              </span>
              <button
                onClick={handleResetData}
                title="Reset mock orders and menu to defaults"
                className="flex items-center gap-1 text-[#F59E0B] hover:text-[#FBBF24] transition-colors font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
