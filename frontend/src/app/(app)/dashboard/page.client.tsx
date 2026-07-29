'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import API from '@/services/api';
import { formatPrice } from '@/lib/format';
import { OrderStatusBadge } from '@/components/ui';
import { ShoppingBag, Bell, Mail, RefreshCw, XCircle, ChevronDown, ChevronUp, PackageCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders, error: ordersError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await API.get('/orders');
      return res.data?.orders;
    }
  });

  // Fetch notifications
  const { data: notificationsData, refetch: refetchNotifications, error: notificationsError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await API.get('/notifications');
      return res.data?.notifications;
    }
  });

  const handleMarkNotificationRead = async (notifId: string) => {
    try {
      await API.put(`/notifications/${notifId}/read`);
      refetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await API.delete(`/orders/${orderId}/cancel`);
      refetchOrders();
      refetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Tracking progress value mapped
  const trackingSteps = ['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  return (
    <div className="space-y-10">
      
      {/* Welcome Hero card */}
      <div className="bg-gradient-to-r from-night-elevated via-stone-900 to-night p-8 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-rose-500 tracking-wider">Welcome Back</span>
          <h1 className="text-3xl font-black mt-1">Hello, {user?.name}</h1>
          <p className="text-ink-faint text-sm mt-1">{user?.email}</p>
        </div>
        <Link href="/cakes" className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 font-semibold rounded-full text-xs shadow-md transition-colors text-center w-fit">
          Order New Cake
        </Link>
      </div>

      {/* Grid of Inbox Notifications & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Orders History list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-rose-600" /> My Orders
            </h2>
            <button onClick={() => refetchOrders()} className="p-1.5 hover:bg-border rounded-lg text-ink-soft">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {ordersLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-surface border rounded-3xl"></div>
              ))}
            </div>
          ) : ordersError ? (
            <div className="text-center py-16 bg-surface border border-border rounded-3xl space-y-4">
              <PackageCheck className="h-10 w-10 text-ink-faint mx-auto" />
              <p className="text-ink-soft text-sm">Failed to load orders. Please try again.</p>
              <button onClick={() => refetchOrders()} className="px-5 py-2 bg-night-elevated text-white rounded-full text-xs font-semibold">
                Retry
              </button>
            </div>
          ) : !ordersData || ordersData.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-3xl space-y-4">
              <PackageCheck className="h-10 w-10 text-ink-faint mx-auto" />
              <p className="text-ink-soft text-sm">No orders recorded yet.</p>
              <Link href="/cakes" className="inline-block px-5 py-2 bg-night-elevated text-white rounded-full text-xs font-semibold">
                Browse catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData.map((order: any) => {
                const isExpanded = expandedOrder === order.id;
                const statusIdx = trackingSteps.indexOf(order.status);

                return (
                  <div key={order.id} className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:border-border-strong transition-colors">
                    
                    {/* Header bar */}
                    <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-ink font-bold text-sm block">#{order.id.slice(0, 8)}</span>
                        <span className="text-ink-faint text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                       <div className="flex items-center gap-2.5">
                         <OrderStatusBadge status={order.status} />
                        <button
                          onClick={() => toggleExpandOrder(order.id)}
                          className="p-1.5 hover:bg-surface-muted rounded-lg text-ink-soft"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Progress slider tracking for active orders */}
                    {order.status !== 'CANCELLED' && (
                      <div className="px-6 pb-6 border-b border-stone-100">
                        <div className="relative h-1.5 bg-surface-muted rounded-full w-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-rose-600 rounded-full transition-all duration-500"
                            style={{ width: `${((statusIdx + 1) / trackingSteps.length) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-ink-faint uppercase tracking-wider">
                          <span>Pending</span>
                          <span>Baking</span>
                          <span>Delivered</span>
                        </div>
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="p-6 bg-canvas border-t border-stone-100 space-y-6 text-sm">
                        
                        {/* List items ordered */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-ink uppercase text-[10px] tracking-wider">Items Ordered</h4>
                          <div className="divide-y divide-border">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="py-2 flex justify-between">
                                <div>
                                  <span className="font-semibold text-ink">{item.cake?.name}</span>
                                  <span className="block text-ink-faint text-xs mt-0.5">Customizations: {item.weight}kg | {item.flavor} flavor | {item.spongeType} sponge</span>
                                </div>
                                <span className="font-bold text-ink">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery credentials */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
                          <div>
                            <h4 className="font-bold text-ink uppercase text-[10px] tracking-wider mb-1.5">Delivery Address</h4>
                            <p className="text-ink-soft text-xs leading-relaxed">
                              {order.deliveryName} <br />
                              {order.deliveryAddress}, {order.deliveryCity} <br />
                              Phone: {order.deliveryPhone}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-bold text-ink uppercase text-[10px] tracking-wider mb-1.5">Delivery Slot</h4>
                            <p className="text-ink-soft text-xs">
                              Date: {order.deliveryDate} <br />
                              Time: {order.deliveryTime} <br />
                              Tier: <span className="font-semibold">{order.deliveryOption}</span>
                            </p>
                          </div>
                        </div>

                        {/* Invoice prices and action buttons */}
                        <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="text-ink-soft text-xs space-y-1">
                            <div>Subtotal: <span className="font-bold text-ink">{formatPrice(order.totalPrice - order.deliveryFee - order.tax + order.discount)}</span></div>
                            {order.discount > 0 && <div className="text-green-600">Discount Applied: <span className="font-bold">-{formatPrice(order.discount)}</span></div>}
                            <div>Delivery Fee: <span className="font-bold text-ink">{formatPrice(order.deliveryFee)}</span></div>
                            <div>Total Payment: <span className="font-black text-rose-600">{formatPrice(order.totalPrice)} ({order.paymentMethod})</span></div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="flex items-center gap-1 px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl transition-colors"
                              >
                                <XCircle className="h-4 w-4" /> Cancel Order
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Inbox Column */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Bell className="h-5 w-5 text-rose-600" /> Notifications Inbox
          </h2>

          {!notificationsData || notificationsData.length === 0 ? (
            <div className="p-6 bg-surface border border-border rounded-3xl text-center text-ink-faint text-sm shadow-sm">
              <Mail className="h-8 w-8 text-stone-200 mx-auto mb-2" /> No new notifications.
            </div>
          ) : notificationsError ? (
            <div className="p-6 bg-surface border border-border rounded-3xl text-center text-rose-600 text-sm shadow-sm">
              Failed to load notifications.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notificationsData.map((notif: any) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && handleMarkNotificationRead(notif.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!notif.read) handleMarkNotificationRead(notif.id);
                      }
                    }}
                    className={`p-5 rounded-2xl border text-xs leading-relaxed transition-all cursor-pointer shadow-sm relative ${
                      notif.read
                        ? 'bg-canvas border-border text-ink-soft'
                        : 'bg-surface border-rose-200 text-stone-800 font-medium hover:border-rose-300'
                    }`}
                  >
                  {!notif.read && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-rose-600"></span>
                  )}
                  <h4 className="font-bold text-ink mb-1">{notif.title}</h4>
                  <p>{notif.message}</p>
                  <span className="block text-ink-faint text-[10px] mt-2">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}