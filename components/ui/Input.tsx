import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  className,
  label,
  helperText,
  error,
  icon,
  fullWidth = true,
  id,
  ...props
}: InputProps) {
  const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const inputStyles = clsx(
    'px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200',
    fullWidth ? 'w-full' : 'w-auto',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
      : 'border-gray-300 focus:border-primary focus:ring-primary/30',
    icon && 'pl-10',
  );
  
  return (
    <div className={twMerge(clsx('mb-4', fullWidth ? 'w-full' : 'w-auto', className))}>
      {label && (
        <label htmlFor={uniqueId} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        
        <input
          id={uniqueId}
          className={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperText || error ? `${uniqueId}-description` : undefined}
          {...props}
        />
      </div>
      
      {(helperText || error) && (
        <p
          id={`${uniqueId}-description`}
          className={clsx(
            'mt-1 text-sm',
            error ? 'text-red-500' : 'text-gray-500'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
} 