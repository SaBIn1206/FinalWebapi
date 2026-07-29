'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface CakePreviewProps {
  weight: number;
  flavor: string;
  spongeType: string;
  creamType: string;
  writingMessage?: string | null;
  customImageUrl?: string | null;
  candle?: boolean;
  knife?: boolean;
  greetingCard?: boolean;
  giftWrap?: boolean;
  className?: string;
}

export default function CakePreview({
  customImageUrl,
  writingMessage,
  weight,
  flavor,
  spongeType,
  creamType,
  candle,
  knife,
  greetingCard,
  giftWrap,
  className = '',
}: CakePreviewProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="aspect-square rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
        {customImageUrl ? (
          <img
            src={customImageUrl}
            alt={writingMessage || 'Custom cake photo'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-slate-400 space-y-2 p-6">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Uploaded Custom Image (For Photo Cakes)</p>
            <p className="text-xs text-slate-400">Your uploaded photo will appear here as the cake preview</p>
          </div>
        )}
      </div>

      {writingMessage && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Message on cake</p>
          <p className="text-sm text-slate-700 italic">"{writingMessage}"</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cake Details</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="font-medium">Weight:</span> {weight} kg
          </div>
          <div>
            <span className="font-medium">Flavor:</span> {flavor}
          </div>
          <div>
            <span className="font-medium">Sponge:</span> {spongeType}
          </div>
          <div>
            <span className="font-medium">Cream:</span> {creamType}
          </div>
        </div>
        {(candle || knife || greetingCard || giftWrap) && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {candle && <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-1 rounded-full">Candles</span>}
            {knife && <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">Cake Knife</span>}
            {greetingCard && <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Greeting Card</span>}
            {giftWrap && <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Gift Wrap</span>}
          </div>
        )}
      </div>
    </div>
  );
}
