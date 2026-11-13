import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#252525] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#252525] hover:bg-[#171717] text-white shadow-2xs hover:shadow-xs active:scale-[0.99]',
    secondary:
      'bg-white hover:bg-[#EDEDEB] text-[#252525] border border-[#E5E7EB] shadow-2xs active:scale-[0.99]',
    outline:
      'bg-white border border-[#E5E7EB] text-[#252525] hover:bg-[#EDEDEB] hover:border-[#D1D5DB] active:scale-[0.99]',
    ghost:
      'bg-transparent text-[#252525] hover:bg-[#EDEDEB] active:bg-[#E5E7EB]',
    danger:
      'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-2xs active:scale-[0.99]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
