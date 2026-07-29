import type { Metadata } from 'next';
import LandingPage from './page.client';

export const generateMetadata = (): Metadata => ({
  title: 'Bakery Hub | Premium Custom Cakes & Combo Delivery',
  description: 'Browse luxury cakes, customize flavors and weight, apply coupons, and get delivery in standard, same-day, or midnight slots.',
  openGraph: {
    title: 'Bakery Hub | Premium Custom Cakes & Combo Delivery',
    description: 'Browse luxury cakes, customize flavors and weight, apply coupons, and get delivery in standard, same-day, or midnight slots.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Bakery Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bakery Hub | Premium Custom Cakes & Combo Delivery',
    description: 'Browse luxury cakes, customize flavors and weight, apply coupons, and get delivery in standard, same-day, or midnight slots.',
  },
});

export default LandingPage;