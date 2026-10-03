import type { VariantProps } from 'tailwind-variants';

import { tv } from './tv';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  variants: {
    intent: {
      primary: 'bg-teal-700 text-white hover:bg-teal-800',
      secondary: 'bg-stone-200 text-stone-900 hover:bg-stone-300',
      danger: 'bg-red-700 text-white hover:bg-red-800',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
});

export const quietButtonVariants = tv({
  extend: buttonVariants,
  base: 'bg-transparent shadow-none',
  defaultVariants: {
    intent: 'secondary',
    size: 'sm',
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
