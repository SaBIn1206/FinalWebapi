import type { Metadata } from 'next';
import CheckoutPage from './page.client';

export const generateMetadata = (): Metadata => ({
  title: 'Secure Checkout | Bakery Hub',
  description: 'Complete your order with secure payment and delivery options.',
  robots: 'noindex, nofollow',
});

export default CheckoutPage;