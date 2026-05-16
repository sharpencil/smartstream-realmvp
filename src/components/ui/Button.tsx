'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

import { useTheme } from 'next-themes';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  auraColor?: string; // For secondary hover border
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, auraColor = 'cyan-500', ...props }, ref) => {
    const { resolvedTheme } = useTheme();
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isLight = resolvedTheme === 'light';

    const baseStyles = "inline-flex items-center justify-center transition-all outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap [&_svg]:text-inherit";
    
    const primaryStyles = cn(
      "rounded-full font-bold uppercase tracking-widest text-slate-950",
      "bg-cyan-400 shadow-[0_10px_25px_rgba(6,182,212,0.3)]",
      "dark:text-white dark:bg-cyan-500 dark:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
    );

    const secondaryStyles = cn(
      "rounded-full font-bold uppercase tracking-widest text-slate-950",
      "bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
      "transition-all duration-300 hover:bg-white/90 hover:border-cyan-500/10",
      "dark:text-slate-100 dark:bg-slate-900/50 dark:border-white/10 dark:shadow-none dark:hover:bg-slate-800"
    );

    const ghostStyles = "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5";

    const motionProps = isPrimary ? {
      whileHover: isLight ? { y: -2, shadow: "0 15px 30px rgba(6,182,212,0.4)" } : {},
      transition: { type: "spring", stiffness: 400, damping: 10 } as const
    } : {};

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          isPrimary && primaryStyles,
          isSecondary && secondaryStyles,
          variant === 'ghost' && ghostStyles,
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
