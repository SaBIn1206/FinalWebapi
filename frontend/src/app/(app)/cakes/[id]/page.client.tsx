'use client';

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Clock, Check, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface Params {
  id: string;
}

export default function CakeDetails({ params: paramsPromise }: { params: Promise<Params> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { user } = useAuth();
  
  // Customizer state values
  const [selectedWeight, setSelectedWeight] = useState(1.0);
  const [selectedFlavor, setSelectedFlavor] = useState('Standard');
  const [selectedSponge, setSelectedSponge] = useState('Standard Vanilla');
  const [selectedCream, setSelectedCream] = useState('Buttercream');
  const [writingMessage, setWritingMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  
  // Accessories toggles
  const [candle, setCandle] = useState(false);
  const [knife, setKnife] = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [cardText, setCardText] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);

  // Review submission state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Adding to cart status
  const [cartAdding, setCartAdding] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Fetch product data
  const { data: productData, isLoading, refetch, error } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const res = await API.get(`/products/${params.id}`);
      return res.data?.product;
    }
  });

  // Fetch wishlist state
  const { data: wishlistData, refetch: refetchWishlist, error: wishlistError } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await API.get('/wishlist');
      return res.data?.wishlist;
    },
    enabled: !!user,
  });

  const isWishlisted = wishlistData?.some((w: any) => w.cakeId === params.id) || false;

  // Initialize customizer flavors and weights once product data loads
  useEffect(() => {
    if (productData) {
      if (productData.variants?.length > 0) {
        setSelectedWeight(productData.variants[0].weight);
        setSelectedFlavor(productData.variants[0].flavor);
      }
    }
  }, [productData]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-ink-soft font-medium">Loading cake specifications...</div>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold text-ink">Cake product not found</h2>
          <button onClick={() => router.push('/cakes')} className="px-6 py-2.5 bg-night-elevated text-white rounded-full">
            Back to Catalogue
          </button>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const basePrice = productData.discountPrice || productData.price;
  
  // Find variant matching selected weight and flavor
  const matchingVariant = productData.variants?.find(
    (v: any) => v.weight === selectedWeight && v.flavor.toLowerCase() === selectedFlavor.toLowerCase()
  );
  const variantPriceModifier = matchingVariant ? matchingVariant.priceModifier : 0.0;

  // Accessories addition cost
  let accessoriesCost = 0.0;
  if (candle) accessoriesCost += 50.0;
  if (knife) accessoriesCost += 50.0;
  if (greetingCard) accessoriesCost += 150.0;
  if (giftWrap) accessoriesCost += 200.0;

  const totalPrice = basePrice + variantPriceModifier + accessoriesCost;

  // File Upload handler for custom image cake icing
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data?.success) {
        setCustomImageUrl(res.data.url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  // Add to Wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${params.id}`);
      } else {
        await API.post('/wishlist', { cakeId: params.id });
      }
      refetchWishlist();
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setCartAdding(true);
    setCartSuccess(false);

    try {
      const finalMessage = greetingCard && cardText ? `${writingMessage} (Card: ${cardText})` : writingMessage;
      await API.post('/cart', {
        cakeId: productData.id,
        quantity: 1,
        weight: selectedWeight,
        flavor: selectedFlavor,
        spongeType: selectedSponge,
        creamType: selectedCream,
        writingMessage: finalMessage || null,
        customImage: customImageUrl || null,
        candle,
        knife,
        greetingCard,
        giftWrap
      });
      
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setCartAdding(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setReviewError(null);
    setReviewSuccess(false);

    try {
      await API.post('/reviews', {
        cakeId: productData.id,
        rating: ratingInput,
        comment: commentInput
      });
      setReviewSuccess(true);
      setCommentInput('');
      refetch();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  // Collect unique weights and flavors from variants
  const availableWeights = Array.from(new Set(productData.variants?.map((v: any) => v.weight) || [])) as number[];
  const availableFlavors = Array.from(new Set(productData.variants?.map((v: any) => v.flavor) || [])) as string[];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {productData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: productData.name,
                description: productData.description,
                image: getImageUrl(productData.images?.[0]?.url),
                offers: {
                  '@type': 'Offer',
                  price: productData.discountPrice || productData.price,
                  priceCurrency: 'NPR',
                  availability: productData.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                },
                aggregateRating: productData.reviews?.length ? {
                  '@type': 'AggregateRating',
                  ratingValue: productData.rating,
                  reviewCount: productData.reviews.length,
                } : undefined,
              }),
            }}
          />
        )}
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-ink-soft text-sm mb-8">
          <span className="hover:text-rose-600 cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span>/</span>
          <span className="hover:text-rose-600 cursor-pointer" onClick={() => router.push('/cakes')}>Cakes</span>
          <span>/</span>
          <span className="text-ink font-semibold">{productData.name}</span>
        </div>

        {/* Product Customizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
           {/* Column 1: Image Showcase */}
           <div className="lg:col-span-5 space-y-6">
              <div className="aspect-square bg-surface-muted rounded-3xl overflow-hidden border border-border shadow-sm relative">
                <Image
                  src={getImageUrl(productData.images?.[0]?.url) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'}
                  alt={productData.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <button
                  onClick={handleWishlistToggle}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-pressed={isWishlisted}
                  className={`absolute top-6 right-6 p-3 rounded-full shadow-md bg-surface border border-surface-muted transition-colors ${
                    isWishlisted ? 'text-rose-600' : 'text-ink-faint hover:text-rose-600'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                </button>
              </div>
             
             {/* Metadata Info Panel */}
             <div className="bg-canvas p-6 rounded-2xl border border-border space-y-4">
               <div className="flex items-center gap-3 text-stone-700 text-sm">
                 <Clock className="h-5 w-5 text-ink-soft" />
                 <span>Requires at least <span className="font-bold text-ink">{productData.prepTime} hours</span> preparation time</span>
               </div>
               {productData.ingredients && (
                  <div className="text-ink-soft text-sm leading-relaxed border-t border-border pt-4">
                   <h4 className="font-bold text-ink uppercase text-[10px] tracking-wider mb-1">Key Ingredients</h4>
                   <p>{productData.ingredients}</p>
                 </div>
               )}
             </div>
           </div>

           {/* Column 2: Specs and Customizer */}
           <div className="lg:col-span-7 space-y-8">
             <div>
               <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">
                 {productData.category?.name}
               </span>
               <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1 mb-3">
                 {productData.name}
               </h1>
               
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1 text-amber-500 text-sm">
                   <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                   <span className="font-bold text-ink text-base">{productData.rating}</span>
                   <span className="text-ink-faint">({productData.reviews?.length || 0} customer reviews)</span>
                 </div>
                 <span className="text-ink-faint">|</span>
                 <span className={`text-sm font-semibold ${productData.stock > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                   {productData.stock > 0 ? `In Stock (${productData.stock})` : 'Out of Stock'}
                 </span>
               </div>
             </div>

             {/* Cake description */}
             <p className="text-ink-soft leading-relaxed text-base">{productData.description}</p>

             <hr className="border-border" />

             {/* Customizer Selections */}
             <div className="space-y-6">
               <h3 className="font-black text-stone-950 text-lg flex items-center gap-1.5">
                 <Sparkles className="h-5 w-5 text-rose-600" /> Customize Your Order
               </h3>

               {/* Weight Selector */}
               {availableWeights.length > 0 && (
                 <div className="space-y-3">
                   <label className="block text-sm font-bold text-ink">Select Cake Weight</label>
                   <div className="flex flex-wrap gap-3">
                     {availableWeights.map((w) => (
                       <button
                         key={w}
                         type="button"
                         onClick={() => setSelectedWeight(w)}
                         className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                           selectedWeight === w
                             ? 'bg-rose-50 border-rose-500 text-rose-600'
                             : 'bg-surface border-border hover:border-border-strong text-ink-soft'
                         }`}
                       >
                         {w} kg
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Flavor Selector */}
               {availableFlavors.length > 0 && (
                 <div className="space-y-3">
                   <label className="block text-sm font-bold text-ink">Select Sponge Flavor</label>
                   <div className="flex flex-wrap gap-3">
                     {availableFlavors.map((f) => (
                       <button
                         key={f}
                         type="button"
                         onClick={() => setSelectedFlavor(f)}
                         className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                           selectedFlavor.toLowerCase() === f.toLowerCase()
                             ? 'bg-rose-50 border-rose-500 text-rose-600'
                             : 'bg-surface border-border hover:border-border-strong text-ink-soft'
                         }`}
                       >
                         {f}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Advanced Frosting & Sponge customizations */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-bold text-ink mb-2">Sponge Type</label>
                   <select
                     value={selectedSponge}
                     onChange={(e) => setSelectedSponge(e.target.value)}
                     className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
                   >
                     <option value="Standard Vanilla">Standard Vanilla Sponge</option>
                     <option value="Chocolate Sponge">Decadent Chocolate Sponge</option>
                     <option value="Eggless Vanilla">Eggless Vanilla Sponge</option>
                     <option value="Eggless Chocolate">Eggless Chocolate Sponge</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-ink mb-2">Frosting Cream Type</label>
                   <select
                     value={selectedCream}
                     onChange={(e) => setSelectedCream(e.target.value)}
                     className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
                   >
                     <option value="Buttercream">Vanilla Buttercream</option>
                     <option value="Cream Cheese">Rich Cream Cheese</option>
                     <option value="Fresh Whipped Cream">Light Whipped Cream</option>
                     <option value="Chocolate Ganache">Dark Chocolate Ganache</option>
                   </select>
                 </div>
               </div>

               {/* Message Overlay */}
               <div>
                 <label className="block text-sm font-bold text-ink mb-2">Message on Cake</label>
                 <input
                   type="text"
                   maxLength={30}
                   value={writingMessage}
                   onChange={(e) => setWritingMessage(e.target.value)}
                   className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm"
                   placeholder="Happy Birthday Alex! (Max 30 chars)"
                 />
               </div>

               {/* Custom Image Upload for edible photo prints */}
               <div className="space-y-3">
                 <label className="block text-sm font-bold text-ink">Upload Custom Image (For Photo Cakes)</label>
                 <div className="flex items-center gap-4">
                   <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-strong hover:border-rose-400 bg-surface text-stone-700 font-semibold text-xs cursor-pointer transition-colors shadow-sm">
                     <ImageIcon className="h-4 w-4 text-ink-soft" />
                     <span>Choose Photo</span>
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   </label>
                   {customImageUrl && (
                     <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                       <Check className="h-4 w-4" /> Edible Photo Uploaded
                     </div>
                   )}
                 </div>
               </div>

               {/* Celebration Accessories add-ons */}
               <div className="space-y-4 pt-4 border-t border-border">
                 <label className="block text-sm font-extrabold text-ink uppercase tracking-wider">Party Accessories & Packaging</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                     <input type="checkbox" checked={candle} onChange={(e) => setCandle(e.target.checked)} className="accent-rose-600 h-4 w-4 rounded" />
                     <div className="text-sm">
                       <span className="font-bold text-ink">Sparkling Candles</span>
                       <span className="block text-ink-faint text-xs mt-0.5">+{formatPrice(50)}</span>
                     </div>
                   </label>

                   <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                     <input type="checkbox" checked={knife} onChange={(e) => setKnife(e.target.checked)} className="accent-rose-600 h-4 w-4 rounded" />
                     <div className="text-sm">
                       <span className="font-bold text-ink">Premium Cake Knife</span>
                       <span className="block text-ink-faint text-xs mt-0.5">+{formatPrice(50)}</span>
                     </div>
                   </label>

                   <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                     <input type="checkbox" checked={greetingCard} onChange={(e) => setGreetingCard(e.target.checked)} className="accent-rose-600 h-4 w-4 rounded" />
                     <div className="text-sm">
                       <span className="font-bold text-ink">Bespoke Greeting Card</span>
                       <span className="block text-ink-faint text-xs mt-0.5">+{formatPrice(150)}</span>
                     </div>
                   </label>

                   <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                     <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="accent-rose-600 h-4 w-4 rounded" />
                     <div className="text-sm">
                       <span className="font-bold text-ink">Luxury Gift Wrapping</span>
                       <span className="block text-ink-faint text-xs mt-0.5">+{formatPrice(200)}</span>
                     </div>
                   </label>
                 </div>

                 {/* Card Text Input if checked */}
                 {greetingCard && (
                   <div className="mt-3 animate-fadeIn">
                     <label className="block text-ink text-xs font-semibold mb-1.5">Write Card Text</label>
                     <textarea
                       rows={2}
                       value={cardText}
                       onChange={(e) => setCardText(e.target.value)}
                       className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-xs leading-relaxed"
                       placeholder="Write your wishes to print on the greeting card..."
                     />
                   </div>
                 )}
               </div>

             </div>

             <hr className="border-border" />

             {/* Total Pricing panel & Add to Cart button */}
             <div className="bg-canvas p-6 rounded-3xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                 <span className="text-ink-soft text-xs font-bold uppercase tracking-wider">Dynamic Total Price</span>
                 <div className="flex items-baseline gap-2 mt-1">
                   <span className="text-3xl font-black text-stone-950">{formatPrice(totalPrice)}</span>
                   {productData.discountPrice && (
                     <span className="text-ink-faint line-through text-sm">
                       {formatPrice(productData.price + variantPriceModifier + accessoriesCost)}
                     </span>
                   )}
                 </div>
               </div>

               <div className="flex gap-3 w-full sm:w-auto">
                 <button
                   onClick={handleAddToCart}
                   disabled={cartAdding || productData.stock <= 0}
                   className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-4 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-250 ${
                     cartSuccess ? 'bg-green-600 hover:bg-green-600' : ''
                   }`}
                 >
                   {cartAdding ? 'Adding to cart...' : cartSuccess ? (
                     <>
                       <Check className="h-5 w-5" /> Added to Cart!
                     </>
                   ) : (
                     <>
                       <ShoppingCart className="h-5 w-5" /> Add to Cart
                     </>
                   )}
                 </button>
               </div>
             </div>

           </div>

         </div>

         {/* Product Reviews Section */}
         <section className="border-t border-border pt-16">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             
             {/* Reviews list */}
             <div className="lg:col-span-7 space-y-6">
               <h2 className="text-2xl font-bold text-ink mb-6">Customer Reviews</h2>
               
               {productData.reviews?.length === 0 ? (
                 <p className="text-ink-soft text-sm italic">No reviews yet for this product. Be the first to leave a rating!</p>
               ) : (
                 <div className="space-y-6">
                   {productData.reviews?.map((review: any) => (
                     <div key={review.id} className="p-6 border border-border rounded-2xl bg-surface space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="font-bold text-ink text-sm">{review.user?.name}</span>
                          <div className="flex gap-0.5 text-amber-500" aria-hidden="true">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-500' : 'text-stone-200'}`} />
                            ))}
                          </div>
                       </div>
                       <p className="text-ink-soft text-sm leading-relaxed">{review.comment}</p>
                       <span className="block text-ink-faint text-[10px]">{new Date(review.createdAt).toLocaleDateString()}</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* Review form */}
             <div className="lg:col-span-5 bg-canvas p-8 rounded-3xl border border-border h-fit space-y-6">
               <h3 className="text-xl font-bold text-ink">Write a Review</h3>
               
               {reviewSuccess && (
                 <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
                   Review submitted successfully! Thank you for sharing your feedback.
                 </div>
               )}

               {reviewError && (
                 <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
                   {reviewError}
                 </div>
               )}

               <form onSubmit={handleSubmitReview} className="space-y-4">
                 <div>
                   <label className="block text-stone-700 text-xs font-semibold mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          aria-pressed={ratingInput >= star}
                          className={`p-2 rounded-lg border text-sm font-bold flex items-center justify-center gap-1 ${
                            ratingInput >= star ? 'text-amber-500 border-amber-300 bg-amber-50/20' : 'text-ink-faint border-border'
                          }`}
                        >
                          <Star className={`h-4 w-4 ${ratingInput >= star ? 'fill-amber-500' : ''}`} />
                        </button>
                      ))}
                    </div>
                 </div>

                 <div>
                   <label className="block text-stone-700 text-xs font-semibold mb-2">Comment</label>
                   <textarea
                     rows={4}
                     value={commentInput}
                     onChange={(e) => setCommentInput(e.target.value)}
                     required
                     className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm leading-relaxed"
                     placeholder="Tell us about the sponge softness, cream taste, and packaging quality..."
                   />
                 </div>

                 <button
                   type="submit"
                   className="px-6 py-3 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full text-sm shadow-md transition-colors"
                 >
                   Submit Review
                 </button>
               </form>
             </div>

           </div>
         </section>

       </main>

     </div>
   );
 }