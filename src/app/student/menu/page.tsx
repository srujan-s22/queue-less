'use client';

import React, { useState, useMemo } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { menuService } from '@/services/menuService';
import { Category, DietaryType } from '@/types';
import { FoodCard } from '@/components/student/FoodCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Filter, Utensils } from 'lucide-react';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'prep-time' | 'rating';

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'meals', label: 'Lunch & Meals' },
  { id: 'quick-bites', label: 'Quick Bites & Wraps' },
  { id: 'beverages', label: 'Beverages & Coffee' },
  { id: 'desserts', label: 'Desserts & Sweets' },
];

export default function StudentMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'prep-time' | 'rating'>('featured');

  const menuItems = menuService.getAll();

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Dietary filter
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'prep-time') return a.prepTimeMinutes - b.prepTimeMinutes;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // featured default order
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery, sortBy]);

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
            Campus Canteen Menu
          </h1>
          <p className="text-sm text-[#737373] mt-1">
            Browse today&apos;s active kitchen catalog, filter by diet, and select items for pre-order.
          </p>
        </div>

        {/* Search, Dietary & Sorting Controls */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dosas, wraps, biryani, filter coffee..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F5F5F3] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#252525] focus:ring-1 focus:ring-[#252525] text-[#252525] placeholder:text-[#737373]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#737373] hover:text-[#252525]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#737373] whitespace-nowrap hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto text-xs px-3 py-2 bg-[#F5F5F3] border border-[#E5E7EB] rounded-xl text-[#252525] focus:outline-none focus:border-[#252525]"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="prep-time">Fastest Prep Time</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB]">
            <span className="text-xs font-semibold text-[#737373] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Diet:
            </span>
            {(['all', 'veg', 'non-veg', 'vegan'] as const).map((diet) => (
              <button
                key={diet}
                onClick={() => setDietaryFilter(diet)}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                  dietaryFilter === diet
                    ? 'bg-[#252525] text-white shadow-2xs'
                    : 'bg-[#EDEDEB] text-[#737373] hover:text-[#252525] hover:bg-[#E5E7EB]'
                }`}
              >
                {diet === 'all'
                  ? 'All Diets'
                  : diet === 'veg'
                  ? 'Pure Veg'
                  : diet === 'non-veg'
                  ? 'Non-Veg'
                  : 'Vegan Only'}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#252525] text-white shadow-2xs'
                    : 'bg-white text-[#737373] border border-[#E5E7EB] hover:border-gray-400 hover:text-[#252525]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs text-[#737373] mb-3">
              <span>Showing {filteredItems.length} dishes</span>
              <span>All prices include kitchen preparation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Utensils className="w-6 h-6" />}
            title="No dishes found"
            description="We couldn't find any dishes matching your active search and dietary filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setDietaryFilter('all');
            }}
          />
        )}
      </div>
    </StudentLayout>
  );
}
