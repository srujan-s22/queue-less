'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import {
  UtensilsCrossed,
  ArrowRight,
  GraduationCap,
  ChefHat,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  BadgeAlert,
} from 'lucide-react';
import { Role } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engg.');
  const [accessKey, setAccessKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleChange = (newRole: Role) => {
    setSelectedRole(newRole);
    setErrorMessage('');
    if (newRole === 'student') {
      setDepartment('Computer Science & Engg.');
    } else if (newRole === 'staff') {
      setDepartment('Central Canteen Operations');
    } else {
      setDepartment('Dean of Student Affairs & Amenities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (selectedRole === 'student' && (!studentId.trim() || studentId.trim().length < 3)) {
      setErrorMessage('A valid Student ID / Roll Number is required (minimum 3 characters).');
      return;
    }

    if ((selectedRole === 'staff' || selectedRole === 'admin') && !accessKey.trim()) {
      setErrorMessage(`${selectedRole.toUpperCase()} registration requires a valid access key.`);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        studentId: selectedRole === 'student' ? studentId.trim() : undefined,
        department: department.trim(),
        phone: phone.trim() || undefined,
        accessKey: selectedRole !== 'student' ? accessKey.trim() : undefined,
      });

      showToast({
        type: 'success',
        title: 'Account Created Successfully',
        message: `Welcome to QueueLess, ${newUser.name}!`,
      });

      if (newUser.role === 'student') {
        router.push('/student/dashboard');
      } else if (newUser.role === 'staff') {
        router.push('/staff/dashboard');
      } else if (newUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error: any) {
      const msg = error.message || 'Registration failed. Please verify your details.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#252525] text-white flex items-center justify-center shadow-2xs">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#252525]">
            QueueLess
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#252525] mt-1">
          Create Your Campus Account
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          Select your campus role to configure your portal access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#252525] mb-2 text-center">
              Select Registration Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'student'
                    ? 'bg-[#252525] text-white border-[#252525] shadow-xs'
                    : 'bg-[#EDEDEB] text-[#737373] border-transparent hover:bg-[#E5E7EB]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('staff')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'staff'
                    ? 'bg-[#252525] text-white border-[#252525] shadow-xs'
                    : 'bg-[#EDEDEB] text-[#737373] border-transparent hover:bg-[#E5E7EB]'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-[#252525] text-white border-[#252525] shadow-xs'
                    : 'bg-[#EDEDEB] text-[#737373] border-transparent hover:bg-[#E5E7EB]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <BadgeAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'student' ? 'e.g. Aarav Sharma' : selectedRole === 'staff' ? 'e.g. Ramesh Patel' : 'e.g. Dr. Ananya Iyer'}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <User className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Student ID / Roll Number (Student Only) */}
            {selectedRole === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                  Student ID / Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024CS1042"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono uppercase"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                {selectedRole === 'student' ? 'Campus Email Address' : selectedRole === 'staff' ? 'Staff Email Address' : 'Admin Email Address'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="user@campus.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <Mail className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Department / Operational Unit */}
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                {selectedRole === 'student' ? 'Academic Department' : selectedRole === 'staff' ? 'Canteen Operational Unit' : 'Administrative Department'}
              </label>
              <div className="relative">
                {selectedRole === 'student' ? (
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] bg-white"
                  >
                    <option value="Computer Science & Engg.">Computer Science & Engg.</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                    <option value="Mechanical Engg.">Mechanical Engg.</option>
                    <option value="School of Management">School of Management</option>
                    <option value="Department of Biotechnology">Department of Biotechnology</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={selectedRole === 'staff' ? 'Central Canteen Operations' : 'Dean of Student Affairs & Amenities'}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                    />
                    <Building className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525] font-mono"
                />
                <Phone className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Access Key (Staff / Admin Only) */}
            {selectedRole !== 'student' && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <label className="block text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>{selectedRole === 'staff' ? 'Staff Security Access Key' : 'Admin Master Access Key'}</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAccessKey ? 'text' : 'password'}
                    required
                    placeholder={`Enter server-side ${selectedRole} key`}
                    value={accessKey}
                    onChange={(e) => {
                      setAccessKey(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-700 text-[#252525] font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessKey(!showAccessKey)}
                    className="absolute right-3 top-2.5 text-amber-700 hover:text-amber-900 focus:outline-none"
                    aria-label={showAccessKey ? 'Hide key' : 'Show key'}
                  >
                    {showAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-800">
                  {selectedRole === 'staff'
                    ? 'Requires authorized kitchen staff authorization key configured on the server.'
                    : 'Requires university administrative clearance master key.'}
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Password (minimum 6 characters) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#737373] hover:text-[#252525] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-[#737373] hover:text-[#252525] focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-[11px] text-red-600">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register as {selectedRole.toUpperCase()}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-[#737373] border-t border-[#F0F0F0]">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="font-semibold text-[#252525] hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
