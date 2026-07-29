'use client';

import React from 'react';

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen">
      
      <section className="bg-stone-50 py-16 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Privacy Policy</h1>
          <p className="text-stone-500 mt-2">Effective date: July 4, 2026</p>
        </div>
      </section>

      <section className="py-20 bg-white flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-stone">
          <h2 className="text-2xl font-bold text-stone-950 mb-4">1. Information We Collect</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            We collect personal details like your name, email address, phone number, physical address (for delivery coordinates), and custom order files (like photos uploaded for custom cakes) when you make transactions.
          </p>

          <h2 className="text-2xl font-bold text-stone-950 mb-4">2. How We Use Your Information</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            We use your data to process orders, manage deliveries, notify you of tracking status updates, and occasionally send promo code coupons. We never sell your personal information to third parties.
          </p>

          <h2 className="text-2xl font-bold text-stone-950 mb-4">3. Payment Information Security</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            Online transactions are handled securely through encrypted payment gateways (Stripe, PayPal, eSewa, Khalti). We do not store raw credit card details on our database servers.
          </p>
        </div>
      </section>

          </div>
  );
}
