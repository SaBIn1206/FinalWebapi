'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { Cake, Gift, ShieldCheck, Flame, Star, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { getImageUrl } from '@/lib/images';

export default function LandingPage() {
  // Fetch popular products for featured section
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
      const res = await API.get('/products?limit=4&sort=popular');
      return res.data?.products;
    }
  });

  // Fetch combos for bundles section
  const { data: combosData, isLoading: combosLoading, error: combosError } = useQuery({
    queryKey: ['combos-home'],
    queryFn: async () => {
      const res = await API.get('/combos');
      return res.data?.combos;
    }
  });

  // Static Category Highlights
  const categories = [
    { name: 'Birthday Cakes', slug: 'birthday-cakes', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=400&auto=format&fit=crop' },
    { name: 'Anniversary Cakes', slug: 'anniversary-cakes', image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400&auto=format&fit=crop' },
    { name: 'Wedding Cakes', slug: 'wedding-cakes', image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=400&auto=format&fit=crop' },
    { name: 'Cupcakes', slug: 'cupcakes', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&auto=format&fit=crop' },
    { name: 'Cheesecakes', slug: 'cheesecakes', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-night-elevated via-stone-800 to-night text-white py-24 sm:py-32 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&auto=format&fit=crop')" }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Flame className="h-3 w-3" /> Gourmet Bakery & Custom Patisserie
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6">
              Indulge in Exquisite <br />
              <span className="text-gradient">Handcrafted Cakes</span>
            </h1>
            <p className="text-lg sm:text-xl text-ink-faint mb-10 leading-relaxed">
              Every celebration deserves a masterpiece. Order customized cakes, select specialty flavors, and schedule fresh midnight or same-day delivery right to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/cakes"
                className="px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-900/30 transition-all duration-200"
              >
                Browse Cakes
              </Link>
              <Link
                href="#combos"
                className="px-8 py-4 rounded-full border border-border-strong hover:border-white text-ink-faint hover:text-white font-medium transition-all"
              >
                Combo Offers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Points */}
      <section className="py-12 bg-surface-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                <Cake className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-lg">100% Fresh Ingredients</h3>
                <p className="text-ink-soft text-sm mt-1">Baked fresh daily using premium, organic ingredients with no additives.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-lg">Midnight &amp; Scheduled Delivery</h3>
                <p className="text-ink-soft text-sm mt-1">Surprise your loved ones right at 12:00 AM with our midnight option.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-border rounded-2xl text-stone-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-lg">Online Customization</h3>
                <p className="text-ink-soft text-sm mt-1">Add messages, upload image templates, and select custom flavors instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-ink">Browse by Category</h2>
              <p className="text-ink-soft mt-2">Find the perfect design suited for your celebration</p>
            </div>
            <Link href="/cakes" className="group flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
              See All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/cakes?category=${cat.slug}`} className="group relative block rounded-3xl overflow-hidden aspect-[4/5] bg-border shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white font-bold text-lg leading-tight">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-ink">Our Best Sellers</h2>
            <p className="text-ink-soft mt-3">Handcrafted favorites loved by all customers</p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-muted rounded-3xl aspect-[3/4]"></div>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-16 bg-surface border border-border rounded-3xl">
              <p className="text-rose-600 font-medium">Failed to load products. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {productsData?.map((product: any) => (
                <div key={product.id} className="group hover-card bg-canvas rounded-3xl overflow-hidden border border-border flex flex-col h-full">
                  <Link href={`/cakes/${product.id}`} className="block relative aspect-[4/3] bg-border">
                    <Image
                      src={getImageUrl(product.images?.[0]?.url) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {product.discountPrice && (
                      <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase">Save</span>
                    )}
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2">{product.category?.name}</span>
                    <Link href={`/cakes/${product.id}`} className="font-bold text-ink text-lg hover:text-rose-600 transition-colors line-clamp-1 mb-2">{product.name}</Link>
                    <div className="flex items-center gap-1 text-amber-500 text-sm mb-4">
                      <Star className="h-4 w-4 fill-amber-500" />
                      <span className="font-bold text-stone-800">{product.rating}</span>
                      <span className="text-ink-faint">({product.reviews?.length || 0} reviews)</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-ink">{formatPrice(product.discountPrice || product.price)}</span>
                        {product.discountPrice && <span className="text-ink-faint line-through text-sm">{formatPrice(product.price)}</span>}
                      </div>
                      <Link href={`/cakes/${product.id}`} className="p-2 bg-night-elevated hover:bg-rose-600 text-white hover:text-white rounded-full transition-colors">
                        <ShoppingBag className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Combo Offers Spotlight */}
      <section id="combos" className="py-20 bg-night-elevated text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-rose-500 text-xs font-extrabold uppercase tracking-wider">Perfect Bundle Packages</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-white">Celebration Combo Offers</h2>
            </div>
            <p className="text-ink-faint max-w-md">Save on party planning! Get premium cake bundles coupled with accessories, cards, fresh flowers, or custom cards automatically.</p>
          </div>

          {combosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-stone-800 rounded-3xl aspect-[4/5]"></div>
              ))}
            </div>
          ) : combosError ? (
            <div className="text-center py-16">
              <p className="text-rose-400 font-medium">Failed to load combo offers. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {combosData?.map((combo: any) => (
                 <div key={combo.id} className="group flex flex-col h-full bg-night-elevated rounded-3xl overflow-hidden border border-stone-800 hover:border-stone-700 transition-colors">
                   <div className="relative aspect-[3/2] bg-stone-800">
                     <Image
                       src={combo.imageUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600'}
                       alt={combo.name}
                       fill
                       sizes="(max-width: 768px) 100vw, 33vw"
                       className="object-cover group-hover:scale-102 transition-transform duration-300"
                     />
                   </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2">{combo.name}</h3>
                    <p className="text-ink-faint text-sm leading-relaxed mb-6 flex-grow">{combo.description}</p>
                    <div className="mb-6 bg-night-elevated/60 p-4 rounded-2xl">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-rose-500 mb-2">Included Items</h4>
                      <ul className="grid grid-cols-1 gap-1 text-sm text-ink-faint">
                        {combo.items?.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-rose-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-black text-white">{formatPrice(combo.price)}</span>
                      <Link href="/cakes" className="flex items-center gap-1 text-sm font-semibold text-rose-400 hover:text-rose-300">
                        Select Cake <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

        </div>
  );
}