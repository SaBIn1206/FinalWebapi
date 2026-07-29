'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import { publicNav, NavSection } from '@/lib/navigation';
import { LogIn } from 'lucide-react';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Authenticated visitors browsing the store see the same unified customer
  // sidebar they get inside the app; otherwise the public marketing sidebar.
  const sections: NavSection[] = user
    ? publicNav
    : [
        ...publicNav,
        {
          label: 'Account',
          items: [{ id: 'login', name: 'Login / Register', href: '/login', icon: LogIn }],
        },
      ];

  return (
    <AppShell
      variant="customer"
      sections={sections}
      label="BakeryHub"
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
