import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
      dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400
      disabled:bg-blue-400 dark:disabled:bg-blue-700
    `,
    secondary: `
      bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500
      dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400
      disabled:bg-gray-100 dark:disabled:bg-gray-800
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700 focus:ring-red-500
      dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400
      disabled:bg-red-400 dark:disabled:bg-red-700
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500
      dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400
      disabled:bg-transparent dark:disabled:bg-transparent
    `,
  };

  const iconStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed opacity-60' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className={`animate-spin -ml-1 mr-3 ${iconStyles[size]} text-current`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={`mr-2 ${iconStyles[size]}`} />
      ) : null}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`ml-2 ${iconStyles[size]}`} />
      )}
    </button>
  );
};
