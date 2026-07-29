'use client';

import React, { use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

  function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex-grow max-w-2xl w-full mx-auto px-4 py-16 text-center space-y-8 flex flex-col items-center justify-center">
      <div className="relative">
        <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce mx-auto" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-stone-500 text-base max-w-md mx-auto">
          Thank you for baking with us! Your order has been registered and our pastry chefs are verifying the details.
        </p>
      </div>

      {orderId && (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-sm">
          <span className="text-xs uppercase font-extrabold tracking-wider text-stone-400">Order Reference ID</span>
          <p className="font-mono text-stone-900 font-bold text-sm select-all mt-1">{orderId}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-1.5 px-8 py-3.5 bg-stone-900 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md transition-colors"
        >
          Track in Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/cakes"
          className="flex items-center justify-center gap-1.5 px-8 py-3.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold rounded-full transition-colors"
        >
          <ShoppingBag className="h-4.5 w-4.5" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="flex-grow flex items-center justify-center">Loading order confirmation...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
