'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/images';

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch wishlist items
  const { data: wishlistData, isLoading, refetch, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await API.get('/wishlist');
      return res.data?.wishlist;
    },
    enabled: !!user,
  });

  const handleRemoveWishlist = async (cakeId: string) => {
    try {
      await API.delete(`/wishlist/${cakeId}`);
      refetch();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
                <div className="flex-grow flex items-center justify-center">
          <div className="text-stone-500">Retrieving wishlist items...</div>
        </div>
              </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl space-y-4">
            <Heart className="h-14 w-14 text-stone-300 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-stone-900">Unable to load wishlist</h2>
              <p className="text-stone-500 text-sm mt-1">Something went wrong. Please try again.</p>
            </div>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md transition-colors">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const items = wishlistData || [];

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-8">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl space-y-6 max-w-2xl mx-auto shadow-sm">
            <Heart className="h-14 w-14 text-stone-300 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-stone-900">Your wishlist is empty</h2>
              <p className="text-stone-500 text-sm mt-1">Bookmark cakes while browsing to save them for later.</p>
            </div>
            <Link
              href="/cakes"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md transition-colors"
            >
              Explore Cakes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item: any) => (
              <div key={item.id} className="group hover-card bg-white rounded-3xl overflow-hidden border border-stone-200 flex flex-col h-full shadow-sm">
                
                {/* Image */}
                <div className="block relative aspect-[4/3] bg-stone-100 overflow-hidden">
                   <img
                    src={getImageUrl(item.cake?.images?.[0]?.url) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=305'}
                    alt={item.cake?.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveWishlist(item.cakeId)}
                    className="absolute top-4 right-4 p-2 rounded-full shadow-md bg-white border border-stone-100 text-rose-600 hover:text-rose-700 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <Link
                    href={`/cakes/${item.cakeId}`}
                    className="font-bold text-stone-950 text-base hover:text-rose-600 transition-colors line-clamp-1 mb-2"
                  >
                    {item.cake?.name}
                  </Link>
                  <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed mb-4">{item.cake?.description}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                    <span className="text-lg font-black text-stone-950">{formatPrice(item.cake?.discountPrice || item.cake?.price)}</span>
                    <Link
                      href={`/cakes/${item.cakeId}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-rose-600 text-white font-bold text-xs rounded-full transition-colors"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Customize
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

          </div>
  );
}
