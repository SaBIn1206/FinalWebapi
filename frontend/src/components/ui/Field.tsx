import React from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  classes?: string;
  step?: string;
  children?: React.ReactNode; // select options
}

/**
 * Labeled form control styled with the dark admin token palette. Renders an
 * input, textarea, or (when `children` are passed) a <select>. Replaces the
 * repeated raw `bg-stone-950 border-stone-800` inputs across admin CRUD forms.
 */
export function Field({ label, name, defaultValue, type = 'text', required, placeholder, textarea, rows = 3, classes, step, children }: FieldProps) {
  const base = cn(
    'w-full px-3 py-2 bg-night border border-night-border rounded-lg outline-none text-sm text-night-ink placeholder:text-night-ink-soft focus:border-brand transition-colors',
    classes
  );
  return (
    <div>
      <label className="block text-night-ink-soft text-xs mb-1.5">{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue as string} required={required} rows={rows} className={base} />
      ) : children ? (
        <select name={name} defaultValue={defaultValue as string} required={required} className={base}>
          {children}
        </select>
      ) : (
        <input name={name} type={type} defaultValue={defaultValue as string} required={required} placeholder={placeholder} step={step} className={base} />
      )}
    </div>
  );
}

export default Field;
