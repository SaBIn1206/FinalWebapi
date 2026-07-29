import type { Metadata } from 'next';
import CartPage from './page.client';

export const generateMetadata = (): Metadata => ({
  title: 'Your Cart | Bakery Hub',
  description: 'Review your cart items, apply coupons, and proceed to checkout.',
  robots: 'noindex, nofollow',
});

export default CartPage;