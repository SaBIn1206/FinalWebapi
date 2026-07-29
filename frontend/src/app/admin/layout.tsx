'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { adminNav } from '@/lib/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-ink-soft">
        <div className="font-medium">Verifying administrator rights...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <AppShell variant="admin" sections={adminNav} label="Console Admin" onLogout={handleLogout}>
      {children}
    </AppShell>
  );
}
