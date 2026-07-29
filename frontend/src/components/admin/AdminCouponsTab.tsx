'use client';

import React from 'react';
import { Card, Button, Modal, Field } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function AdminCouponsTab({
  couponsData,
  refetchCoupons,
  openModal,
  handleCouponSubmit,
  handleDelete,
  showModal,
  editingItem,
  onClose,
  couponsError,
}: {
  couponsData: any[];
  refetchCoupons: () => void;
  openModal: (item?: any) => void;
  handleCouponSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDelete: (type: string, id: string) => void;
  showModal: boolean;
  editingItem: any;
  onClose: () => void;
  couponsError?: any;
}) {
  if (couponsError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load coupons.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-night-ink">Coupons Registry</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Create Coupon</Button>
      </div>

      <Card tone="dark" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-night border-b border-night-border text-night-ink-soft">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Max Discount</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-border">
              {couponsData?.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-night-border/40">
                  <td className="p-4 font-mono font-bold text-night-ink">{coupon.code}</td>
                  <td className="p-4 font-bold text-brand">{coupon.discountPercentage}%</td>
                  <td className="p-4 text-night-ink-soft">{coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : 'Unlimited'}</td>
                  <td className="p-4 text-night-ink-soft">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2">
                    <Button variant="ghost" className="!text-night-ink-soft p-1.5" onClick={() => openModal(coupon)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" className="!text-red-400 hover:!bg-red-950/20 p-1.5" onClick={() => handleDelete('coupons', coupon.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={onClose} title={editingItem ? 'Edit Coupon' : 'Create Coupon'} tone="dark">
        <form onSubmit={handleCouponSubmit} className="space-y-4">
          <Field label="Coupon Code (Uppercase)" name="code" defaultValue={editingItem?.code} required classes="uppercase" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount (%)" name="discountPercentage" type="number" defaultValue={editingItem?.discountPercentage} required />
            <Field label="Max Discount (Rs)" name="maxDiscount" type="number" defaultValue={editingItem?.maxDiscount} />
          </div>
          <Field label="Expiry Date" name="expiryDate" type="date" defaultValue={editingItem?.expiryDate ? new Date(editingItem.expiryDate).toISOString().split('T')[0] : ''} required />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" className="!text-night-ink-soft" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
