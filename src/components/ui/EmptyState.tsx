import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-[#E5E7EB] ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#EDEDEB] text-[#252525] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#252525]">{title}</h3>
      <p className="mt-1 text-sm text-[#737373] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
