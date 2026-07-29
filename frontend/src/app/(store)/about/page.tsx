'use client';

import React from 'react';
import { Heart, Star, Sparkles, Coffee } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Banner */}
      <section className="bg-stone-100 py-16 sm:py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight mb-4">Our Bakery Story</h1>
          <p className="text-stone-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Crafting premium celebration cakes and sweet delicacies with organic ingredients since 2018.
          </p>
        </div>
      </section>

      {/* Story Details */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600&auto=format&fit=crop"
                alt="Baking Fresh Cakes"
                className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-stone-900 leading-tight">Baked with Passion, Delivered with Care</h2>
              <p className="text-stone-600 leading-relaxed">
                At Bakery Hub, we believe that every event is unique and deserves a spectacular centerpiece. What started as a small kitchen project in Kathmandu has grown into Nepal\'s premier digital patisserie.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Our pastry chefs combine classic French techniques with local flavors to formulate desserts that are not only visually breath-taking but also an absolute delight to taste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-stone-900">What Drives Us</h2>
            <p className="text-stone-500 mt-2">The core values behind our mixing bowls</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4">
              <div className="inline-flex p-4 bg-rose-100 text-rose-600 rounded-2xl">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Baked with Love</h3>
              <p className="text-stone-500 text-sm">We pour our hearts into every recipe, ensuring details are perfect.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4">
              <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-2xl">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Premium Quality</h3>
              <p className="text-stone-500 text-sm">We source organic flour, premium butter, and high-end chocolates.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4">
              <div className="inline-flex p-4 bg-blue-100 text-blue-600 rounded-2xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Artful Customization</h3>
              <p className="text-stone-500 text-sm">Create the cake of your dreams with full flavor and sizing control.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4">
              <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-2xl">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Fresh Guarantee</h3>
              <p className="text-stone-500 text-sm">Baking begins only after you order, guaranteeing ultra-fresh cakes.</p>
            </div>
          </div>
        </div>
      </section>

          </div>
  );
}
