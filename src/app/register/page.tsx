'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { UtensilsCrossed, ArrowRight, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engg.');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login('student', email);
      updateUser({
        name,
        rollNumber,
        department,
        phone,
      });

      showToast({
        type: 'success',
        title: 'Account Registered Successfully',
        message: `Welcome to QueueLess, ${name}! Your wallet is credited with ₹450 demo credit.`,
      });

      router.push('/student/dashboard');
    }, 450);
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
          Create Student Account
        </h1>
        <p className="mt-1 text-xs text-[#525866]">
          Register with your campus roll number to pre-order lunch meals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Roll / Student ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="2024CS1042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                  Phone (for SMS)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                placeholder="aarav.sharma@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#1B4332] text-gray-900"
              >
                <option value="Computer Science & Engg.">Computer Science & Engg.</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
                <option value="Mechanical Engg.">Mechanical Engg.</option>
                <option value="School of Management">School of Management</option>
                <option value="Department of Biotechnology">Department of Biotechnology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1C1E] mb-1.5">
                Account Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
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
              Register & Start Ordering
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500">
            <span>Already have a campus account? </span>
            <Link
              href="/login"
              className="font-semibold text-[#1B4332] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
