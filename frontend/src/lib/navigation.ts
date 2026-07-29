import {
  ShoppingBag,
  User,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Tag,
  Gift,
  Wand2,
  FolderDot,
  LogOut,
  ArrowLeft,
  Cake,
  Heart,
  Home,
  Info,
  HelpCircle,
  Phone,
  ScrollText,
  FileText,
  Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  href: string;
  icon?: LucideIcon;
  adminOnly?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Single source of truth for in-app navigation.
 * Both the customer dashboard and the admin console consume this config so that
 * every authenticated page shares one consistent layout and exposes the same
 * primary modules (with admin-only modules gated by the `adminOnly` flag).
 */
/**
 * Public storefront navigation shown in the shared sidebar on marketing pages
 * (home, about, faqs, contact, legal). Logged-in users instead see the unified
 * customer sidebar (dashboardNav) via the (app) layout — there is exactly one
 * navigation pattern (the sidebar) across the whole application.
 */
export const publicNav: NavSection[] = [
  {
    label: 'Explore',
    items: [
      { id: 'home', name: 'Home', href: '/', icon: Home },
      { id: 'cakes', name: 'Cakes', href: '/cakes', icon: Cake },
      { id: 'combos', name: 'Combos', href: '/#combos', icon: Gift },
      { id: 'about', name: 'About', href: '/about', icon: Info },
      { id: 'faqs', name: 'FAQs', href: '/faqs', icon: HelpCircle },
      { id: 'contact', name: 'Contact', href: '/contact', icon: Phone },
    ],
  },
  {
    label: 'Legal',
    items: [
      { id: 'terms', name: 'Terms', href: '/terms', icon: ScrollText },
      { id: 'privacy', name: 'Privacy', href: '/privacy', icon: FileText },
    ],
  },
];

/**
 * Unified customer navigation. Replaces the previously separate "Dashboard" and
 * "Order New Cake" navigation by merging the ordering modules with the account
 * workspace into a single sidebar that persists across every authenticated page
 * (dashboard, profile, and the full ordering flow).
 */
export const dashboardNav: NavSection[] = [
  {
    label: 'Order',
    items: [
      { id: 'browse', name: 'Order New Cake', href: '/cakes', icon: Cake },
      { id: 'custom', name: 'Add Item (Custom Cake)', href: '/cakes/custom/new', icon: Plus },
      { id: 'wishlist', name: 'Wishlist', href: '/wishlist', icon: Heart },
      { id: 'cart', name: 'Cart', href: '/cart', icon: ShoppingBag },
    ],
  },
  {
    label: 'My Account',
    items: [
      { id: 'orders', name: 'Orders & Inbox', href: '/dashboard', icon: ShoppingBag },
      { id: 'designs', name: 'My Designs', href: '/dashboard/designs', icon: Wand2 },
      { id: 'profile', name: 'Edit Profile', href: '/dashboard/profile', icon: User },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'admin-dashboard', name: 'Admin Panel', href: '/admin', icon: ShieldCheck, adminOnly: true },
    ],
  },
];

export const adminNav: NavSection[] = [
  {
    label: 'Console',
    items: [
      { id: 'dashboard', name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { id: 'orders', name: 'Manage Orders', href: '/admin/orders', icon: ShoppingBag },
      { id: 'products', name: 'Products', href: '/admin/products', icon: FolderDot },
      { id: 'categories', name: 'Categories', href: '/admin/categories', icon: FolderDot },
      { id: 'coupons', name: 'Coupons', href: '/admin/coupons', icon: Tag },
      { id: 'combos', name: 'Combos', href: '/admin/combos', icon: Gift },
      { id: 'users', name: 'Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'Shortcuts',
    items: [
      { id: 'store', name: 'Back to Store', href: '/', icon: ArrowLeft },
    ],
  },
];

export const accountActions = {
  logout: { name: 'Sign Out', icon: LogOut },
};
