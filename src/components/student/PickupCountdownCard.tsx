'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { configService } from '@/services/configService';
import { orderService } from '@/services/orderService';
import { Clock, AlertTriangle } from 'lucide-react';

interface PickupCountdownCardProps {
  order: Order;
  onOrderUpdated?: (updated: Order) => void;
}

export const PickupCountdownCard: React.FC<PickupCountdownCardProps> = ({
  order,
  onOrderUpdated,
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [isLate, setIsLate] = useState<boolean>(false);
  const config = configService.getConfig();

  useEffect(() => {
    const calculateTime = () => {
      const deadline = new Date(order.pickupDeadline).getTime();
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeftMs(0);
        setIsLate(true);
      } else {
        setTimeLeftMs(diff);
        setIsLate(false);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [order.pickupDeadline]);

  // Format mm:ss
  const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const deadlineFormatted = new Date(order.pickupDeadline).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Simulator actions for testing
  const handleSimulateOverdue = async () => {
    // Set deadline 5 minutes in the past
    const overdueDeadline = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const updated = await orderService.updateStatus(order.id, 'READY_FOR_PICKUP');
    if (updated) {
      updated.pickupDeadline = overdueDeadline;
      orderService.saveOrder(updated);
      const finalOrder = orderService.applyLateFee(order.id) || updated;
      if (onOrderUpdated) onOrderUpdated(finalOrder);
    }
  };

  const handleSimulateUrgent = async () => {
    // Set deadline 2 minutes in the future
    const urgentDeadline = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const updated = await orderService.updateStatus(order.id, 'READY_FOR_PICKUP');
    if (updated) {
      updated.pickupDeadline = urgentDeadline;
      updated.lateFeeApplied = 0;
      orderService.saveOrder(updated);
      if (onOrderUpdated) onOrderUpdated(updated);
    }
  };

  const handleResetDeadline = async () => {
    const freshDeadline = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const updated = await orderService.updateStatus(order.id, 'READY_FOR_PICKUP');
    if (updated) {
      updated.pickupDeadline = freshDeadline;
      updated.lateFeeApplied = 0;
      orderService.saveOrder(updated);
      if (onOrderUpdated) onOrderUpdated(updated);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isLate
          ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
          : 'bg-white border-[#E5E7EB] text-[#252525] shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {isLate ? (
              <span className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#B45309]">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </span>
            ) : (
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Clock className="w-5 h-5 text-emerald-600" />
              </span>
            )}
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#252525]">
                {isLate ? 'Collection Deadline Expired' : 'Collect Food at Counter'}
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Collection Deadline:{' '}
                <span className="font-semibold text-[#252525]">{deadlineFormatted}</span> ({config.lateFeeConfig.gracePeriodMinutes} min grace window)
              </p>
            </div>
          </div>
        </div>

        {/* Big countdown badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2.5 rounded-xl border text-center shadow-2xs ${
              isLate
                ? 'bg-red-600 border-red-700 text-white'
                : 'bg-[#252525] border-[#171717] text-white'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider block opacity-75 font-medium">
              {isLate ? 'Overdue by' : 'Time Remaining'}
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight">
              {isLate ? 'EXPIRED' : formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Policy and Late Fee banner */}
      <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#737373]">
        <div className="flex items-start gap-2 max-w-xl">
          <span className="font-semibold text-[#252525] flex-shrink-0">Collection Policy:</span>
          <span>{config.lateFeeConfig.policyDescription}</span>
        </div>

        {isLate ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-800 font-semibold text-xs border border-red-300">
            <span>Late Fee Applied: ₹{config.lateFeeConfig.lateFeeAmount}</span>
          </div>
        ) : (
          <div className="text-right text-[11px] text-[#737373] flex items-center gap-2">
            <span>Late fee if missed:</span>
            <span className="font-bold text-[#252525]">₹{config.lateFeeConfig.lateFeeAmount}</span>
          </div>
        )}
      </div>

      {/* Simulator Evaluation Controls */}
      <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] text-[#737373] font-medium mr-1">Demo Evaluation Controls:</span>
        <button
          onClick={handleSimulateUrgent}
          className="px-2.5 py-1 rounded-lg bg-[#EDEDEB] hover:bg-[#E5E7EB] text-[#252525] font-medium transition-colors"
        >
          Set 2m Urgent
        </button>
        <button
          onClick={handleSimulateOverdue}
          className="px-2.5 py-1 rounded-lg bg-[#EDEDEB] hover:bg-amber-100 text-[#B45309] font-medium transition-colors"
        >
          Trigger Overdue & Late Fee
        </button>
        <button
          onClick={handleResetDeadline}
          className="px-2.5 py-1 rounded-lg bg-[#EDEDEB] hover:bg-[#E5E7EB] text-[#252525] font-medium transition-colors"
        >
          Reset 10m
        </button>
      </div>
    </div>
  );
};
