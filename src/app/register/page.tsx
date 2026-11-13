'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerStudent } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engg.');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerStudent({
        name,
        email,
        password,
        studentId: rollNumber,
        department,
        phone,
      });

      showToast({
        type: 'success',
        title: 'Account Registered Successfully',
        message: `Welcome to QueueLess, ${name}!`,
      });

      router.push('/student/dashboard');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Could not complete registration. Please check inputs.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#252525] text-white flex items-center justify-center shadow-2xs">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#252525]">
            QueueLess
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#252525] mt-2">
          Create Student Account
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          Register with your campus roll number to pre-order lunch meals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Roll / Student ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="2024CS1042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Phone (for SMS)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                placeholder="aarav.sharma@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
              >
                <option value="Computer Science & Engg.">Computer Science & Engg.</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
                <option value="Mechanical Engg.">Mechanical Engg.</option>
                <option value="School of Management">School of Management</option>
                <option value="Department of Biotechnology">Department of Biotechnology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Account Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
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

          <div className="pt-2 text-center text-xs text-[#737373]">
            <span>Already have a campus account? </span>
            <Link
              href="/login"
              className="font-semibold text-[#252525] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
