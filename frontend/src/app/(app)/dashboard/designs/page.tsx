'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';
import { getImageUrl } from '@/lib/images';
import { Wand2, Trash2, Plus, ShoppingCart, Pencil, Check, X, Cake } from 'lucide-react';
import Link from 'next/link';

export default function MyCustomCakes() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', description: '', price: 0 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-designs'],
    queryFn: async () => {
      const res = await API.get('/custom-cakes/mine');
      return res.data?.cakes;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/custom-cakes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-designs'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (id: string) => {
      await API.post('/cart', { cakeId: id, quantity: 1 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      await API.put(`/custom-cakes/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-designs'] });
      setEditingId(null);
    },
  });

  if (!user) return <div className="text-stone-500">Loading...</div>;

  if (error) {
    return (
      <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl space-y-4">
        <Wand2 className="h-10 w-10 text-stone-300 mx-auto" />
        <p className="text-stone-500 text-sm">Failed to load your designs. Please try again.</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-designs'] })} className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold">
          Retry
        </button>
      </div>
    );
  }

  const designs = data || [];

  const startEdit = (d: any) => {
    setEditingId(d.id);
    setDraft({ name: d.name, description: d.description, price: d.price });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">My Workspace</span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight mt-1">My Designs</h1>
          <p className="text-stone-500 mt-1">Custom cakes you designed. Modify, reorder, or remove them anytime.</p>
        </div>
        <Link
          href="/cakes/custom/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-md"
        >
          <Plus className="h-4 w-4" /> New Design
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-40 bg-white border rounded-3xl" />
      ) : designs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl space-y-4">
          <Wand2 className="h-10 w-10 text-stone-300 mx-auto" />
          <p className="text-stone-500 text-sm">You haven&apos;t designed any custom cakes yet.</p>
          <Link href="/cakes/custom/new" className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold">
            <Plus className="h-4 w-4" /> Design a Custom Cake
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((d: any) => (
            <div key={d.id} className="bg-white border border-stone-200 p-6 rounded-3xl space-y-4">
              <div className="aspect-[4/3] rounded-2xl bg-stone-100 overflow-hidden relative">
                {d.images?.[0]?.url ? (
                  <img src={getImageUrl(d.images[0].url)} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300"><Cake className="h-10 w-10" /></div>
                )}
              </div>

              {editingId === d.id ? (
                <div className="space-y-3">
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                    placeholder="Name"
                  />
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                    placeholder="Price"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMutation.mutate({ id: d.id, payload: draft })}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      <Check className="h-4 w-4" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 border border-stone-200 rounded-xl text-stone-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-stone-900 line-clamp-1">{d.name}</h3>
                    <span className="text-stone-500 text-xs">{formatPrice(d.price)}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => reorderMutation.mutate(d.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-[10px] font-bold"
                      title="Add to cart / reorder"
                    >
                      <ShoppingCart className="h-3 w-3" /> Order
                    </button>
                    <button
                      onClick={() => startEdit(d)}
                      className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-500"
                      title="Modify design"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(d.id)}
                      className="p-2 border border-stone-200 hover:bg-rose-50 text-rose-400 rounded-xl"
                      title="Delete design"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
