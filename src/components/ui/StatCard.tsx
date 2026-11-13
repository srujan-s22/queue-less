import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#252525]/40 hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#737373] tracking-wider uppercase">{label}</p>
        {icon && <div className="p-2 rounded-xl bg-[#EDEDEB] text-[#252525]">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-[#252525] tracking-tight">{value}</p>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subValue && <p className="mt-1 text-xs text-[#737373]">{subValue}</p>}
    </div>
  );
};
