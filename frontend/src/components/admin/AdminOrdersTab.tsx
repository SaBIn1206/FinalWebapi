'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatPrice } from '@/lib/format';

export default function AdminOrdersTab({
  ordersData,
  refetchOrders,
  handleStatusChange,
  handlePaymentChange,
  ordersError,
}: {
  ordersData: any[];
  refetchOrders: () => void;
  handleStatusChange: (orderId: string, status: string) => void;
  handlePaymentChange: (orderId: string, paymentStatus: string) => void;
  ordersError?: any;
}) {
  if (ordersError) {
    return (
      <Card tone="dark" className="p-8 text-center text-night-ink-soft">
        <p className="font-medium">Failed to load orders.</p>
      </Card>
    );
  }
  return (
    <Card tone="dark" className="overflow-hidden">
      <div className="p-6 border-b border-night-border flex items-center justify-between">
        <h2 className="font-bold text-lg text-night-ink">Active Orders</h2>
        <button onClick={() => refetchOrders()} className="p-1.5 hover:bg-night-border rounded-lg text-night-ink-soft" aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-night border-b border-night-border text-night-ink-soft">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date & Slot</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Order Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-night-border">
            {ordersData?.map((order: any) => (
              <tr key={order.id} className="hover:bg-night-border/40">
                <td className="p-4 font-mono font-bold text-brand">#{order.id.slice(0, 8)}</td>
                <td className="p-4">
                  <div className="font-bold text-night-ink">{order.deliveryName}</div>
                  <div className="text-[10px] text-night-ink-soft">{order.deliveryPhone}</div>
                </td>
                <td className="p-4">
                  <div>Date: {order.deliveryDate}</div>
                  <div className="text-[10px] text-night-ink-soft">Slot: {order.deliveryTime}</div>
                </td>
                <td className="p-4 font-bold text-night-ink">{formatPrice(order.totalPrice)}</td>
                <td className="p-4">
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                    className="bg-night border border-night-border rounded-lg px-2 py-1 outline-none text-night-ink"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-night border border-night-border rounded-lg px-2 py-1 outline-none text-brand font-bold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PREPARING">PREPARING</option>
                    <option value="BAKING">BAKING</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
