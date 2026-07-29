'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { dashboardNav } from '@/lib/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 font-medium">Verifying account credentials...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell
      variant="customer"
      sections={dashboardNav}
      label="My BakeryHub"
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
