'use client';

import React, { useState, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import { getImageUrl } from '@/lib/images';
import {
  Star,
  Sparkles,
  Image as ImageIcon,
  Check,
  Heart,
  AlertCircle,
  Clock,
  Wand2,
  Pencil,
  Plus,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import CakePreview from '@/components/CakePreview';

interface Params {
  id: string;
}

type Mode = 'create' | 'modify' | 'design';

export default function CakeConfigure({ params: paramsPromise }: { params: Promise<Params> }) {
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Mode: create (fresh custom from base), modify (edit an existing saved design), design (full build)
  const editId = searchParams.get('edit');
  const initialMode: Mode = editId ? 'modify' : 'create';
  const [mode, setMode] = useState<Mode>(initialMode);

  // Customizer state
  const [selectedWeight, setSelectedWeight] = useState(1.0);
  const [selectedFlavor, setSelectedFlavor] = useState('Standard');
  const [selectedSponge, setSelectedSponge] = useState('Standard Vanilla');
  const [selectedCream, setSelectedCream] = useState('Buttercream');
  const [writingMessage, setWritingMessage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [candle, setCandle] = useState(false);
  const [knife, setKnife] = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [cardText, setCardText] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);

  const [cartSaving, setCartSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch product
  const { data: productData, isLoading, refetch: refetchProduct, error } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const res = await API.get(`/products/${params.id}`);
      return res.data?.product;
    },
  });

  // Fetch existing saved design when modifying
  const { data: editItem } = useQuery({
    queryKey: ['cart-edit', editId],
    queryFn: async () => {
      const res = await API.get('/cart');
      return res.data?.cart?.items?.find((i: any) => i.id === editId);
    },
    enabled: !!editId && !!user,
  });

  // Apply defaults from product or from the item being modified
  useEffect(() => {
    if (mode === 'modify' && editItem) {
      setSelectedWeight(editItem.weight ?? 1.0);
      setSelectedFlavor(editItem.flavor ?? 'Standard');
      setSelectedSponge(editItem.spongeType ?? 'Standard Vanilla');
      setSelectedCream(editItem.creamType ?? 'Buttercream');
      setWritingMessage(editItem.writingMessage ?? '');
      setCustomImageUrl(editItem.customImage ?? null);
      setCandle(!!editItem.candle);
      setKnife(!!editItem.knife);
      setGreetingCard(!!editItem.greetingCard);
      setCardText(editItem.cardText ?? '');
    } else if (productData && mode !== 'modify') {
      if (productData.variants?.length > 0) {
        setSelectedWeight(productData.variants[0].weight);
        setSelectedFlavor(productData.variants[0].flavor);
      }
    }
  }, [mode, editItem, productData]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
          <div className="flex-grow flex items-center justify-center text-ink-soft font-medium">
          Loading cake studio...
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

  const basePrice = productData.discountPrice || productData.price;
  const matchingVariant = productData.variants?.find(
    (v: any) => v.weight === selectedWeight && v.flavor.toLowerCase() === selectedFlavor.toLowerCase()
  );
  const variantPriceModifier = matchingVariant ? matchingVariant.priceModifier : 0.0;

  let accessoriesCost = 0.0;
  if (candle) accessoriesCost += 50.0;
  if (knife) accessoriesCost += 50.0;
  if (greetingCard) accessoriesCost += 150.0;
  if (giftWrap) accessoriesCost += 200.0;

  const totalPrice = basePrice + variantPriceModifier + accessoriesCost;

  const availableWeights = Array.from(new Set(productData.variants?.map((v: any) => v.weight) || [])) as number[];
  const availableFlavors = Array.from(new Set(productData.variants?.map((v: any) => v.flavor) || [])) as string[];

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

  const buildPayload = () => ({
    cakeId: productData.id,
    quantity: 1,
    weight: selectedWeight,
    flavor: selectedFlavor,
    spongeType: selectedSponge,
    creamType: selectedCream,
    writingMessage: greetingCard && cardText ? `${writingMessage} (Card: ${cardText})` : writingMessage || null,
    customImage: customImageUrl || null,
    candle,
    knife,
    greetingCard,
    giftWrap,
    cardText: greetingCard ? cardText : '',
  });

  const handleSaveDesign = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setCartSaving(true);
    setSaveError(null);
    try {
      if (mode === 'modify' && editId) {
        await API.put(`/cart/${editId}`, buildPayload());
      } else {
        await API.post('/cart', buildPayload());
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Could not save your design');
    } finally {
      setCartSaving(false);
    }
  };

  const modeMeta: Record<Mode, { label: string; icon: any; blurb: string }> = {
    create: { label: 'Create New Design', icon: Plus, blurb: 'Start a fresh custom cake built from this base recipe.' },
    modify: { label: 'Modify Saved Design', icon: Pencil, blurb: 'Edit an existing design you saved earlier in your cart.' },
    design: { label: 'Custom Design Studio', icon: Wand2, blurb: 'Fully design your own cake from scratch with every detail.' },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-ink-soft text-sm mb-8">
          <span className="hover:text-rose-600 cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span>/</span>
          <span className="hover:text-rose-600 cursor-pointer" onClick={() => router.push('/cakes')}>Cakes</span>
          <span>/</span>
          <span className="hover:text-rose-600 cursor-pointer" onClick={() => router.push(`/cakes/${productData.id}`)}>{productData.name}</span>
          <span>/</span>
          <span className="text-ink font-semibold">Cake Studio</span>
        </div>

        {/* Mode switcher */}
        <div className="bg-surface border border-border rounded-3xl p-4 sm:p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 mb-4">
            <Sparkles className="h-5 w-5" />
            <h1 className="text-2xl font-black text-ink">Cake Studio — Item List View</h1>
          </div>
            <p className="text-ink-soft text-sm mb-5">
            Pick how you want to build this cake. Every design is saved to your cart and stays ready for checkout.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['create', 'modify', 'design'] as Mode[]).map((m) => {
              const Icon = modeMeta[m].icon;
              const active = mode === m;
              const disabled = m === 'modify' && !editId;
              return (
                <button
                  key={m}
                  disabled={disabled}
                  onClick={() => setMode(m)}
                  className={`flex flex-col gap-1.5 p-4 rounded-2xl border text-left transition-all ${
                    active
                      ? 'border-rose-500 bg-rose-50'
                      : disabled
                      ? 'border-surface-muted bg-canvas opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-border-strong bg-surface'
                  }`}
                >
                   <span className="flex items-center gap-2 font-bold text-ink text-sm">
                    <Icon className="h-4 w-4 text-rose-600" /> {modeMeta[m].label}
                  </span>
                  <span className="text-[11px] text-ink-soft leading-relaxed">{modeMeta[m].blurb}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
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

          {/* Customizer */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">{productData.category?.name}</span>
              <h2 className="text-3xl font-black text-ink tracking-tight mt-1">{productData.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span className="font-bold text-ink">{productData.rating}</span>
                  <span className="text-ink-faint">({productData.reviews?.length || 0})</span>
                </div>
                <span className={`text-sm font-semibold ${productData.stock > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                  {productData.stock > 0 ? `In Stock (${productData.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-black text-stone-950 text-lg flex items-center gap-1.5">
                <Wand2 className="h-5 w-5 text-rose-600" /> Design Your Cake
              </h3>

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
                          selectedWeight === w ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-surface border-border hover:border-border-strong text-ink-soft'
                        }`}
                      >
                        {w} kg
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                          selectedFlavor.toLowerCase() === f.toLowerCase() ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-surface border-border hover:border-border-strong text-ink-soft'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                <input
                  type="text"
                  maxLength={30}
                  value={writingMessage}
                  onChange={(e) => setWritingMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-border-strong rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm"
                  placeholder="Happy Birthday Alex! (Max 30 chars)"
                />
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
                  <div className="mt-3">
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

            {/* Price + Save design (ready for order) */}
            <div className="bg-canvas p-6 rounded-3xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-ink-soft text-xs font-bold uppercase tracking-wider">Dynamic Total Price</span>
                <div className="text-3xl font-black text-stone-950 mt-1">{formatPrice(totalPrice)}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {saved && (
                  <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                    <Check className="h-4 w-4" /> Design saved to cart!
                  </span>
                )}
                <button
                  onClick={handleSaveDesign}
                  disabled={cartSaving || productData.stock <= 0}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-7 py-4 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full shadow-md transition-all ${
                    saved ? 'bg-green-600 hover:bg-green-600' : ''
                  }`}
                >
                  {cartSaving ? 'Saving...' : saved ? (
                    <>
                      <Check className="h-5 w-5" /> Saved
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" /> Save Design
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/checkout')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-7 py-4 border border-border-strong text-ink font-bold rounded-full hover:bg-surface-muted transition-colors"
                >
                  <span>Go to Checkout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {saveError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl">{saveError}</div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
