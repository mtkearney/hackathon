import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}

export default function Alert({
  children,
  className,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  ...props
}: AlertProps) {
  const baseStyles = 'p-4 rounded-md border';
  
  const variantStyles = {
    info: 'bg-primary/5 border-primary/20 text-primary',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  
  const variantTitleStyles = {
    info: 'text-primary',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
  };
  
  return (
    <div
      className={twMerge(clsx(
        baseStyles,
        variantStyles[variant],
        'slide-up',
        className
      ))}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {icon}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h4 className={clsx('text-sm font-bold mb-1', variantTitleStyles[variant])}>
              {title}
            </h4>
          )}
          
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <button
            type="button"
            className="flex-shrink-0 ml-3 -mr-1 -mt-1 p-1 rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}