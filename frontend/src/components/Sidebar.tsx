'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu } from 'lucide-react';
import { NavSection, NavItem, accountActions } from '@/lib/navigation';

interface SidebarProps {
  variant: 'customer' | 'admin';
  sections: NavSection[];
  brandLabel: string;
  label: string;
  onLogout: () => void;
  onMenu?: () => void;
}

export default function Sidebar({ variant, sections, brandLabel, label, onLogout, onMenu }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (item: NavItem) => {
    // Exact match, but avoid the bare "/admin" highlighting every sub-route.
    if (item.href === '/admin') return pathname === '/admin';
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const theme =
    variant === 'admin'
      ? {
          wrap: 'bg-stone-900 border-stone-800 text-stone-100',
          brand: 'text-white',
          brandAccent: 'text-rose-500',
          sectionLabel: 'text-stone-500',
          linkBase: 'text-stone-400 hover:text-white hover:bg-stone-800',
          linkActive: 'bg-rose-600 text-white shadow-md',
          meta: 'text-stone-400',
          metaAccent: 'text-stone-200',
        }
      : {
          wrap: 'bg-white border-stone-200 text-stone-900',
          brand: 'text-stone-900',
          brandAccent: 'text-rose-600',
          sectionLabel: 'text-stone-400',
          linkBase: 'text-stone-700 hover:text-rose-600 hover:bg-stone-50',
          linkActive: 'bg-rose-50 text-rose-600',
          meta: 'text-stone-500',
          metaAccent: 'text-stone-800',
        };

  return (
    <aside
      className={`w-full md:w-64 shrink-0 ${theme.wrap} border-b md:border-b-0 md:border-r`}
    >
      {/* Brand */}
      <div className="p-6 border-b border-stone-100 md:border-stone-800 flex items-center justify-between md:block">
        <div className="flex items-center gap-2">
          {onMenu && (
            <button
              onClick={onMenu}
              className="md:hidden p-1.5 -ml-1.5 text-stone-600 rounded-lg hover:bg-stone-100"
              aria-label="Open navigation"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <Link href="/" className={`text-xl font-black tracking-tight flex items-center gap-1.5 ${theme.brand}`}>
            {variant === 'admin' && <span className="text-rose-500">🛡</span>}
            <span>Bakery<span className={theme.brandAccent}>Hub</span></span>
          </Link>
        </div>
        <span className={`block text-[10px] font-extrabold uppercase tracking-widest mt-1 md:mt-2 ${theme.brandAccent}`}>
          {label}
        </span>
      </div>

      {/* Account meta (admin only) */}
      {variant === 'admin' && user && (
        <div className="p-6 hidden md:block">
          <div className={`text-xs ${theme.meta}`}>Account:</div>
          <div className={`font-bold text-sm mt-0.5 line-clamp-1 ${theme.metaAccent}`}>{user.name}</div>
          <div className="text-[10px] font-mono mt-0.5 text-stone-500">{user.email}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-6">
        {sections.map((section) => {
          const visible = section.items.filter((item) => !item.adminOnly || user?.role === 'ADMIN');
          if (visible.length === 0) return null;
          return (
            <div key={section.label}>
              <p className={`px-4 text-[10px] font-extrabold uppercase tracking-widest mb-2 ${theme.sectionLabel}`}>
                {section.label}
              </p>
              <div className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-0">
                {visible.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-4 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                        active ? theme.linkActive : theme.linkBase
                      }`}
                    >
                      {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Sign out (only for authenticated users) */}
        {user && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-2.5 px-4 py-3 text-sm font-bold rounded-xl transition-all w-full text-left whitespace-nowrap ${
              variant === 'admin'
                ? 'text-rose-400 hover:bg-rose-950/20'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <accountActions.logout.icon className="h-4.5 w-4.5 shrink-0" />
            <span>{accountActions.logout.name}</span>
          </button>
        )}
      </nav>
    </aside>
  );
}
