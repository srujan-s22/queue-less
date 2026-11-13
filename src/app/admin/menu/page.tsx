'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { menuService } from '@/services/menuService';
import { MenuItem, Category, DietaryType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DietaryBadge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';

export default function AdminMenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>(() => menuService.getAll());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('70');
  const [category, setCategory] = useState<Category>('breakfast');
  const [dietary, setDietary] = useState<DietaryType>('veg');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('8');
  const [imageUrl, setImageUrl] = useState('');

  const { showToast } = useToast();

  const loadItems = () => {
    setItems(menuService.getAll());
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('80');
    setCategory('meals');
    setDietary('veg');
    setPrepTimeMinutes('10');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategory(item.category);
    setDietary(item.dietary);
    setPrepTimeMinutes(String(item.prepTimeMinutes));
    setImageUrl(item.imageUrl);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    menuService.saveItem({
      id: editingItem ? editingItem.id : undefined,
      name,
      description,
      price: Number(price),
      category,
      dietary,
      prepTimeMinutes: Number(prepTimeMinutes),
      imageUrl: imageUrl || undefined,
      isAvailable: editingItem ? editingItem.isAvailable : true,
    });

    loadItems();
    setIsModalOpen(false);
    showToast({
      type: 'success',
      title: editingItem ? 'Dish Updated' : 'New Dish Added',
      message: `${name} has been updated in the campus catalog.`,
    });
  };

  const handleDelete = (id: string) => {
    menuService.deleteItem(id);
    loadItems();
    setDeletingId(null);
    showToast({
      type: 'info',
      title: 'Dish Deleted',
      message: 'Item removed from canteen catalog.',
    });
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
              Canteen Menu Catalog ({items.length} dishes)
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Add new meals, adjust pricing, manage categories, and configure dietary tags.
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Dish
          </Button>
        </div>

        {/* Search & Categories Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F5F3] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#252525] text-[#252525]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['all', 'breakfast', 'meals', 'quick-bites', 'beverages', 'desserts'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#252525] text-white shadow-2xs'
                    : 'bg-[#EDEDEB] text-[#737373] hover:bg-[#E5E7EB]'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDEDEB] border-b border-[#E5E7EB] text-[#737373] uppercase font-semibold">
                <tr>
                  <th className="p-3.5 pl-5">Dish</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Prep Time</th>
                  <th className="p-3.5">Dietary</th>
                  <th className="p-3.5">Availability</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
                          <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 capitalize text-gray-700 font-medium">
                      {item.category.replace('-', ' ')}
                    </td>

                    <td className="p-3.5 font-bold text-gray-900">
                      ₹{item.price}
                    </td>

                    <td className="p-3.5 text-gray-600 font-medium">
                      {item.prepTimeMinutes} mins
                    </td>

                    <td className="p-3.5">
                      <DietaryBadge dietary={item.dietary} />
                    </td>

                    <td className="p-3.5">
                      {item.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <Check className="w-3 h-3 text-emerald-600" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-semibold">
                          <X className="w-3 h-3 text-red-600" />
                          Sold Out
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingItem ? `Edit: ${editingItem.name}` : 'Add New Campus Dish'}
            description="Configure menu specifications, category, prep time and price in INR."
          >
            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Dish Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Masala Dosa, Paneer Kathi Roll"
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients and culinary notes..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252525] mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252525] mb-1">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252525] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="meals">Lunch & Meals</option>
                    <option value="quick-bites">Quick Bites</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#252525] mb-1">
                    Dietary Classification
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value as DietaryType)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252525] mb-1">
                  Food Photography URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs focus:outline-none focus:border-[#252525] text-[#252525]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingItem ? 'Save Changes' : 'Publish Dish to Menu'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <Modal
            isOpen={!!deletingId}
            onClose={() => setDeletingId(null)}
            title="Delete this food item?"
            description="This will remove the dish from the student menu. Existing orders containing this item will be retained."
          >
            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setDeletingId(null)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deletingId)}
                variant="danger"
                size="sm"
              >
                Confirm Delete
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
