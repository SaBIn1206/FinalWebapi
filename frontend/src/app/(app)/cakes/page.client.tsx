'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { Star, Search, SlidersHorizontal, ArrowUpDown, Cake as CakeIcon, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';

  function CakeCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search, filter, sorting, and pagination states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [maxPrice, setMaxPrice] = useState('5000');
  const [minRating, setMinRating] = useState('1');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  // Sync initial category state from query param (e.g. from homepage category clicks)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await API.get('/categories');
      return res.data?.categories;
    }
  });

  // Fetch products with dynamic filters
  const { data: productsData, isLoading, refetch, error } = useQuery({
    queryKey: ['products', search, selectedCategory, selectedFlavor, maxPrice, minRating, sort, page],
    queryFn: async () => {
      const query = new URLSearchParams({
        search,
        category: selectedCategory,
        flavor: selectedFlavor,
        maxPrice,
        minRating,
        sort,
        page: page.toString(),
        limit: '9'
      });
      const res = await API.get(`/products?${query.toString()}`);
      return res.data;
    }
  });

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedFlavor('');
    setMaxPrice('10000');
    setMinRating('1');
    setSort('latest');
    setPage(1);
    router.replace('/cakes');
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const flavors = ['Chocolate', 'Vanilla', 'Red Velvet', 'Strawberry', 'Baked Swirl', 'Blueberry'];

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
       
      {/* Search and Header Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight">Cake Catalogue</h1>
          <p className="text-ink-soft mt-1">Explore our range of premium custom cakes and cupcakes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border-strong rounded-xl text-sm font-semibold text-ink hover:bg-surface"
            aria-expanded={showMobileFilters}
            aria-controls="mobile-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink-faint">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cakes or flavors"
              className="w-full pl-11 pr-4 py-3 border border-border-strong rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-800 transition-all bg-surface"
              placeholder="Search cakes or flavors..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         
          {/* Filters Sidebar */}
            <div className={`lg:col-span-1 bg-surface p-6 rounded-3xl border border-border space-y-8 h-fit shadow-sm ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="font-extrabold text-ink text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-rose-600" /> Filters
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden p-1.5 rounded-lg border border-border hover:bg-canvas text-ink-soft"
                    aria-label="Close filters"
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Reset All
                  </button>
                </div>
              </div>

           {/* Category Filter */}
           <div className="space-y-3">
             <h3 className="font-bold text-ink text-sm">Categories</h3>
             <div className="space-y-2">
               <label className="flex items-center gap-2 text-stone-700 text-sm cursor-pointer">
                 <input
                   type="radio"
                   name="category"
                   checked={selectedCategory === ''}
                   onChange={() => setSelectedCategory('')}
                   className="accent-rose-600 h-4 w-4"
                 />
                 All Categories
               </label>
               {categoriesData?.map((cat: any) => (
                 <label key={cat.id} className="flex items-center gap-2 text-stone-700 text-sm cursor-pointer">
                   <input
                     type="radio"
                     name="category"
                     checked={selectedCategory === cat.slug || selectedCategory === cat.id}
                     onChange={() => setSelectedCategory(cat.slug)}
                     className="accent-rose-600 h-4 w-4"
                   />
                   {cat.name}
                 </label>
               ))}
             </div>
           </div>

           {/* Flavor Filter */}
           <div className="space-y-3">
             <h3 className="font-bold text-ink text-sm">Flavors</h3>
             <select
               value={selectedFlavor}
               onChange={(e) => setSelectedFlavor(e.target.value)}
               className="w-full px-3 py-2.5 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
             >
               <option value="">All Flavors</option>
               {flavors.map(f => (
                 <option key={f} value={f}>{f}</option>
               ))}
             </select>
           </div>

           {/* Max Price Filter */}
           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <h3 className="font-bold text-ink">Max Price</h3>
               <span className="font-black text-rose-600">{formatPrice(Number(maxPrice) || 0)}</span>
             </div>
             <input
               type="range"
               min="10"
               max="10000"
               step="50"
               value={maxPrice}
               onChange={(e) => setMaxPrice(e.target.value)}
               className="w-full accent-rose-600 cursor-pointer"
             />
           </div>

           {/* Min Rating Filter */}
           <div className="space-y-3">
             <h3 className="font-bold text-ink text-sm">Min Rating</h3>
             <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setMinRating(star.toString())}
                    aria-label={`Minimum rating ${star} star${star > 1 ? 's' : ''}`}
                    aria-pressed={parseInt(minRating) === star}
                    className={`p-2 border rounded-xl flex-1 flex items-center justify-center gap-1 text-sm font-bold transition-all ${
                      parseInt(minRating) === star
                        ? 'bg-rose-50 border-rose-500 text-rose-600'
                        : 'border-border hover:border-border-strong text-ink-soft'
                    }`}
                  >
                    {star} <Star className={`h-4 w-4 ${parseInt(minRating) === star ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>
                ))}
             </div>
           </div>
         </div>

         {/* Catalogue Grid */}
         <div className="lg:col-span-3 space-y-8">
           
           {/* Sorting controls */}
           <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-border shadow-sm text-sm">
             <span className="text-ink-soft">
               Showing <span className="font-bold text-ink">{productsData?.products?.length || 0}</span> of{' '}
               <span className="font-bold text-ink">{productsData?.total || 0}</span> results
             </span>
             
             <div className="flex items-center gap-2">
               <ArrowUpDown className="h-4 w-4 text-ink-soft" />
               <select
                 value={sort}
                 onChange={(e) => setSort(e.target.value)}
                 className="bg-transparent font-semibold text-ink outline-none cursor-pointer"
               >
                 <option value="latest">Latest Addition</option>
                 <option value="popular">Popularity (Best Rating)</option>
                 <option value="price_asc">Price: Low to High</option>
                 <option value="price_desc">Price: High to Low</option>
               </select>
             </div>
           </div>

           {/* Cards Grid */}
           {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="animate-pulse bg-surface-muted rounded-3xl aspect-[3/4]"></div>
               ))}
             </div>
           ) : productsData?.products?.length === 0 ? (
             <div className="text-center py-20 bg-surface border border-border rounded-3xl space-y-4">
               <CakeIcon className="h-12 w-12 text-ink-faint mx-auto" />
               <h3 className="font-bold text-ink text-lg">No Cakes Found</h3>
               <p className="text-ink-soft text-sm max-w-sm mx-auto">We couldn't find any cakes matching your current filters. Try resetting the filters.</p>
               <button
                 onClick={handleResetFilters}
                 className="px-6 py-2.5 bg-night-elevated text-white font-medium rounded-full text-sm"
               >
                 Clear All Filters
               </button>
             </div>
           ) : error ? (
             <div className="text-center py-20 bg-surface border border-border rounded-3xl space-y-4">
               <CakeIcon className="h-12 w-12 text-rose-500 mx-auto" />
               <h3 className="text-lg font-bold text-ink">Failed to load cakes</h3>
               <p className="text-ink-soft text-sm max-w-sm mx-auto">Something went wrong while fetching the catalogue. Please try again.</p>
               <button
                 onClick={() => refetch()}
                 className="px-6 py-2.5 bg-night-elevated text-white font-medium rounded-full text-sm"
               >
                 Retry
               </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {productsData?.products?.map((product: any) => (
                 <div key={product.id} className="group hover-card bg-surface rounded-3xl overflow-hidden border border-border flex flex-col h-full shadow-sm">
                   
                   {/* Image wrapper */}
                    <Link href={`/cakes/${product.id}/configure`} className="block relative aspect-[4/3] bg-surface-muted overflow-hidden">
                       <Image
                         src={getImageUrl(product.images?.[0]?.url) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'}
                         alt={product.name}
                         fill
                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                         className="object-cover"
                       />
                      {product.discountPrice && (
                       <span className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                         Offer
                       </span>
                     )}
                   </Link>

                   {/* Body Content */}
                   <div className="p-6 flex flex-col flex-grow">
                     <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 mb-2">
                       {product.category?.name}
                     </span>
                     <Link
                       href={`/cakes/${product.id}`}
                       className="font-bold text-stone-950 text-base hover:text-rose-600 transition-colors line-clamp-1 mb-2"
                     >
                       {product.name}
                     </Link>
                     <div className="flex items-center gap-1 text-amber-500 text-xs mb-4">
                       <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                       <span className="font-bold text-ink">{product.rating}</span>
                       <span className="text-ink-faint">({product.reviews?.length || 0})</span>
                     </div>

                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                       <div className="flex items-baseline gap-1.5">
                         <span className="text-lg font-black text-stone-950">{formatPrice(product.discountPrice || product.price)}</span>
                         {product.discountPrice && <span className="text-ink-faint line-through text-xs">{formatPrice(product.price)}</span>}
                       </div>
                       <Link
                         href={`/cakes/${product.id}`}
                         className="p-2 bg-night-elevated hover:bg-rose-600 text-white rounded-full transition-colors"
                         title="Customize Cake"
                       >
                         <ShoppingBag className="h-4 w-4" />
                       </Link>
                     </div>
                   </div>

                 </div>
               ))}
             </div>
           )}

           {/* Pagination */}
           {productsData?.pages > 1 && (
             <div className="flex justify-center gap-2 pt-6">
               {[...Array(productsData.pages)].map((_, idx) => (
                 <button
                   key={idx}
                   onClick={() => setPage(idx + 1)}
                   className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                     page === idx + 1
                       ? 'bg-rose-600 text-white'
                       : 'bg-surface border border-border text-ink-soft hover:bg-canvas'
                   }`}
                 >
                   {idx + 1}
                 </button>
               ))}
             </div>
           )}
         </div>

       </div>
     </div>
   );
 }
 
 export default function CakeCatalog() {
   return (
     <div className="flex flex-col min-h-screen">
             <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading catalogue...</div>}>
         <CakeCatalogContent />
       </Suspense>
           </div>
   );
 }