'use client';

import React from 'react';
import { Card, Button, Modal, Field } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function AdminCombosTab({
  combosData,
  refetchCombos,
  openModal,
  handleComboSubmit,
  handleDelete,
  showModal,
  editingItem,
  onClose,
  combosError,
}: {
  combosData: any[];
  refetchCombos: () => void;
  openModal: (item?: any) => void;
  handleComboSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDelete: (type: string, id: string) => void;
  showModal: boolean;
  editingItem: any;
  onClose: () => void;
  combosError?: any;
}) {
  if (combosError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load combos.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-night-ink">Combo Offers</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Create Combo</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {combosData?.map((combo: any) => (
          <Card key={combo.id} tone="dark" className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-night-ink">{combo.name}</h3>
              <div className="text-xl font-black text-brand mt-1">{formatPrice(combo.price)}</div>
              <p className="text-night-ink-soft text-xs mt-2 line-clamp-2 leading-relaxed">{combo.description}</p>
            </div>
            <div className="bg-night p-3 rounded-xl">
              <h4 className="text-[10px] uppercase font-bold text-night-ink-soft mb-1.5">Included Elements</h4>
              <ul className="text-[10px] text-night-ink space-y-0.5">
                {combo.items?.map((item: string, idx: number) => (
                  <li key={idx}>- {item}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 pt-2 border-t border-night-border">
              <Button variant="outline" className="flex-1 !border-night-border !text-night-ink-soft hover:!bg-night-border text-[10px]" onClick={() => openModal(combo)}>
                <Edit className="h-3 w-3" /> Edit
              </Button>
              <Button variant="ghost" className="!text-red-400 hover:!bg-red-950/20 p-2" onClick={() => handleDelete('combos', combo.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={onClose} title={editingItem ? 'Edit Combo' : 'Create Combo'} tone="dark">
        <form onSubmit={handleComboSubmit} className="space-y-4">
          <Field label="Combo Name" name="name" defaultValue={editingItem?.name} required />
          <Field label="Price (Rs)" name="price" type="number" step="0.01" defaultValue={editingItem?.price} required />
          <Field label="Included Items (Comma separated)" name="items" defaultValue={editingItem?.items?.join(', ')} placeholder="Cake, 12 Balloons, Teddy Bear" required />
          <Field label="Description" name="description" defaultValue={editingItem?.description} textarea rows={2} required />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" className="!text-night-ink-soft" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Combo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
