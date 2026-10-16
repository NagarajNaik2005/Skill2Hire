import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'btn-glossy-primary shimmer-sweep text-white font-bold',
    secondary: 'btn-glossy-secondary text-slate-800 font-semibold focus:ring-brand-400',
    outline: 'bg-white/90 backdrop-blur-md hover:bg-brand-50/80 border border-brand-200 hover:border-brand-400 text-brand-700 hover:text-brand-800 shadow-xs hover:shadow-sm focus:ring-brand-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-400',
    ghost: 'bg-transparent hover:bg-brand-50/80 text-slate-600 hover:text-brand-700 border border-transparent hover:border-brand-200/60 focus:ring-brand-400'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 shadow-lg'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};
