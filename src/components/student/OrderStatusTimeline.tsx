import React from 'react';
import { OrderStatus } from '@/types';
import { CheckCircle2, Clock, ChefHat, ShoppingBag, Check } from 'lucide-react';

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
    icon: CheckCircle2,
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
    icon: Check,
  },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
}) => {
  const getStepIndex = (s: OrderStatus): number => {
    switch (s) {
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
        return -1;
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
            className="h-full bg-[#1B4332] transition-all duration-700 ease-in-out"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#1B4332] text-white ring-4 ring-[#EBF5EE] shadow-md animate-pulse-subtle'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <p
                className={`mt-2.5 text-xs font-semibold ${
                  isCurrent
                    ? 'text-[#1B4332]'
                    : isCompleted
                    ? 'text-[#1A1C1E]'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-[#525866] mt-0.5 leading-tight">{step.description}</p>
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
            <div key={step.id} className="flex items-start gap-3 relative">
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-[1px] ${
                    isCompleted ? 'bg-[#1B4332]' : 'bg-[#E5E7EB]'
                  }`}
                />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  isCompleted
                    ? 'bg-[#1B4332] text-white'
                    : isCurrent
                    ? 'bg-[#1B4332] text-white ring-4 ring-[#EBF5EE]'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <div className="pb-2">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-[#1B4332]'
                      : isCompleted
                      ? 'text-[#1A1C1E]'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-[#525866]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
