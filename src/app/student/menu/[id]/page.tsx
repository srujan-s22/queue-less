'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { menuService } from '@/services/menuService';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { DietaryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Clock,
  Flame,
  Star,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function FoodItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const itemId = typeof params.id === 'string' ? params.id : '';
  const item = menuService.getById(itemId);

  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  if (!item) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-gray-800">Dish not found</h2>
          <p className="text-gray-500 text-sm mt-1">This menu item may have been removed or changed.</p>
          <Link href="/student/menu" className="mt-4 inline-block text-sm font-semibold text-[#1B4332] underline">
            Return to Menu
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const availableAddons = [
    { id: 'extra_chutney', label: 'Extra Mint / Coconut Chutney', price: 10 },
    { id: 'extra_cheese', label: 'Extra Melted Cheese Layer', price: 20 },
    { id: 'double_spice', label: 'Chef Special Ghee Roast Seasoning', price: 15 },
  ];

  const toggleAddon = (label: string) => {
    setSelectedAddons((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const handleAddToCart = () => {
    const customizations = [
      `Spice: ${spiceLevel}`,
      ...selectedAddons,
    ];
    addItem(item, quantity, customizations);
    showToast({
      type: 'success',
      title: 'Added to Tray',
      message: `${quantity} × ${item.name} added to your tray`,
    });
    router.push('/student/cart');
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb navigation */}
        <Link
          href="/student/menu"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525866] hover:text-[#1A1C1E] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu Catalog</span>
        </Link>

        {/* Main Item Presentation Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2">
          {/* Photo Column */}
          <div className="relative aspect-4/3 md:aspect-auto h-72 md:h-full bg-gray-100">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <DietaryBadge dietary={item.dietary} />
              {item.isSpecial && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1B4332] text-white text-[11px] font-semibold uppercase tracking-wider shadow">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Campus Special
                </span>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#525866] uppercase tracking-wider">
                  {item.category.replace('-', ' ')}
                </span>
                {item.rating && (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#1A1C1E] bg-[#F4F3EE] px-2 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-[#525866] font-normal">({item.reviewCount})</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-[#1A1C1E] mt-1">{item.name}</h1>

              <div className="flex items-center gap-4 mt-3 text-xs text-[#525866]">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#1B4332]" />
                  {item.prepTimeMinutes} min prep time
                </span>
                {item.calories && (
                  <span>• {item.calories} kcal</span>
                )}
              </div>

              <p className="mt-4 text-sm text-[#525866] leading-relaxed">
                {item.description}
              </p>

              {/* Allergens info */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-[#525866]">
                  <span className="font-semibold text-gray-700">Allergen Notice: </span>
                  {item.allergens.join(', ')}
                </div>
              )}

              {/* Customization: Spice Level */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-2">
                  Preferred Spice Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mild', 'Medium', 'Spicy'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpiceLevel(level)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        spiceLevel === level
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#F9F9F7] text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization: Add-ons */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#1A1C1E] mb-2">
                  Optional Kitchen Add-ons
                </label>
                <div className="space-y-1.5">
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.label);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.label)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#EBF5EE] border-[#1B4332] text-[#1B4332] font-semibold'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-[#1B4332] border-[#1B4332] text-white' : 'border-gray-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                          {addon.label}
                        </span>
                        <span>+₹{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity and Add to Tray */}
            <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-2 bg-[#F4F3EE] p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-[#1B4332] hover:text-white transition-colors flex items-center justify-center font-bold"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-[#1A1C1E]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-[#1B4332] hover:text-white transition-colors flex items-center justify-center font-bold"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Add button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-[#525866] uppercase block">Item Total</span>
                  <span className="text-xl font-bold text-[#1A1C1E]">
                    ₹{item.price * quantity}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!item.isAvailable}
                  size="md"
                  variant="primary"
                >
                  Add to Tray
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
