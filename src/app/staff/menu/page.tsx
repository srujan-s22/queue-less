'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { menuService } from '@/services/menuService';
import { MenuItem, Category } from '@/types';
import { useToast } from '@/context/ToastContext';
import { DietaryBadge } from '@/components/ui/Badge';
import { Search, Check, X } from 'lucide-react';

export default function StaffMenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>(() => menuService.getAll());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { showToast } = useToast();

  const handleToggle = (id: string, name: string, currentStatus: boolean) => {
    menuService.toggleAvailability(id);
    setItems(menuService.getAll());
    showToast({
      type: currentStatus ? 'warning' : 'success',
      title: currentStatus ? `${name} Marked Sold Out (86'd)` : `${name} Restocked Live`,
      message: currentStatus
        ? 'Students cannot add this item to new orders.'
        : 'Item is now available on the student menu.',
    });
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      return item.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Item 86 & Live Stock Manager
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Toggle availability instantly when batches run out during lunch hours.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#252525] text-[#252525]"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'breakfast', 'meals', 'quick-bites', 'beverages', 'desserts'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#252525] text-white shadow-2xs'
                  : 'bg-white border border-[#E5E7EB] text-[#737373] hover:bg-[#EDEDEB]'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDEDEB] border-b border-[#E5E7EB] text-[#737373] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Dish</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Kitchen Prep</th>
                  <th className="p-3.5">Availability Status</th>
                  <th className="p-3.5 pr-5 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !item.isAvailable ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <DietaryBadge dietary={item.dietary} />
                            <span className="font-semibold text-gray-900 text-sm">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 capitalize text-gray-600 font-medium">
                      {item.category.replace('-', ' ')}
                    </td>

                    <td className="p-3.5 font-bold text-gray-900">
                      ₹{item.price}
                    </td>

                    <td className="p-3.5 text-gray-600 font-medium">
                      ~{item.prepTimeMinutes} mins
                    </td>

                    <td className="p-3.5">
                      {item.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                          <X className="w-3.5 h-3.5 text-red-600" />
                          Sold Out (86&apos;d)
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleToggle(item.id, item.name, item.isAvailable)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all ${
                          item.isAvailable
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {item.isAvailable ? "Mark 86'd" : 'Restore Stock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
