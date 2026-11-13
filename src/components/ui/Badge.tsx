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
    default: 'bg-[#EBF5EE] text-[#1B4332] border border-[#1B4332]/15',
    success: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    danger: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
    info: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    neutral: 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]',
    outline: 'bg-transparent text-[#374151] border border-[#D1D5DB]',
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
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
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
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
          Preparing
        </Badge>
      );
    case 'READY_FOR_PICKUP':
      return (
        <Badge variant="success" size={size} className="animate-pulse-subtle font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Ready for Pickup
        </Badge>
      );
    case 'PICKED_UP':
      return (
        <Badge variant="default" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332]" />
          Completed
        </Badge>
      );
    case 'REJECTED':
    case 'CANCELLED':
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

export const DietaryBadge: React.FC<{ dietary: DietaryType }> = ({ dietary }) => {
  if (dietary === 'veg') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-600 bg-emerald-50 text-[10px] font-semibold text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        VEG
      </span>
    );
  }
  if (dietary === 'non-veg') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-rose-600 bg-rose-50 text-[10px] font-semibold text-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        NON-VEG
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-teal-600 bg-teal-50 text-[10px] font-semibold text-teal-800">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
      VEGAN
    </span>
  );
};
