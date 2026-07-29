import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind
 * utilities. Use everywhere a component composes dynamic class strings.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
