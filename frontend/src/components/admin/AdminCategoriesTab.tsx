'use client';

import React from 'react';
import { Card, Button, Modal, Field } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCategoriesTab({
  categoriesData,
  refetchCategories,
  openModal,
  handleCategorySubmit,
  handleDelete,
  showModal,
  editingItem,
  onClose,
  categoriesError,
}: {
  categoriesData: any[];
  refetchCategories: () => void;
  openModal: (item?: any) => void;
  handleCategorySubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDelete: (type: string, id: string) => void;
  showModal: boolean;
  editingItem: any;
  onClose: () => void;
  categoriesError?: any;
}) {
  if (categoriesError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load categories.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-night-ink">Categories Map</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <Card tone="dark" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-night border-b border-night-border text-night-ink-soft">
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Cakes Count</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-border">
              {categoriesData?.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-night-border/40">
                  <td className="p-4 font-bold text-night-ink">{cat.name}</td>
                  <td className="p-4 text-night-ink-soft">{cat.slug}</td>
                  <td className="p-4 text-night-ink-soft line-clamp-1">{cat.description}</td>
                  <td className="p-4 font-bold text-accent">{cat._count?.cakes || 0}</td>
                  <td className="p-4 flex gap-2">
                    <Button variant="ghost" className="!text-night-ink-soft p-1.5" onClick={() => openModal(cat)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" className="!text-red-400 hover:!bg-red-950/20 p-1.5" onClick={() => handleDelete('categories', cat.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={onClose} title={editingItem ? 'Edit Category' : 'Create Category'} tone="dark">
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <Field label="Category Name" name="name" defaultValue={editingItem?.name} required />
          <Field label="Description" name="description" defaultValue={editingItem?.description} textarea rows={2} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" className="!text-night-ink-soft" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
