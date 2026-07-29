'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInput = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'twitter') => {
    console.log(`TODO: implement ${provider} OAuth`);
  };

  const handleDemoLogin = async (role: 'customer' | 'admin') => {
    setError(null);
    setSubmitting(true);
    try {
      const creds =
        role === 'admin'
          ? { email: 'admin@bakeryhub.com', password: 'AdminPassword123' }
          : { email: 'customer@bakeryhub.com', password: 'CustomerPassword123' };
      await login(creds.email, creds.password);
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full bg-white p-8 rounded-[36px] shadow-sm border border-stone-100">
        <Link
          href="/"
          aria-label="Go back"
          className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <h1
          className="text-center text-4xl mb-6"
          style={{ fontFamily: "'Brush Script MT', cursive", color: '#F5A623' }}
        >
          Bakery Hub
        </h1>

        <h2 className="text-2xl font-bold text-stone-900">Welcome back!</h2>
        <p className="text-sm text-stone-500 mt-1 mb-6">Login to continue</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-800 mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email here"
              className={`w-full rounded-full border px-4 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all ${
                errors.email ? 'border-rose-500' : 'border-stone-300 focus:border-rose-500'
              }`}
            />
            {errors.email && (
              <p className="text-rose-600 text-xs mt-1.5 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-stone-800 mb-2">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Enter your password here"
              className={`w-full rounded-full border px-4 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all ${
                errors.password ? 'border-rose-500' : 'border-stone-300 focus:border-rose-500'
              }`}
            />
            {errors.password && (
              <p className="text-rose-600 text-xs mt-1.5 ml-1">{errors.password.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-sm text-stone-700">Remember me</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-stone-900 hover:bg-rose-600 text-white font-medium py-3 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>

          <p className="text-center text-sm mt-4 mb-6">
            <Link href="#" className="text-stone-600 hover:underline">
              Forgot Password?
            </Link>
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-stone-300" />
            <span className="text-xs text-stone-500 whitespace-nowrap">Or login with</span>
            <div className="flex-1 h-px bg-stone-300" />
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center gap-3 w-full rounded-full py-3 px-4 text-white text-sm font-medium"
              style={{ background: 'linear-gradient(90deg, #7B4FE0 0%, #9B5FE0 100%)' }}
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <GoogleIcon />
              </span>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center gap-3 w-full rounded-full py-3 px-4 text-white text-sm font-medium"
              style={{ background: 'linear-gradient(90deg, #7B4FE0 0%, #9B5FE0 100%)' }}
            >
              <span className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center">
                <FacebookIcon />
              </span>
              Continue with Facebook
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('twitter')}
              className="flex items-center gap-3 w-full rounded-full py-3 px-4 text-white text-sm font-medium"
              style={{ background: 'linear-gradient(90deg, #7B4FE0 0%, #9B5FE0 100%)' }}
            >
              <span className="w-6 h-6 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                <TwitterIcon />
              </span>
              Continue with Twitter
            </button>
          </div>

          <p className="text-center text-sm text-stone-600 mb-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-stone-900 hover:underline">
              Sign Up
            </Link>
          </p>

          <div className="pt-4 border-t border-stone-200 space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-stone-400 text-center">
              Quick Sandboxed Access
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="px-3 py-2 border border-stone-200 hover:border-rose-200 text-xs font-semibold text-stone-600 hover:text-rose-600 rounded-xl bg-stone-50 hover:bg-rose-50/20 text-center transition-colors"
              >
                Demo Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-3 py-2 border border-stone-200 hover:border-rose-200 text-xs font-semibold text-stone-600 hover:text-rose-600 rounded-xl bg-stone-50 hover:bg-rose-50/20 text-center transition-colors"
              >
                Demo Administrator
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.7 34.7 27 36 24 36c-5.4 0-9.9-3.4-11.3-8.1l-6.5 5C9.9 39.7 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.4 5.7-6.3 7.3l6.5 5.5C39.9 37.5 44 31.5 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
      <path d="M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.5-1.9.9-3 1.1a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.6 3.6a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6v.1a4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 1 19a12.7 12.7 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.3-2.3z" />
    </svg>
  );
}