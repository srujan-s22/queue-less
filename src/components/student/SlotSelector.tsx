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
            className={`relative flex flex-col p-4 rounded-xl border transition-all duration-150 select-none ${
              isFull
                ? 'opacity-50 bg-[#F5F5F3] border-[#E5E7EB] cursor-not-allowed'
                : isSelected
                ? 'bg-[#EDEDEB] border-[#252525] ring-2 ring-[#252525] shadow-2xs cursor-pointer'
                : 'bg-white border-[#E5E7EB] hover:border-[#737373] hover:shadow-2xs cursor-pointer'
            }`}
          >
            {/* Top row: Slot Time & Selected check */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-[#252525]">
                <Clock className="w-4 h-4 text-[#252525]" />
                <span>{slot.label}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-[#252525] flex-shrink-0" />}
            </div>

            {/* Capacity meter */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-[#737373] mb-1">
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
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull
                      ? 'bg-red-500'
                      : isFillingFast
                      ? 'bg-amber-500'
                      : 'bg-[#252525]'
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
