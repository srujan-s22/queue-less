'use client';

import React from 'react';
import { OrderStatus } from '@/types';
import { Check, Clock, ChefHat, ShoppingBag, CheckCircle2 } from 'lucide-react';

interface OrderStatusTimelineProps {
  status: OrderStatus;
  createdAt: string;
  readyAt?: string;
  collectedAt?: string;
}

interface Step {
  id: OrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    id: 'PLACED',
    label: 'Order Placed',
    description: 'Received by canteen',
    icon: Clock,
  },
  {
    id: 'ACCEPTED',
    label: 'Accepted',
    description: 'Kitchen queued',
    icon: Check,
  },
  {
    id: 'PREPARING',
    label: 'Preparing',
    description: 'Chef is cooking',
    icon: ChefHat,
  },
  {
    id: 'READY_FOR_PICKUP',
    label: 'Ready for Pickup',
    description: 'At collection counter',
    icon: ShoppingBag,
  },
  {
    id: 'PICKED_UP',
    label: 'Collected',
    description: 'Order fulfilled',
    icon: CheckCircle2,
  },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
}) => {
  // If cancelled or rejected
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-center">
        <p className="font-semibold text-sm">
          This order was {status === 'REJECTED' ? 'rejected by canteen staff' : 'cancelled'}.
        </p>
      </div>
    );
  }

  const getStepIndex = (current: OrderStatus): number => {
    switch (current) {
      case 'PLACED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
        return 3;
      case 'PICKED_UP':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-2">
      {/* Desktop & Tablet horizontal timeline */}
      <div className="relative hidden sm:flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-5 h-1 bg-[#E5E7EB] -z-0">
          <div
            className="h-full bg-[#252525] transition-all duration-500 ease-in-out"
            style={{
              width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center max-w-[110px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#252525] text-white shadow-2xs'
                    : isCurrent
                    ? 'bg-[#252525] text-white ring-4 ring-[#EDEDEB] shadow-xs'
                    : 'bg-white text-[#737373] border border-[#E5E7EB]'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <p
                className={`mt-2.5 text-xs font-semibold ${
                  isCurrent
                    ? 'text-[#252525]'
                    : isCompleted
                    ? 'text-[#252525]'
                    : 'text-[#737373]'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-[#737373] mt-0.5 leading-tight">{step.description}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile vertical timeline */}
      <div className="sm:hidden space-y-4">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isCompleted
                    ? 'bg-[#252525] text-white'
                    : isCurrent
                    ? 'bg-[#252525] text-white ring-4 ring-[#EDEDEB]'
                    : 'bg-white text-[#737373] border border-[#E5E7EB]'
                }`}
              >
                <StepIcon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-[#252525]'
                      : isCompleted
                      ? 'text-[#252525]'
                      : 'text-[#737373]'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-[#737373]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
