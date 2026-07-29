'use client';

import React from 'react';
import { Card, Button, Modal, Field } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminUsersTab({
  usersData,
  refetchUsers,
  openModal,
  handleUserSubmit,
  handleDelete,
  showModal,
  editingItem,
  onClose,
  usersError,
}: {
  usersData: any[];
  refetchUsers: () => void;
  openModal: (item?: any) => void;
  handleUserSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDelete: (type: string, id: string) => void;
  showModal: boolean;
  editingItem: any;
  onClose: () => void;
  usersError?: any;
}) {
  if (usersError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load users.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-night-ink">Registered Users</h2>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      <Card tone="dark" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-night border-b border-night-border text-night-ink-soft">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-border">
              {usersData?.map((u: any) => (
                <tr key={u.id} className="hover:bg-night-border/40">
                  <td className="p-4 font-bold text-night-ink">{u.name}</td>
                  <td className="p-4 text-night-ink-soft">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-brand/20 text-brand' : 'bg-night-border text-night-ink-soft'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-night-ink">{u._count?.orders || 0}</td>
                  <td className="p-4 text-night-ink-soft">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2">
                    <Button variant="ghost" className="!text-night-ink-soft p-1.5" onClick={() => openModal(u)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" className="!text-red-400 hover:!bg-red-950/20 p-1.5" onClick={() => handleDelete('admin/users', u.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={onClose} title={editingItem ? 'Edit User' : 'Create User'} tone="dark">
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <Field label="Full Name" name="name" defaultValue={editingItem?.name} required />
          <Field label="Email Address" name="email" type="email" defaultValue={editingItem?.email} required />
          <Field label={`Password ${editingItem ? '(leave blank to keep)' : ''}`} name="password" type="password" />
          <Field label="Role" name="role" type="select" defaultValue={editingItem?.role || 'CUSTOMER'}>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="ADMIN">ADMIN</option>
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" type="button" className="!text-night-ink-soft" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
