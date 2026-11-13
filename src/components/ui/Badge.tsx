import React from 'react';
import { OrderStatus, DietaryType } from '@/types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-[#EDEDEB] text-[#252525] border border-[#E5E7EB]',
    success: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    info: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    neutral: 'bg-[#EDEDEB] text-[#737373] border border-[#E5E7EB]',
    outline: 'bg-transparent text-[#252525] border border-[#E5E7EB]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  switch (status) {
    case 'PLACED':
      return (
        <Badge variant="neutral" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
          Order Placed
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge variant="info" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Accepted
        </Badge>
      );
    case 'PREPARING':
      return (
        <Badge variant="warning" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Preparing
        </Badge>
      );
    case 'READY_FOR_PICKUP':
      return (
        <Badge variant="success" size={size} className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Ready for Pickup
        </Badge>
      );
    case 'PICKED_UP':
      return (
        <Badge variant="neutral" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#252525]" />
          Completed
        </Badge>
      );
    case 'CANCELLED':
    case 'REJECTED':
      return (
        <Badge variant="danger" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
};

export const DietaryBadge: React.FC<{ dietary: DietaryType; size?: 'sm' | 'md' }> = ({
  dietary,
  size = 'sm',
}) => {
  switch (dietary) {
    case 'veg':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider text-[10px] ${
            size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1 text-xs'
          } bg-emerald-50 text-emerald-800 border border-emerald-300`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Veg
        </span>
      );
    case 'non-veg':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider text-[10px] ${
            size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1 text-xs'
          } bg-rose-50 text-rose-800 border border-rose-300`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          Non-Veg
        </span>
      );
    case 'vegan':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md uppercase tracking-wider text-[10px] ${
            size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1 text-xs'
          } bg-teal-50 text-teal-800 border border-teal-300`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          Vegan
        </span>
      );
    default:
      return null;
  }
};
