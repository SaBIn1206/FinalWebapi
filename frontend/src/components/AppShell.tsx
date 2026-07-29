'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { NavSection, accountActions } from '@/lib/navigation';

interface AppShellProps {
  variant: 'customer' | 'admin';
  sections: NavSection[];
  label: string;
  onLogout: () => void;
  children: React.ReactNode;
}

/**
 * The single, persistent navigation for authenticated areas. One sidebar only
 * (no top bar), used on every post-login page so navigation never changes
 * context between managing orders and ordering new cakes.
 */
export default function AppShell({ variant, sections, label, onLogout, children }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = sidebarRef.current?.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      <div className={`${mobileOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 md:static md:inset-auto`}>
        <div
          className={`absolute inset-0 bg-stone-900/40 md:hidden ${mobileOpen ? '' : 'hidden'}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <div ref={sidebarRef} className="relative h-full md:h-auto">
          <Sidebar
            variant={variant}
            sections={sections}
            brandLabel="BakeryHub"
            label={label}
            onLogout={onLogout}
            onMenu={variant === 'customer' ? () => setMobileOpen(true) : undefined}
          />
        </div>
      </div>

      <main className="flex-grow p-6 sm:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
