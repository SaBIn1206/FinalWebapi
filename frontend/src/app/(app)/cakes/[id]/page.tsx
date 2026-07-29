import type { Metadata } from 'next';
import CakeDetails from './page.client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Custom Cake Details | Bakery Hub',
    description: 'Customize your perfect cake with flavors, weight, messages, and accessories.',
    robots: 'index, follow',
  };
}

export default CakeDetails;