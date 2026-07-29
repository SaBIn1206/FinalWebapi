'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatPrice } from '@/lib/format';
import { ShoppingBag, Truck, CreditCard, Check, ShieldCheck, AlertCircle } from 'lucide-react';

const checkoutSchema = z.object({
  deliveryName: z.string().min(2, 'Recipient full name is required'),
  deliveryPhone: z.string().min(8, 'Contact phone number is required'),
  deliveryEmail: z.string().email('Please enter a valid email address'),
  deliveryAddress: z.string().min(5, 'Delivery street address is required'),
  deliveryCity: z.string().min(2, 'City is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryTime: z.string().min(1, 'Delivery time slot is required'),
  deliveryLandmark: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  deliveryOption: z.enum(['STANDARD', 'SAME_DAY', 'MIDNIGHT', 'SCHEDULED']),
  paymentMethod: z.enum(['COD', 'ESEWA', 'KHALTI', 'STRIPE', 'PAYPAL']),
});

type CheckoutFormInput = z.infer<typeof checkoutSchema>;

  function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const couponQuery = searchParams.get('coupon') || null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryOption: 'STANDARD',
      paymentMethod: 'COD',
    }
  });

  // Watch delivery option and payment method for dynamic calculations and display
  const watchedDeliveryOption = watch('deliveryOption');
  const watchedPaymentMethod = watch('paymentMethod');

  // Fetch cart data
  const { data: cartData, isLoading, error: cartError } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await API.get('/cart');
      return res.data?.cart;
    },
    enabled: !!user,
  });

  // Pre-fill user profile fields
  useEffect(() => {
    if (user) {
      setValue('deliveryName', user.name);
      setValue('deliveryEmail', user.email);
    }
  }, [user, setValue]);

  // Fetch coupon details if coupon query exists
  const { data: couponData } = useQuery({
    queryKey: ['coupon-checkout', couponQuery],
    queryFn: async () => {
      if (!couponQuery) return null;
      try {
        const res = await API.post('/coupons/validate', { code: couponQuery });
        return res.data?.coupon;
      } catch {
        return null;
      }
    },
    enabled: !!couponQuery,
  });

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-ink-soft">Preparing checkout fields...</div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-ink">Unable to load checkout</h2>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-night-elevated text-white rounded-full">
          Retry
        </button>
      </div>
    );
  }

  const items = cartData?.items || [];
  if (items.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-ink">Your cart is empty</h2>
        <button onClick={() => router.push('/cakes')} className="px-6 py-2.5 bg-night-elevated text-white rounded-full">
          Browse Cakes
        </button>
      </div>
    );
  }

  // Subtotal calculations
  let subtotal = 0;
  items.forEach((item: any) => {
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

    const singlePrice = basePrice + modifier + accessoriesCost;
    subtotal += singlePrice * item.quantity;
  });

  // Delivery tier costs
  let deliveryFee = 199.0;
  if (watchedDeliveryOption === 'SAME_DAY') deliveryFee = 499.0;
  else if (watchedDeliveryOption === 'MIDNIGHT') deliveryFee = 699.0;
  else if (watchedDeliveryOption === 'SCHEDULED') deliveryFee = 299.0;

  // Apply Coupon Discount
  let discount = 0;
  if (couponData) {
    discount = (subtotal * couponData.discountPercentage) / 100;
    if (couponData.maxDiscount && discount > couponData.maxDiscount) {
      discount = couponData.maxDiscount;
    }
  }

  const tax = Math.round((subtotal - discount) * 0.1 * 100) / 100;
  const total = subtotal + deliveryFee + tax - discount;

  const onSubmit = async (data: CheckoutFormInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await API.post('/orders', {
        ...data,
        couponApplied: couponQuery,
      });

      if (res.data?.success) {
        router.push(`/order-success?orderId=${res.data.order.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-ink tracking-tight mb-8">Secure Checkout</h1>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl mb-8">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Details Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Delivery Form */}
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2 border-b border-border pb-4">
              <Truck className="h-5 w-5 text-rose-600" /> Delivery Details
            </h2>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="deliveryName" className="block text-stone-700 text-sm font-semibold mb-2">Recipient Name</label>
                  <input
                    id="deliveryName"
                    type="text"
                    {...register('deliveryName')}
                    aria-describedby={errors.deliveryName ? 'deliveryName-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryName ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                    placeholder="John Doe"
                  />
                  {errors.deliveryName && <p id="deliveryName-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryName.message}</p>}
                </div>

                <div>
                  <label htmlFor="deliveryPhone" className="block text-stone-700 text-sm font-semibold mb-2">Contact Phone</label>
                  <input
                    id="deliveryPhone"
                    type="text"
                    {...register('deliveryPhone')}
                    aria-describedby={errors.deliveryPhone ? 'deliveryPhone-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryPhone ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                    placeholder="9841XXXXXX"
                  />
                  {errors.deliveryPhone && <p id="deliveryPhone-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryPhone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="deliveryAddress" className="block text-stone-700 text-sm font-semibold mb-2">Street Address</label>
                  <input
                    id="deliveryAddress"
                    type="text"
                    {...register('deliveryAddress')}
                    aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryAddress ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                    placeholder="123 Sweet Lane"
                  />
                  {errors.deliveryAddress && <p id="deliveryAddress-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryAddress.message}</p>}
                </div>

                <div>
                  <label htmlFor="deliveryCity" className="block text-stone-700 text-sm font-semibold mb-2">City</label>
                  <input
                    id="deliveryCity"
                    type="text"
                    {...register('deliveryCity')}
                    aria-describedby={errors.deliveryCity ? 'deliveryCity-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryCity ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                    placeholder="Kathmandu"
                  />
                  {errors.deliveryCity && <p id="deliveryCity-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryCity.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <label htmlFor="deliveryEmail" className="block text-stone-700 text-sm font-semibold mb-2">Email Address</label>
                  <input
                    id="deliveryEmail"
                    type="email"
                    {...register('deliveryEmail')}
                    aria-describedby={errors.deliveryEmail ? 'deliveryEmail-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryEmail ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                    placeholder="john@example.com"
                  />
                  {errors.deliveryEmail && <p id="deliveryEmail-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryEmail.message}</p>}
                </div>

                <div>
                  <label htmlFor="deliveryLandmark" className="block text-stone-700 text-sm font-semibold mb-2">Landmark (Optional)</label>
                  <input
                    id="deliveryLandmark"
                    type="text"
                    {...register('deliveryLandmark')}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm"
                    placeholder="Opposite Central Park Mall"
                  />
                </div>
              </div>

              {/* Date & Time slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <label htmlFor="deliveryDate" className="block text-stone-700 text-sm font-semibold mb-2">Delivery Date</label>
                  <input
                    id="deliveryDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('deliveryDate')}
                    aria-describedby={errors.deliveryDate ? 'deliveryDate-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryDate ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                  />
                  {errors.deliveryDate && <p id="deliveryDate-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryDate.message}</p>}
                </div>

                <div>
                  <label htmlFor="deliveryTime" className="block text-stone-700 text-sm font-semibold mb-2">Delivery Time Slot</label>
                  <select
                    id="deliveryTime"
                    {...register('deliveryTime')}
                    aria-describedby={errors.deliveryTime ? 'deliveryTime-error' : undefined}
                    className={`w-full px-4 py-3 bg-surface rounded-xl border ${errors.deliveryTime ? 'border-rose-500' : 'border-border-strong'} outline-none focus:border-rose-500 text-ink text-sm`}
                  >
                    <option value="">Choose Time Slot</option>
                    <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
                    <option value="01:00 PM - 04:00 PM">Afternoon (01:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 07:00 PM">Evening (04:00 PM - 07:00 PM)</option>
                    <option value="11:30 PM - 12:15 AM">Midnight slot (11:30 PM - 12:15 AM)</option>
                  </select>
                  {errors.deliveryTime && <p id="deliveryTime-error" className="text-rose-600 text-xs mt-1.5" role="alert">{errors.deliveryTime.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="deliveryInstructions" className="block text-stone-700 text-sm font-semibold mb-2">Special Instructions / Directions (Optional)</label>
                <textarea
                  id="deliveryInstructions"
                  rows={3}
                  {...register('deliveryInstructions')}
                  className="w-full px-4 py-3 rounded-xl border border-border-strong outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm"
                  placeholder="Gate code, bell name, call upon arrival, etc..."
                />
              </div>
            </div>

            {/* Delivery speed selector */}
            <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-ink border-b border-border pb-4">Select Delivery Tier</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Delivery tier">
                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input
                    type="radio"
                    value="STANDARD"
                    {...register('deliveryOption')}
                    aria-label="Standard Delivery"
                    className="accent-rose-600 h-4 w-4"
                  />
                 <div className="text-sm">
                   <span className="font-bold text-ink">Standard Delivery</span>
                   <span className="block text-ink-faint text-xs mt-0.5">Next-day Delivery ({formatPrice(199)})</span>
                 </div>
               </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input
                    type="radio"
                    value="SAME_DAY"
                    {...register('deliveryOption')}
                    aria-label="Same Day Delivery"
                    className="accent-rose-600 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-bold text-ink">Same Day Delivery</span>
                    <span className="block text-ink-faint text-xs mt-0.5">Order before 12 PM ({formatPrice(499)})</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input
                    type="radio"
                    value="MIDNIGHT"
                    {...register('deliveryOption')}
                    aria-label="Midnight Delivery"
                    className="accent-rose-600 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-bold text-ink">Midnight Delivery</span>
                    <span className="block text-ink-faint text-xs mt-0.5">Surprise at 12:00 AM ({formatPrice(699)})</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input
                    type="radio"
                    value="SCHEDULED"
                    {...register('deliveryOption')}
                    aria-label="Scheduled Delivery"
                    className="accent-rose-600 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-bold text-ink">Scheduled Delivery</span>
                    <span className="block text-ink-faint text-xs mt-0.5">Select a custom window ({formatPrice(299)})</span>
                  </div>
                </label>
             </div>
           </div>

           {/* Payment Methods */}
           <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm space-y-6">
             <h2 className="text-xl font-bold text-ink flex items-center gap-2 border-b border-border pb-4">
               <CreditCard className="h-5 w-5 text-rose-600" /> Payment Method
             </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Payment method">
                
                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input type="radio" value="COD" {...register('paymentMethod')} aria-label="Cash on Delivery" className="accent-rose-600 h-4 w-4" />
                  <div className="text-sm font-bold text-ink">Cash on Delivery</div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input type="radio" value="ESEWA" {...register('paymentMethod')} aria-label="eSewa Wallet" className="accent-rose-600 h-4 w-4" />
                  <div className="text-sm font-bold text-ink">eSewa Wallet</div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input type="radio" value="KHALTI" {...register('paymentMethod')} aria-label="Khalti Pay" className="accent-rose-600 h-4 w-4" />
                  <div className="text-sm font-bold text-ink">Khalti Pay</div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input type="radio" value="STRIPE" {...register('paymentMethod')} aria-label="Stripe Card" className="accent-rose-600 h-4 w-4" />
                  <div className="text-sm font-bold text-ink">Stripe Card</div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input type="radio" value="PAYPAL" {...register('paymentMethod')} aria-label="PayPal" className="accent-rose-600 h-4 w-4" />
                  <div className="text-sm font-bold text-ink">PayPal</div>
                </label>
              </div>
           </div>

         </div>

         {/* Invoice Summary and Submit */}
         <div className="lg:col-span-4 space-y-6">
           <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-4">
             <h3 className="font-bold text-ink text-base flex items-center gap-1.5">
               <ShoppingBag className="h-5 w-5 text-rose-600" /> Order Summary
             </h3>

             {/* List mini products */}
             <div className="divide-y divide-border max-h-60 overflow-y-auto">
               {items.map((item: any) => (
                 <div key={item.id} className="py-3 flex justify-between gap-4 text-xs">
                   <div>
                     <span className="font-bold text-ink line-clamp-1">{item.cake?.name}</span>
                     <span className="text-ink-faint block mt-0.5">Qty: {item.quantity} | {item.weight}kg</span>
                   </div>
                   <span className="font-semibold text-ink shrink-0">
                     {formatPrice((item.cake?.discountPrice || item.cake?.price) * item.quantity)}
                   </span>
                 </div>
               ))}
             </div>

             <hr className="border-border" />

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
                 <span>Delivery Charge</span>
                 <span className="font-bold text-ink">{formatPrice(deliveryFee)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Tax (10%)</span>
                 <span className="font-bold text-ink">{formatPrice(tax)}</span>
               </div>
               <hr className="border-border my-1" />
               <div className="flex justify-between text-ink text-base font-black">
                 <span>Total Payment</span>
                 <span className="text-rose-600">{formatPrice(total)}</span>
               </div>
             </div>

             <button
               type="submit"
               disabled={submitting}
               className="w-full flex items-center justify-center gap-2 py-4 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full shadow-md transition-colors text-sm mt-6 disabled:opacity-50"
             >
               {submitting ? 'Placing order...' : (
                 <>
                   <ShieldCheck className="h-5 w-5" /> Place Order ({formatPrice(total)})
                 </>
               )}
             </button>
           </div>
         </div>

       </form>
     </div>
   );
 }
 
 export default function Checkout() {
   return (
     <div className="flex flex-col min-h-screen">
       <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading checkout...</div>}>
         <CheckoutPageContent />
       </Suspense>
     </div>
   );
 }