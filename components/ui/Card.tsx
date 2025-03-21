import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  const baseStyles = 'bg-background rounded-lg transition-all duration-200';
  
  const variantStyles = {
    default: 'shadow-md border border-gray-100 hover:shadow-lg',
    highlight: 'shadow-md border border-gray-100 border-l-4 border-l-accent hover:shadow-lg',
    outline: 'border-2 border-primary/20 hover:border-primary/40',
  };
  
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={twMerge(clsx(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      ))}
      {...props}
    >
      {children}
    </div>
  );
} 