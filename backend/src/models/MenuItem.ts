import mongoose, { Document, Schema, Model } from 'mongoose';

export type MenuCategory = 'breakfast' | 'meals' | 'quick-bites' | 'beverages' | 'desserts';
export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export interface IMenuAddon {
  name: string;
  price: number;
}

export interface IMenuItem extends Document {
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  dietary: DietaryType;
  prepTimeMinutes: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isSpecial: boolean;
  calories?: number;
  allergens: string[];
  addons: IMenuAddon[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuAddonSchema = new Schema<IMenuAddon>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['breakfast', 'meals', 'quick-bites', 'beverages', 'desserts'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    dietary: {
      type: String,
      required: [true, 'Dietary tag is required'],
      enum: ['veg', 'non-veg', 'vegan'],
      default: 'veg',
      index: true,
    },
    prepTimeMinutes: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [1, 'Prep time must be at least 1 minute'],
      default: 10,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    calories: {
      type: Number,
      min: 0,
    },
    allergens: {
      type: [String],
      default: [],
    },
    addons: {
      type: [MenuAddonSchema],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MenuItemSchema.index({ category: 1, isAvailable: 1, isArchived: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

export const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
