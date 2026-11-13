'use client';

import React from 'react';
import { PickupSlot } from '@/types';
import { Clock, Users, CheckCircle2 } from 'lucide-react';

interface SlotSelectorProps {
  slots: PickupSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: PickupSlot) => void;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {slots.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        const isFull = slot.status === 'full';
        const isFillingFast = slot.status === 'filling-fast';
        const percent = Math.min(100, Math.round((slot.bookedCount / slot.capacity) * 100));

        return (
          <div
            key={slot.id}
            onClick={() => {
              if (!isFull) onSelectSlot(slot);
            }}
            className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 select-none ${
              isFull
                ? 'opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed'
                : isSelected
                ? 'bg-[#EBF5EE] border-[#1B4332] ring-2 ring-[#1B4332] shadow-sm cursor-pointer'
                : 'bg-white border-[#E5E7EB] hover:border-gray-400 hover:shadow-xs cursor-pointer'
            }`}
          >
            {/* Top row: Slot Time & Selected check */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-[#1A1C1E]">
                <Clock className="w-4 h-4 text-[#1B4332]" />
                <span>{slot.label}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1B4332] flex-shrink-0" />}
            </div>

            {/* Capacity meter */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[#525866] mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {slot.bookedCount} / {slot.capacity} orders
                </span>
                <span
                  className={`font-medium ${
                    isFull
                      ? 'text-red-600'
                      : isFillingFast
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {isFull ? 'Full' : isFillingFast ? 'Filling fast' : 'Available'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull
                      ? 'bg-red-500'
                      : isFillingFast
                      ? 'bg-amber-500'
                      : 'bg-[#1B4332]'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
