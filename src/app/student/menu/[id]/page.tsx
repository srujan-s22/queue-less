'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { menuService } from '@/services/menuService';
import { MenuItem } from '@/types';
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
} from 'lucide-react';

export default function FoodItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const itemId = typeof params.id === 'string' ? params.id : '';
  const [item, setItem] = useState<MenuItem | null>(() => menuService.getById(itemId) || null);
  const [isLoading, setIsLoading] = useState(!item);

  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    menuService.fetchMenuItemById(itemId).then((fetched) => {
      if (mounted) {
        if (fetched) setItem(fetched);
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [itemId]);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-[#EDEDEB] rounded w-24" />
          <div className="bg-white rounded-2xl border border-[#E5E7EB] h-96" />
        </div>
      </StudentLayout>
    );
  }

  if (!item) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-[#252525]">Dish not found</h2>
          <p className="text-[#737373] text-sm mt-1">This menu item may have been removed or changed.</p>
          <Link href="/student/menu" className="mt-4 inline-block text-sm font-semibold text-[#252525] underline">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#252525] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu Catalog</span>
        </Link>

        {/* Main Item Presentation Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-2">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#252525] text-white text-[11px] font-semibold uppercase tracking-wider shadow-2xs">
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
                <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                  {item.category.replace('-', ' ')}
                </span>
                {item.rating && (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#252525] bg-[#EDEDEB] px-2 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-[#737373] font-normal">({item.reviewCount})</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-[#252525] mt-1">{item.name}</h1>

              <div className="flex items-center gap-4 mt-3 text-xs text-[#737373]">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#252525]" />
                  {item.prepTimeMinutes} min prep time
                </span>
                {item.calories && (
                  <span>• {item.calories} kcal</span>
                )}
              </div>

              <p className="mt-4 text-sm text-[#737373] leading-relaxed">
                {item.description}
              </p>

              {/* Allergens info */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-[#737373]">
                  <span className="font-semibold text-[#252525]">Allergen Notice: </span>
                  {item.allergens.join(', ')}
                </div>
              )}

              {/* Customization: Spice Level */}
              <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
                <label className="block text-xs font-semibold text-[#252525] mb-2">
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
                          ? 'bg-[#252525] text-white border-[#252525]'
                          : 'bg-[#EDEDEB] text-[#252525] border-transparent hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization: Add-ons */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#252525] mb-2">
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
                            ? 'bg-[#EDEDEB] border-[#252525] text-[#252525] font-semibold'
                            : 'bg-white border-[#E5E7EB] text-[#737373] hover:bg-[#F5F5F3]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-[#252525] border-[#252525] text-white' : 'border-[#E5E7EB]'
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
              <div className="flex items-center gap-2 bg-[#EDEDEB] p-1 rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-[#252525] hover:bg-[#252525] hover:text-white transition-colors flex items-center justify-center font-bold"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-[#252525]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-[#252525] hover:bg-[#252525] hover:text-white transition-colors flex items-center justify-center font-bold"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Add button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-[#737373] uppercase block">Item Total</span>
                  <span className="text-xl font-bold text-[#252525]">
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
