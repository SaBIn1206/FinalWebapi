'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import {
  Sparkles,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Clock,
  Wand2,
  Cake,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import CakePreview from '@/components/CakePreview';

export default function CustomCakeBuilder() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWeight, setSelectedWeight] = useState(1.0);
  const [selectedFlavor, setSelectedFlavor] = useState('Chocolate');
  const [selectedSponge, setSelectedSponge] = useState('Standard Vanilla');
  const [selectedCream, setSelectedCream] = useState('Buttercream');
  const [writingMessage, setWritingMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [candle, setCandle] = useState(false);
  const [knife, setKnife] = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [cardText, setCardText] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [basePrice, setBasePrice] = useState(800);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categoriesData, error: categoriesQueryError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await API.get('/categories');
      return res.data?.categories;
    },
  });

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const availableWeights = [0.5, 1.0, 1.5, 2.0, 3.0];
  const availableFlavors = ['Chocolate', 'Vanilla', 'Red Velvet', 'Strawberry', 'Blueberry'];

  let accessoriesCost = 0.0;
  if (candle) accessoriesCost += 50.0;
  if (knife) accessoriesCost += 50.0;
  if (greetingCard) accessoriesCost += 150.0;
  if (giftWrap) accessoriesCost += 200.0;
  const totalPrice = basePrice + accessoriesCost;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.success) setCustomImageUrl(res.data.url);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('Please choose a category for your cake.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await API.post('/custom-cakes', {
        name,
        description,
        price: basePrice,
        categoryId: selectedCategory,
        ingredients: 'Custom recipe designed by customer',
        prepTime: 24,
        stock: 1,
        images: customImageUrl ? [customImageUrl] : [],
        variants: [{ weight: selectedWeight, flavor: selectedFlavor, priceModifier: 0 }],
        // Design metadata kept on the cake for the order pipeline
        spongeType: selectedSponge,
        creamType: selectedCream,
        writingMessage,
        customImage: customImageUrl,
        candle,
        knife,
        greetingCard,
        giftWrap,
        cardText: greetingCard ? cardText : '',
      });
      setSaved(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save your custom cake design');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-ink-soft font-medium py-20 text-center">Redirecting to login...</div>
    );
  }

  if (categoriesQueryError) {
    return (
      <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl space-y-4">
        <p className="text-stone-500 text-sm">Failed to load categories. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">Custom Cake Studio</span>
        <h1 className="text-3xl font-black text-ink tracking-tight mt-1">Design a Custom Cake</h1>
        <p className="text-ink-soft mt-1">
          Every user can add a custom cake item. Save your design and it will be available for your orders.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Preview */}
        <div className="lg:col-span-5 space-y-6">
          <CakePreview
            weight={selectedWeight}
            flavor={selectedFlavor}
            spongeType={selectedSponge}
            creamType={selectedCream}
            writingMessage={writingMessage || null}
            customImageUrl={customImageUrl}
            candle={candle}
            knife={knife}
            greetingCard={greetingCard}
            giftWrap={giftWrap}
          />
          <div className="bg-canvas p-6 rounded-2xl border border-border flex items-center gap-3 text-stone-700 text-sm">
            <Clock className="h-5 w-5 text-ink-soft" />
            <span>Requires at least <span className="font-bold text-ink">24 hours</span> preparation time</span>
          </div>
        </div>

        {/* Builder */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-ink">Cake Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. My Birthday Masterpiece"
              className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-ink">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe your cake, theme, and occasion..."
              className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
              >
                <option value="">Select Category</option>
                {categoriesData?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Base Price (Rs)</label>
              <input
                type="number"
                value={basePrice}
                min={0}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm"
              />
            </div>
          </div>

          <h3 className="font-black text-stone-950 text-lg flex items-center gap-1.5">
            <Wand2 className="h-5 w-5 text-rose-600" /> Design Your Cake
          </h3>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-ink">Cake Weight</label>
            <div className="flex flex-wrap gap-3">
              {availableWeights.map((w) => (
                <button key={w} type="button" onClick={() => setSelectedWeight(w)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    selectedWeight === w ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-surface border-border hover:border-border-strong text-ink-soft'
                  }`}>
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-ink">Sponge Flavor</label>
            <div className="flex flex-wrap gap-3">
              {availableFlavors.map((f) => (
                <button key={f} type="button" onClick={() => setSelectedFlavor(f)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    selectedFlavor === f ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-surface border-border hover:border-border-strong text-ink-soft'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Sponge Type</label>
              <select value={selectedSponge} onChange={(e) => setSelectedSponge(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm">
                <option value="Standard Vanilla">Standard Vanilla Sponge</option>
                <option value="Chocolate Sponge">Decadent Chocolate Sponge</option>
                <option value="Eggless Vanilla">Eggless Vanilla Sponge</option>
                <option value="Eggless Chocolate">Eggless Chocolate Sponge</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Frosting Cream Type</label>
              <select value={selectedCream} onChange={(e) => setSelectedCream(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-sm">
                <option value="Buttercream">Vanilla Buttercream</option>
                <option value="Cream Cheese">Rich Cream Cheese</option>
                <option value="Fresh Whipped Cream">Light Whipped Cream</option>
                <option value="Chocolate Ganache">Dark Chocolate Ganache</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">Message on Cake</label>
            <input type="text" maxLength={30} value={writingMessage} onChange={(e) => setWritingMessage(e.target.value)}
              className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm"
              placeholder="Happy Birthday Alex! (Max 30 chars)" />
          </div>

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

          <div className="space-y-4 pt-4 border-t border-border">
            <label className="block text-sm font-extrabold text-ink uppercase tracking-wider">Party Accessories & Packaging</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'candle', label: 'Sparkling Candles', price: 50, state: candle, set: setCandle },
                { key: 'knife', label: 'Premium Cake Knife', price: 50, state: knife, set: setKnife },
                { key: 'greetingCard', label: 'Bespoke Greeting Card', price: 150, state: greetingCard, set: setGreetingCard },
                { key: 'giftWrap', label: 'Luxury Gift Wrapping', price: 200, state: giftWrap, set: setGiftWrap },
              ].map((acc) => (
                <label key={acc.key} className="flex items-center gap-3 p-4 border rounded-2xl bg-surface cursor-pointer hover:border-border-strong shadow-sm">
                  <input type="checkbox" checked={acc.state} onChange={(e) => acc.set(e.target.checked)} className="accent-rose-600 h-4 w-4 rounded" />
                  <div className="text-sm">
                    <span className="font-bold text-ink">{acc.label}</span>
                    <span className="block text-ink-faint text-xs mt-0.5">+{formatPrice(acc.price)}</span>
                  </div>
                </label>
              ))}
            </div>
            {greetingCard && (
              <div>
                <label className="block text-ink text-xs font-semibold mb-1.5">Write Card Text</label>
                <textarea rows={2} value={cardText} onChange={(e) => setCardText(e.target.value)}
                  className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:border-rose-500 text-ink text-xs leading-relaxed"
                  placeholder="Write your wishes to print on the greeting card..." />
              </div>
            )}
          </div>

          <div className="bg-canvas p-6 rounded-3xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-ink-soft text-xs font-bold uppercase tracking-wider">Estimated Price</span>
              <div className="text-3xl font-black text-stone-950 mt-1">{formatPrice(totalPrice)}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {saved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                  <Check className="h-4 w-4" /> Design saved!
                </span>
              )}
              <button type="submit" disabled={saving}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-4 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full shadow-md transition-all ${
                  saved ? 'bg-green-600 hover:bg-green-600' : ''
                }`}>
                {saving ? 'Saving...' : saved ? (<><Check className="h-5 w-5" /> Saved</>) : (<><ShoppingCart className="h-5 w-5" /> Save Custom Cake</>)}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
