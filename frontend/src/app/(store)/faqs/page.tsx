'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQs() {
  const faqCategories = [
    {
      title: 'Ordering & Customizations',
      items: [
        {
          q: 'How far in advance do I need to place my cake order?',
          a: 'For standard cakes, we recommend ordering 24 hours in advance. For complex custom cakes (wedding or designer tiered cakes), we require at least 48 to 72 hours preparation time.'
        },
        {
          q: 'Can I upload a custom photo for a photo cake?',
          a: 'Yes! When viewing a photo cake, click the upload option in the customizer to send us your PNG/JPG. We print using high-fidelity edible inks on premium sugar paper.'
        },
        {
          q: 'Do you offer eggless or sugar-free cakes?',
          a: 'Yes, we have eggless options. You can filter by category or select custom requests in the ordering process.'
        }
      ]
    },
    {
      title: 'Deliveries & Logistics',
      items: [
        {
          q: 'What are your delivery options?',
          a: 'We offer four delivery tiers: Standard (Rs 199), Same Day (Rs 499), Midnight (Rs 699), and Scheduled (Rs 299).'
        },
        {
          q: 'How does Midnight Delivery work?',
          a: 'Our team will deliver your order directly to the address between 11:30 PM and 12:15 AM to help surprise your loved ones right on their special day.'
        },
        {
          q: 'Do you deliver outside Kathmandu?',
          a: 'Currently, we deliver within Kathmandu, Lalitpur, and Bhaktapur. Enter your city during checkout to verify coverage.'
        }
      ]
    },
    {
      title: 'Payments & Cancellations',
      items: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept Cash on Delivery (COD) as well as online checkouts using Stripe, PayPal, eSewa, and Khalti.'
        },
        {
          q: 'Can I cancel my cake order?',
          a: 'You can cancel your order from your dashboard as long as the status is still "PENDING". Once our chefs confirm and begin baking, cancellations are disabled.'
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Title */}
      <section className="bg-stone-100 py-16 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="h-10 w-10 text-rose-600 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-stone-600 mt-2 max-w-lg mx-auto">Everything you need to know about custom cakes, combos, and midnight delivery slots.</p>
        </div>
      </section>

      {/* Accordion List */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((cat, idx) => (
              <div key={idx} className="space-y-6">
                <h2 className="text-2xl font-bold text-stone-900 border-b border-stone-100 pb-2">{cat.title}</h2>
                <div className="space-y-4">
                  {cat.items.map((item, itemIdx) => (
                    <FAQItem key={itemIdx} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

          </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden transition-colors hover:border-stone-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left bg-stone-50 hover:bg-stone-100/50 transition-colors focus:outline-none"
      >
        <span className="font-semibold text-stone-900 text-base">{question}</span>
        {open ? <ChevronUp className="h-5 w-5 text-stone-500" /> : <ChevronDown className="h-5 w-5 text-stone-500" />}
      </button>
      {open && (
        <div className="p-6 bg-white border-t border-stone-200">
          <p className="text-stone-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
