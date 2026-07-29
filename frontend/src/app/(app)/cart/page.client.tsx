'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import { Trash2, ShoppingBag, Plus, Minus, Tag, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Fetch cart data
  const { data: cartData, isLoading, refetch, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await API.get('/cart');
      return res.data?.cart;
    },
    enabled: !!user,
  });

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    try {
      await API.put(`/cart/${itemId}`, { quantity: newQty });
      refetch();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await API.delete(`/cart/${itemId}`);
      refetch();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setAppliedCoupon(null);
    try {
      const res = await API.post('/coupons/validate', { code: couponCode });
      if (res.data?.success) {
        setAppliedCoupon(res.data.coupon);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  // Subtotal calculations
  let subtotal = 0;
  cartData?.items?.forEach((item: any) => {
    const matchingVariant = item.cake?.variants?.find(
      (v: any) => v.weight === item.weight && v.flavor.toLowerCase() === item.flavor.toLowerCase()
    );
    const basePrice = item.cake?.discountPrice || item.cake?.price || 0;
    const modifier = matchingVariant ? matchingVariant.priceModifier : 0;

    let accessoriesCost = 0;
    if (item.candle) accessoriesCost += 50;
    if (item.knife) accessoriesCost += 50;
    if (item.greetingCard) accessoriesCost += 150;
    if (item.giftWrap) accessoriesCost += 200;

    const singlePrice = basePrice + modifier + accessoriesCost;
    subtotal += singlePrice * item.quantity;
  });

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    discount = (subtotal * appliedCoupon.discountPercentage) / 100;
    if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
      discount = appliedCoupon.maxDiscount;
    }
  }

  const deliveryFee = 199.0; // Standard delivery estimate
  const tax = Math.round((subtotal - discount) * 0.1 * 100) / 100; // 10%
  const total = subtotal + deliveryFee + tax - discount;

  const handleCheckoutRedirect = () => {
    if (appliedCoupon) {
      router.push(`/checkout?coupon=${appliedCoupon.code}`);
    } else {
      router.push('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
                <div className="flex-grow flex items-center justify-center">
          <div className="text-ink-soft">Retrieving shopping cart...</div>
        </div>
              </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20 bg-surface border border-border rounded-3xl space-y-4">
            <ShoppingBag className="h-14 w-14 text-ink-faint mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-ink">Unable to load cart</h2>
              <p className="text-ink-soft text-sm mt-1">Something went wrong. Please try again.</p>
            </div>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-8 py-3.5 bg-night-elevated hover:bg-rose-600 text-white font-semibold rounded-full shadow-md transition-colors">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const items = cartData?.items || [];

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-ink tracking-tight mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-3xl space-y-6 max-w-2xl mx-auto shadow-sm">
            <ShoppingBag className="h-14 w-14 text-ink-faint mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-ink">Your cart is empty</h2>
              <p className="text-ink-soft text-sm mt-1">Looks like you haven't added any cakes to your cart yet.</p>
            </div>
            <Link
              href="/cakes"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-night-elevated hover:bg-rose-600 text-white font-semibold rounded-full shadow-md transition-colors"
            >
              Browse Cakes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item: any) => {
                  const basePrice = item.cake?.discountPrice || item.cake?.price || 0;
                  const matchingVariant = item.cake?.variants?.find(
                    (v: any) => v.weight === item.weight && v.flavor.toLowerCase() === item.flavor.toLowerCase()
                  );
                  const modifier = matchingVariant ? matchingVariant.priceModifier : 0;
                  
                  let accessoriesCost = 0;
                  if (item.candle) accessoriesCost += 50;
                  if (item.knife) accessoriesCost += 50;
                  if (item.greetingCard) accessoriesCost += 150;
                  if (item.giftWrap) accessoriesCost += 200;

                const singleItemPrice = basePrice + modifier + accessoriesCost;

                return (
                  <div key={item.id} className="bg-surface p-6 rounded-3xl border border-border flex flex-col sm:flex-row gap-6 shadow-sm">
                    {/* Cake Image */}
                     <div className="h-24 w-24 rounded-2xl bg-surface-muted overflow-hidden shrink-0">
                        <Image
                          src={getImageUrl(item.cake?.images?.[0]?.url) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=305'}
                          alt={item.cake?.name || 'Cart item'}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      </div>

                    {/* Cake specifications */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/cakes/${item.cakeId}/configure?edit=${item.id}`} className="font-bold text-ink hover:text-rose-600 text-base line-clamp-1">
                            {item.cake?.name}
                          </Link>
                          <span className="text-[10px] font-extrabold text-ink-faint uppercase tracking-wider block mt-0.5">
                            {item.weight}kg | {item.flavor} Sponge
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Remove ${item.cake?.name || 'item'} from cart`}
                          className="text-ink-faint hover:text-rose-600 p-2 hover:bg-canvas rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Customizations tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-ink-soft">
                        <span className="bg-surface-muted px-2 py-0.5 rounded-md">Sponge: {item.spongeType}</span>
                        <span className="bg-surface-muted px-2 py-0.5 rounded-md">Frosting: {item.creamType}</span>
                        {item.candle && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">Candles included</span>}
                        {item.knife && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">Cake Knife</span>}
                        {item.greetingCard && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">Greeting Card</span>}
                        {item.giftWrap && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">Gift Wrapping</span>}
                      </div>

                      {item.writingMessage && (
                        <p className="mt-2 text-xs italic text-rose-700 bg-rose-50/40 border border-rose-100 rounded-lg px-3 py-1.5 w-fit">
                          Message: "{item.writingMessage}"
                        </p>
                      )}

                      {/* Pricing and Qty controls */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          aria-label="Decrease quantity"
                          className="p-2 rounded-lg border border-border hover:bg-stone-50 text-ink-soft"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-ink text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          aria-label="Increase quantity"
                          className="p-2 rounded-lg border border-border hover:bg-stone-50 text-ink-soft"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                        <span className="font-black text-ink text-lg">
                          {formatPrice(singleItemPrice * item.quantity)}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations and Promo Code Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Promo code */}
              <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
                <h3 className="font-bold text-ink text-sm flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-rose-600" /> Apply Coupon
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow px-4 py-2.5 text-sm border border-border-strong rounded-xl outline-none focus:border-rose-500 uppercase font-semibold"
                    placeholder="WELCOME10"
                  />
                  <button type="submit" className="px-5 bg-night-elevated hover:bg-rose-600 text-white rounded-xl font-semibold text-xs transition-colors">
                    Apply
                  </button>
                </form>
                
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                    <Check className="h-4 w-4" /> Coupon applied: {appliedCoupon.discountPercentage}% off!
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                )}
              </div>

              {/* Pricing summary */}
              <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
                <h3 className="font-bold text-ink text-base">Order Summary</h3>
                <div className="space-y-3 text-sm text-ink-soft">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-ink">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee (Standard)</span>
                    <span className="font-bold text-ink">{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span className="font-bold text-ink">{formatPrice(tax)}</span>
                  </div>
                  <hr className="border-border my-1" />
                  <div className="flex justify-between text-ink text-base font-black">
                    <span>Total Price</span>
                    <span className="text-rose-600">{formatPrice(total)}</span>

                  </div>
                </div>

                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full flex items-center justify-center gap-1.5 py-4 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full transition-colors shadow-md text-sm mt-4"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>
        )}
      </main>

          </div>
  );
}