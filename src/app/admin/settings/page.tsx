'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { configService } from '@/services/configService';
import { CanteenConfig } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useSocket } from '@/lib/socket/useSocket';
import { Clock, AlertTriangle, DollarSign, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<CanteenConfig>(() => configService.getConfig());
  const { showToast } = useToast();

  const [capacity, setCapacity] = useState(String(config.maxCapacityPerSlot));
  const [slotInterval, setSlotInterval] = useState(String(config.slotIntervalMinutes));
  const [gracePeriod, setGracePeriod] = useState(String(config.lateFeeConfig.gracePeriodMinutes));
  const [lateFee, setLateFee] = useState(String(config.lateFeeConfig.lateFeeAmount));
  const [lateFeePolicy, setLateFeePolicy] = useState(config.lateFeeConfig.policyDescription);
  const [openTime, setOpenTime] = useState(config.operatingHours.open);
  const [closeTime, setCloseTime] = useState(config.operatingHours.close);
  const [packagingFee, setPackagingFee] = useState(String(config.packagingCharge));
  const [taxPercent, setTaxPercent] = useState(String(config.taxRatePercent));
  const [announcement, setAnnouncement] = useState(config.announcement || '');

  const applyConfigToForm = useCallback((cfg: CanteenConfig) => {
    setConfig(cfg);
    setCapacity(String(cfg.maxCapacityPerSlot));
    setSlotInterval(String(cfg.slotIntervalMinutes));
    setGracePeriod(String(cfg.lateFeeConfig.gracePeriodMinutes));
    setLateFee(String(cfg.lateFeeConfig.lateFeeAmount));
    setLateFeePolicy(cfg.lateFeeConfig.policyDescription);
    setOpenTime(cfg.operatingHours.open);
    setCloseTime(cfg.operatingHours.close);
    setPackagingFee(String(cfg.packagingCharge));
    setTaxPercent(String(cfg.taxRatePercent));
    setAnnouncement(cfg.announcement || '');
  }, []);

  useEffect(() => {
    configService.fetchConfig().then(applyConfigToForm).catch(() => {});
  }, [applyConfigToForm]);

  useSocket('settings:updated', (data) => {
    if (data) applyConfigToForm(data);
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await configService.updateConfig({
        maxCapacityPerSlot: Number(capacity),
        slotIntervalMinutes: Number(slotInterval),
        packagingCharge: Number(packagingFee),
        taxRatePercent: Number(taxPercent),
        announcement,
        operatingHours: {
          open: openTime,
          close: closeTime,
        },
        lateFeeConfig: {
          gracePeriodMinutes: Number(gracePeriod),
          lateFeeAmount: Number(lateFee),
          policyDescription: lateFeePolicy,
          isLateFeeEnabled: true,
        },
      });

      applyConfigToForm(updated);
      showToast({
        type: 'success',
        title: 'Configuration Saved',
        message: 'Pickup slot caps, operating hours, and late fee policies updated live across all portals.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Unable to persist configuration to backend',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
            Campus Operational & Late Fee Configuration
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Set pickup slot order thresholds, collection deadlines, penalties, and operating hours.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Pickup Slot Caps & Intervals */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <Clock className="w-4 h-4 text-[#252525]" />
              <span>Pickup Slot Throttle & Capacity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Maximum Order Capacity Per Slot
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={100}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <span className="text-[11px] text-[#737373] mt-0.5 block">
                  Prevents kitchen bottleneck by capping ticket volume per 15-min window.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Slot Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={60}
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <span className="text-[11px] text-[#737373] mt-0.5 block">
                  Standard interval for campus class break switchovers (default: 15 mins).
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Collection Deadline & Late Pickup Fee */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Late Pickup Fee & Collection Policy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Grace Period (Minutes after READY)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <span className="text-[11px] text-[#737373] mt-0.5 block">
                  Countdown displayed to students once food arrives at pickup counter.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Late Pickup Penalty Fee (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
                <span className="text-[11px] text-[#737373] mt-0.5 block">
                  Fixed charge applied if deadline expires before student collects order.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#252525] mb-1">
                  Policy Disclosure Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={lateFeePolicy}
                  onChange={(e) => setLateFeePolicy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operating Hours & Announcement */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <h2 className="font-bold text-sm text-[#252525] uppercase tracking-wider flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Campus Operating Hours, Tax & Announcement</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Canteen Opening Time
                </label>
                <input
                  type="text"
                  required
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Canteen Closing Time
                </label>
                <input
                  type="text"
                  required
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Eco Packaging Fee (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  value={packagingFee}
                  onChange={(e) => setPackagingFee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  required
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#252525] mb-1">
                  Campus Header Announcement Banner
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration Settings
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
