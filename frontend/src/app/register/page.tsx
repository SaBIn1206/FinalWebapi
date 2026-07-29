'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cake, UserPlus, Key, Mail, User, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormInput = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setError(null);
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
        
        {/* Soft top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-amber-500"></div>

        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 justify-center">
            <Cake className="h-8 w-8 text-rose-600 animate-pulse" />
            <span className="text-2xl font-black text-stone-900">Bakery<span className="text-rose-600">Hub</span></span>
          </Link>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Name Input */}
            <div>
              <label className="block text-stone-700 text-sm font-semibold mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-800 transition-all ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500/10' : 'border-stone-300'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-rose-600 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            {/* Email input */}
            <div>
              <label className="block text-stone-700 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-800 transition-all ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/10' : 'border-stone-300'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-rose-600 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password input */}
            <div>
              <label className="block text-stone-700 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Key className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full pl-11 pr-11 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-800 transition-all ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/10' : 'border-stone-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-600 text-xs mt-1.5">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms-check"
              name="terms-check"
              type="checkbox"
              required
              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-stone-300 rounded"
            />
            <label htmlFor="terms-check" className="ml-2 block text-sm text-stone-600">
              I agree to the{' '}
              <Link href="/terms" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
                Terms & Conditions
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : (
              <>
                <UserPlus className="h-5 w-5" /> Create Account
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
