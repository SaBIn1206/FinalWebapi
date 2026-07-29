import type { Metadata } from 'next';
import DashboardPage from './page.client';

export const generateMetadata = (): Metadata => ({
  title: 'My Dashboard | Bakery Hub',
  description: 'View your orders, notifications, and account settings.',
  robots: 'noindex, nofollow',
});

export default DashboardPage;