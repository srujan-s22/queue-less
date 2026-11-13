'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { UtensilsCrossed, ArrowRight, GraduationCap, ChefHat, ShieldCheck, KeyRound } from 'lucide-react';
import { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('aarav.sharma@campus.edu');
  const [password, setPassword] = useState('Campus@2026');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleQuickSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('aarav.sharma@campus.edu');
    } else if (role === 'staff') {
      setEmail('ramesh.canteen@campus.edu');
    } else {
      setEmail('ananya.iyer@campus.edu');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(selectedRole, email);
      showToast({
        type: 'success',
        title: `Logged in as ${selectedRole.toUpperCase()}`,
        message: `Welcome to QueueLess platform.`,
      });

      if (selectedRole === 'student') router.push('/student/dashboard');
      else if (selectedRole === 'staff') router.push('/staff/dashboard');
      else router.push('/admin/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-6 h-6 text-[#34D399]" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#1A1C1E]">
            Queue<span className="text-[#1B4332]">Less</span>
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1C1E] mt-2">
          Sign In to Your Campus Portal
        </h1>
        <p className="mt-1 text-xs text-[#525866]">
          Order during class • Pick up during break • Skip the queue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
          {/* Quick Role Switcher Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1C1E] mb-2 text-center">
              Select Demo Role Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickSelect('student')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'student'
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('staff')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'staff'
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect('admin')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In as {selectedRole.toUpperCase()}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500">
            <span>New student on campus? </span>
            <Link
              href="/register"
              className="font-semibold text-[#1B4332] hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
