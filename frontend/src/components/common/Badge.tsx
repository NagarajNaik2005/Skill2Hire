import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className
}) => {
  const variants = {
    primary: 'bg-brand-50/90 text-brand-700 border border-brand-200/90 shadow-[inset_0_1px_1px_0_rgba(255,255,255,1),0_1px_2px_0_rgba(124,58,237,0.06)]',
    success: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/90 shadow-[inset_0_1px_1px_0_rgba(255,255,255,1),0_1px_2px_0_rgba(16,185,129,0.06)]',
    warning: 'bg-amber-50/90 text-amber-700 border border-amber-200/90 shadow-[inset_0_1px_1px_0_rgba(255,255,255,1),0_1px_2px_0_rgba(245,158,11,0.06)]',
    danger: 'bg-rose-50/90 text-rose-700 border border-rose-200/90 shadow-[inset_0_1px_1px_0_rgba(255,255,255,1),0_1px_2px_0_rgba(244,63,94,0.06)]',
    neutral: 'bg-slate-50/90 text-slate-700 border border-slate-200/80 shadow-[inset_0_1px_1px_0_rgba(255,255,255,1),0_1px_2px_0_rgba(15,23,42,0.03)]',
    purple: 'bg-purple-50/90 text-purple-700 border border-purple-200/90 shadow-[inset_0_1px_1px_0_rgba(255,255,255,1),0_1px_2px_0_rgba(168,85,247,0.06)]'
  };

  const sizes = {
    sm: 'text-[10px] px-2.5 py-0.5 font-semibold rounded-full tracking-wide',
    md: 'text-xs px-3 py-1 font-semibold rounded-full tracking-wide'
  };

  return (
    <span className={twMerge(clsx('inline-flex items-center gap-1.5 backdrop-blur-md', variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};
