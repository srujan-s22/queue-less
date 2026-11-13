import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { logger } from '../config/logger';
import {
  User,
  MenuItem,
  PickupSlot,
  Counter,
  CanteenSettings,
} from '../models';
import { getISTMidnightUTC } from '../utils/timezone';

export const seedDatabase = async () => {
  try {
    logger.info('Starting QueueLess database seed process...');
    await connectDatabase();

    // 1. Canteen Settings
    logger.info('Seeding Canteen Global Settings...');
    await CanteenSettings.findOneAndUpdate(
      { singletonKey: 'CANTEEN_GLOBAL_SETTINGS' },
      {
        singletonKey: 'CANTEEN_GLOBAL_SETTINGS',
        isOpen: true,
        operatingHours: {
          openTime: '08:00 AM',
          closeTime: '07:00 PM',
        },
        announcement: 'Fresh lunch specials served hot between 12:30 PM and 2:00 PM. Order ahead!',
        slotIntervalMinutes: 15,
        defaultSlotCapacity: 30,
        packagingCharge: 10,
        taxRatePercent: 5,
        gracePeriodMinutes: 10,
        lateFeeAmount: 20,
        isLateFeeEnabled: true,
      },
      { upsert: true, new: true }
    );

    // 2. Default Users
    logger.info('Seeding Default Users (Student, Staff, Admin)...');
    const studentPasswordHash = await bcrypt.hash('student123', 10);
    const staffPasswordHash = await bcrypt.hash('staff123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    const usersData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@campus.edu',
        passwordHash: studentPasswordHash,
        role: 'student',
        studentId: '2024CS1042',
        department: 'Computer Science & Engg.',
        phone: '+91 98765 43210',
        walletBalance: 500,
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
      {
        name: 'Ramesh Patel',
        email: 'ramesh.canteen@campus.edu',
        passwordHash: staffPasswordHash,
        role: 'staff',
        department: 'Central Canteen Operations',
        phone: '+91 98111 22334',
        walletBalance: 0,
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      },
      {
        name: 'Dr. Ananya Iyer',
        email: 'ananya.iyer@campus.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        department: 'Dean of Student Affairs & Amenities',
        phone: '+91 98450 12345',
        walletBalance: 1200,
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      },
    ];

    for (const u of usersData) {
      await User.findOneAndUpdate(
        { email: u.email },
        { ...u },
        { upsert: true, new: true }
      );
    }

    // 3. Counters
    logger.info('Seeding Service Counters...');
    const countersData = [
      {
        counterIdentifier: 'COUNTER-01',
        name: 'Express South Indian & Breakfast Counter',
        assignedCategories: ['breakfast', 'beverages'],
        isOnline: true,
      },
      {
        counterIdentifier: 'COUNTER-02',
        name: 'Meals & Special Combos Counter',
        assignedCategories: ['meals'],
        isOnline: true,
      },
      {
        counterIdentifier: 'COUNTER-03',
        name: 'Quick Bites & Cold Beverages Counter',
        assignedCategories: ['quick-bites', 'beverages', 'desserts'],
        isOnline: true,
      },
    ];

    for (const c of countersData) {
      await Counter.findOneAndUpdate(
        { counterIdentifier: c.counterIdentifier },
        { ...c },
        { upsert: true, new: true }
      );
    }

    // 4. Menu Items
    logger.info('Seeding Menu Catalog...');
    const menuData = [
      {
        name: 'Crispy Masala Dosa',
        description: 'Golden fermented rice-lentil crepe stuffed with spiced potato mash, served with coconut chutney and piping hot sambar.',
        price: 70,
        category: 'breakfast',
        dietary: 'veg',
        prepTimeMinutes: 8,
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviewCount: 342,
        isAvailable: true,
        isSpecial: true,
        calories: 320,
        allergens: ['Mustard', 'Gluten-free'],
        addons: [
          { name: 'Extra Gunpowder Podi Butter', price: 15 },
          { name: 'Extra Coconut Chutney Cup', price: 10 },
        ],
      },
      {
        name: 'Paneer Tikka Kathi Wrap',
        description: 'Chargrilled cottage cheese cubes tossed with bell peppers, minted yoghurt emulsion and fresh onions rolled in a soft paratha.',
        price: 110,
        category: 'quick-bites',
        dietary: 'veg',
        prepTimeMinutes: 10,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        reviewCount: 289,
        isAvailable: true,
        isSpecial: true,
        calories: 420,
        allergens: ['Dairy', 'Gluten'],
        addons: [
          { name: 'Double Cheese Slice', price: 20 },
          { name: 'Extra Mint Mayo Dip', price: 15 },
        ],
      },
      {
        name: 'Hyderabadi Dum Biryani (Chicken)',
        description: 'Fragrant basmati rice layered with tender marinated chicken, saffron, mint and slow-cooked in traditional dum style. Accompanied by mirchi ka salan and onion raita.',
        price: 160,
        category: 'meals',
        dietary: 'non-veg',
        prepTimeMinutes: 12,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        reviewCount: 512,
        isAvailable: true,
        isSpecial: true,
        calories: 650,
        allergens: ['Dairy'],
        addons: [
          { name: 'Extra Salan Gravy Cup', price: 20 },
          { name: 'Boiled Egg (1 pc)', price: 15 },
        ],
      },
      {
        name: 'Punjabi Chole Bhature',
        description: 'Spiced chickpeas cooked in a rich onion-tomato gravy with amchur, served with two fluffy deep-fried bhaturas and pickled carrots.',
        price: 90,
        category: 'meals',
        dietary: 'veg',
        prepTimeMinutes: 10,
        imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        reviewCount: 215,
        isAvailable: true,
        isSpecial: false,
        calories: 580,
        allergens: ['Gluten'],
        addons: [
          { name: 'Extra Bhatura (1 pc)', price: 25 },
          { name: 'Fried Green Chili & Pickle Bowl', price: 10 },
        ],
      },
      {
        name: 'Artisan Grilled Veggie & Cheese Sandwich',
        description: 'Triple-decker whole wheat bread layered with English cucumber, tomatoes, house herb butter, and melted processed cheese.',
        price: 65,
        category: 'quick-bites',
        dietary: 'veg',
        prepTimeMinutes: 6,
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
        rating: 4.4,
        reviewCount: 168,
        isAvailable: true,
        isSpecial: false,
        calories: 310,
        allergens: ['Dairy', 'Gluten'],
        addons: [
          { name: 'Extra Cheddar Cheese Slice', price: 15 },
        ],
      },
      {
        name: 'Samosa Chaat Delicacy',
        description: 'Crushed crispy potato samosas drenched with ragda chickpeas, sweet tamarind chutney, spicy green chili relish and sev garnish.',
        price: 50,
        category: 'quick-bites',
        dietary: 'veg',
        prepTimeMinutes: 5,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        reviewCount: 380,
        isAvailable: true,
        isSpecial: false,
        calories: 360,
        allergens: ['Gluten'],
        addons: [
          { name: 'Extra Sev & Sweet Chutney', price: 10 },
        ],
      },
      {
        name: 'Authentic South Indian Filter Coffee',
        description: 'Traditional decoction brewed from chicory blend coffee beans, frothed with boiled whole milk in a stainless steel dabara set.',
        price: 25,
        category: 'beverages',
        dietary: 'veg',
        prepTimeMinutes: 3,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        reviewCount: 620,
        isAvailable: true,
        isSpecial: false,
        calories: 95,
        allergens: ['Dairy'],
        addons: [
          { name: 'Strong Decoction Shot', price: 10 },
        ],
      },
      {
        name: 'Chilled Alphonso Mango Lassi',
        description: 'Thick, creamy churned curd blended with seasonal Ratnagiri Alphonso mango pulp and cardamom dust.',
        price: 45,
        category: 'beverages',
        dietary: 'veg',
        prepTimeMinutes: 4,
        imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviewCount: 290,
        isAvailable: true,
        isSpecial: true,
        calories: 210,
        allergens: ['Dairy'],
        addons: [
          { name: 'Almond & Pistachio Slivers', price: 15 },
        ],
      },
      {
        name: 'Fresh Nimbu Masala Soda',
        description: 'Freshly squeezed key lime infused with rock salt, roasted cumin powder, mint leaves and bubbly soda water.',
        price: 30,
        category: 'beverages',
        dietary: 'vegan',
        prepTimeMinutes: 3,
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        reviewCount: 145,
        isAvailable: true,
        isSpecial: false,
        calories: 45,
        allergens: [],
        addons: [],
      },
      {
        name: 'Classic Gulab Jamun (2 pcs)',
        description: 'Deep golden milk-solid dumplings soaked in rosewater and saffron cardamom sugar syrup. Served warm.',
        price: 40,
        category: 'desserts',
        dietary: 'veg',
        prepTimeMinutes: 3,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        reviewCount: 180,
        isAvailable: true,
        isSpecial: false,
        calories: 280,
        allergens: ['Dairy', 'Gluten'],
        addons: [
          { name: 'Vanilla Ice Cream Scoop', price: 25 },
        ],
      },
      {
        name: 'Steamed Idli & Vada Combo',
        description: 'Two fluffy steamed rice cakes with one crispy medu vada, served with sambar and two styles of chutneys.',
        price: 55,
        category: 'breakfast',
        dietary: 'vegan',
        prepTimeMinutes: 5,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        reviewCount: 195,
        isAvailable: true,
        isSpecial: false,
        calories: 240,
        allergens: [],
        addons: [
          { name: 'Extra Medu Vada (1 pc)', price: 20 },
        ],
      },
      {
        name: 'Veg Hakka Noodles Bowl',
        description: 'Wok-tossed thin noodles with crunchy julienned cabbage, carrots, scallions and light soy dressing.',
        price: 85,
        category: 'meals',
        dietary: 'vegan',
        prepTimeMinutes: 9,
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
        rating: 4.3,
        reviewCount: 110,
        isAvailable: false, // Intentionally unavailable (Item 86 demonstration)
        isSpecial: false,
        calories: 390,
        allergens: ['Gluten', 'Soy'],
        addons: [
          { name: 'Extra Schezwan Sauce Dip', price: 15 },
        ],
      },
    ];

    for (const item of menuData) {
      await MenuItem.findOneAndUpdate(
        { name: item.name },
        { ...item, isArchived: false },
        { upsert: true, new: true }
      );
    }

    // 5. Pickup Slots for today
    logger.info("Seeding Today's Pickup Slots...");
    const todayMidnight = getISTMidnightUTC();

    const slotsData = [
      {
        slotCode: 'SLOT-1230-1245',
        startTime: '12:30 PM',
        endTime: '12:45 PM',
        label: '12:30 PM – 12:45 PM',
        maxCapacity: 30,
        reservedCount: 0,
        isActive: true,
        date: todayMidnight,
      },
      {
        slotCode: 'SLOT-1245-1300',
        startTime: '12:45 PM',
        endTime: '01:00 PM',
        label: '12:45 PM – 01:00 PM',
        maxCapacity: 30,
        reservedCount: 0,
        isActive: true,
        date: todayMidnight,
      },
      {
        slotCode: 'SLOT-1300-1315',
        startTime: '01:00 PM',
        endTime: '01:15 PM',
        label: '01:00 PM – 01:15 PM',
        maxCapacity: 30,
        reservedCount: 0,
        isActive: true,
        date: todayMidnight,
      },
      {
        slotCode: 'SLOT-1315-1330',
        startTime: '01:15 PM',
        endTime: '01:30 PM',
        label: '01:15 PM – 01:30 PM',
        maxCapacity: 30,
        reservedCount: 0,
        isActive: true,
        date: todayMidnight,
      },
      {
        slotCode: 'SLOT-1330-1345',
        startTime: '01:30 PM',
        endTime: '01:45 PM',
        label: '01:30 PM – 01:45 PM',
        maxCapacity: 30,
        reservedCount: 0,
        isActive: true,
        date: todayMidnight,
      },
      {
        slotCode: 'SLOT-1345-1400',
        startTime: '01:45 PM',
        endTime: '02:00 PM',
        label: '01:45 PM – 02:00 PM',
        maxCapacity: 30,
        reservedCount: 0,
        isActive: true,
        date: todayMidnight,
      },
    ];

    for (const slot of slotsData) {
      await PickupSlot.findOneAndUpdate(
        { date: slot.date, slotCode: slot.slotCode },
        { ...slot },
        { upsert: true, new: true }
      );
    }

    logger.info('QueueLess Database Seed Completed Successfully!');
  } catch (error) {
    logger.error('Error during database seed', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed process exited cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed process terminated with failure', err);
      process.exit(1);
    });
}
