import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-all duration-200';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/90 focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50',
    accent: 'bg-accent text-white hover:bg-accent/90 focus:ring-2 focus:ring-offset-2 focus:ring-accent/50',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10 focus:ring-2 focus:ring-offset-2 focus:ring-primary/30',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  const loadingStyles = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  
  return (
    <button
      className={twMerge(clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        loadingStyles,
        className
      ))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
} 