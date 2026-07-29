import React from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'brand' | 'amber' | 'blue' | 'indigo' | 'purple' | 'orange' | 'green' | 'rose' | 'neutral';

const tones: Record<BadgeTone, string> = {
  brand: 'bg-brand-soft text-brand',
  amber: 'bg-accent-soft text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
  green: 'bg-green-50 text-green-700',
  rose: 'bg-red-50 text-red-700',
  neutral: 'bg-surface-muted text-ink-soft',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

/**
 * Single source of truth mapping an order status to a badge tone + label.
 * Both the customer dashboard and the admin console use this so order state
 * is rendered identically everywhere.
 */
export const orderStatusTone: Record<string, BadgeTone> = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  PREPARING: 'indigo',
  BAKING: 'purple',
  OUT_FOR_DELIVERY: 'orange',
  DELIVERED: 'green',
  CANCELLED: 'rose',
};

export const paymentStatusTone: Record<string, BadgeTone> = {
  PENDING: 'amber',
  PAID: 'green',
  FAILED: 'rose',
  REFUNDED: 'neutral',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={orderStatusTone[status] || 'neutral'}>{status.replace(/_/g, ' ')}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge tone={paymentStatusTone[status] || 'neutral'}>{status}</Badge>;
}

export default Badge;
