import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Badge({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-200';
  
  const variantStyles = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-foreground',
    accent: 'bg-accent/10 text-accent',
    outline: 'bg-transparent border border-primary/30 text-primary',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  return (
    <span
      className={twMerge(clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      ))}
      {...props}
    >
      {children}
    </span>
  );
}