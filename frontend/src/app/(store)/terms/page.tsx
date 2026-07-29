'use client';

import React from 'react';

export default function Terms() {
  return (
    <div className="flex flex-col min-h-screen">
      
      <section className="bg-stone-50 py-16 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-stone-500 mt-2">Effective date: July 4, 2026</p>
        </div>
      </section>

      <section className="py-20 bg-white flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-stone">
          <h2 className="text-2xl font-bold text-stone-950 mb-4">1. Order Confirmation & Preparations</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            By placing an order, you agree that cake preparations begin upon verification by our chefs. Custom specifications (writing messages, sponge configurations) cannot be adjusted after confirmation.
          </p>

          <h2 className="text-2xl font-bold text-stone-950 mb-4">2. Deliveries & Failures</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            We offer Standard, Same Day, Midnight, and Scheduled delivery categories. If the recipient is unavailable at the delivery window, our driver will make reasonable attempts to connect, after which items will be returned to our warehouse for pick-up. No refunds are issued for missed deliveries.
          </p>

          <h2 className="text-2xl font-bold text-stone-950 mb-4">3. Cancellations & Refund Policies</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            Orders can be cancelled and fully refunded while their status shows "PENDING". Once confirmation or baking starts, orders are locked and non-refundable.
          </p>
        </div>
      </section>

          </div>
  );
}
