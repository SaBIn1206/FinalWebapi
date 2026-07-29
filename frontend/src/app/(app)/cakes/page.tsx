import type { Metadata } from 'next';
import CakeCatalog from './page.client';

export const generateMetadata = (): Metadata => ({
  title: 'Cake Catalogue | Bakery Hub',
  description: 'Explore our range of premium custom cakes and cupcakes. Filter by flavor, price, and category.',
  robots: 'index, follow',
});

export default CakeCatalog;