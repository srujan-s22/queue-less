'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/types';
import { DietaryBadge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { Clock, Plus, Minus, Star, Flame } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { items, addItem, updateQuantity } = useCart();

  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.isAvailable) return;
    addItem(item, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(item.id, currentQty - 1);
  };

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden transition-all duration-200 hover:shadow-xs hover:border-[#252525]/30 ${
        !item.isAvailable ? 'opacity-70 grayscale-[25%]' : ''
      }`}
    >
      {/* Image container */}
      <Link href={`/student/menu/${item.id}`} className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 block">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Dietary and Special Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <DietaryBadge dietary={item.dietary} />
          {item.isSpecial && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#252525] text-white text-[10px] font-medium tracking-wide uppercase shadow-2xs">
              <Flame className="w-3 h-3 text-[#F59E0B]" />
              Popular
            </span>
          )}
        </div>

        {/* Prep Time pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/80 text-white text-[11px] font-medium">
            <Clock className="w-3 h-3 text-white/80" />
            {item.prepTimeMinutes}m prep
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20">
            <span className="px-3 py-1 rounded-full bg-red-600 text-xs font-bold uppercase tracking-wider shadow">
              Sold Out
            </span>
            <span className="text-[11px] text-white/80 mt-1">Available in next batch</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/student/menu/${item.id}`} className="block">
            <h3 className="font-semibold text-sm sm:text-base text-[#252525] transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>
          {item.rating && (
            <div className="flex items-center gap-1 text-xs font-semibold text-[#252525] bg-[#EDEDEB] px-1.5 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="mt-1 text-xs text-[#737373] line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Bottom row: Price and CTA */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#737373] font-medium block">Price</span>
            <span className="text-base sm:text-lg font-bold text-[#252525]">
              ₹{item.price}
            </span>
          </div>

          <div>
            {currentQty > 0 ? (
              <div className="flex items-center gap-2 bg-[#EDEDEB] border border-[#E5E7EB] rounded-xl p-1">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-lg bg-white text-[#252525] shadow-2xs hover:bg-[#252525] hover:text-white transition-colors flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-[#252525]">
                  {currentQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-lg bg-[#252525] text-white hover:bg-[#171717] transition-colors flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!item.isAvailable}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#252525] text-white hover:bg-[#171717] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
