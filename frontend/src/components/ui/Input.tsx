import React from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  tone?: 'light' | 'dark';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, tone = 'light', className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className={cn('block text-sm font-semibold', tone === 'light' ? 'text-ink' : 'text-night-ink-soft')}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl outline-none transition-colors',
            tone === 'light'
              ? 'bg-surface border border-border text-ink placeholder:text-ink-faint focus:border-brand'
              : 'bg-night border border-night-border text-night-ink placeholder:text-night-ink-soft focus:border-brand',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
