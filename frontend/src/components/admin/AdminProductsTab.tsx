'use client';

import React from 'react';
import { Card, Button, Modal, Field } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { getImageUrl } from '@/lib/images';

export default function AdminProductsTab({
  productsData,
  categoriesData,
  refetchProducts,
  openModal,
  handleProductSubmit,
  handleDelete,
  showModal,
  editingItem,
  onClose,
  productsError,
}: {
  productsData: any[];
  categoriesData: any[];
  refetchProducts: () => void;
  openModal: (item?: any) => void;
  handleProductSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDelete: (type: string, id: string) => void;
  showModal: boolean;
  editingItem: any;
  onClose: () => void;
  productsError?: any;
}) {
  if (productsError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load products.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-night-ink">Cake Registry</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Cake Product</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsData?.map((product: any) => (
          <Card key={product.id} tone="dark" className="p-6 space-y-4">
            <div className="aspect-[4/3] rounded-2xl bg-night overflow-hidden relative">
              <img src={getImageUrl(product.images?.[0]?.url) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-night-ink line-clamp-1">{product.name}</h3>
              <div className="flex justify-between items-baseline mt-2">
                <span className="font-black text-brand">{formatPrice(product.discountPrice || product.price)}</span>
                <span className="text-night-ink-soft text-xs">Stock: {product.stock}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-night-border">
              <Button
                variant="outline"
                tone="dark"
                className="flex-1 !border-night-border !text-night-ink-soft hover:!bg-night-border text-[10px]"
                onClick={() => openModal(product)}
              >
                <Edit className="h-3 w-3" /> Edit
              </Button>
              <Button variant="ghost" className="!text-red-400 hover:!bg-red-950/20 p-2" onClick={() => handleDelete('products', product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={onClose} title={editingItem ? 'Edit Product' : 'Add New Cake Product'} tone="dark">
        <form onSubmit={handleProductSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cake Name" name="name" defaultValue={editingItem?.name} required />
            <Field label="Category" name="categoryId" type="select" defaultValue={editingItem?.categoryId} required>
              <option value="">Select Category</option>
              {categoriesData?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Field>
          </div>
          <Field label="Description" name="description" defaultValue={editingItem?.description} required textarea />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Base Price (Rs)" name="price" type="number" step="0.01" defaultValue={editingItem?.price} required />
            <Field label="Discount Price (Rs)" name="discountPrice" type="number" step="0.01" defaultValue={editingItem?.discountPrice} />
            <Field label="Stock" name="stock" type="number" defaultValue={editingItem?.stock ?? 10} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Image URL" name="imageUrl" defaultValue={editingItem?.images?.[0]?.url} />
            <Field label="Prep Time (Hours)" name="prepTime" type="number" defaultValue={editingItem?.prepTime ?? 24} />
          </div>
          <Field label="Ingredients" name="ingredients" defaultValue={editingItem?.ingredients} />
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="ghost" type="button" className="!text-night-ink-soft" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Cake</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
