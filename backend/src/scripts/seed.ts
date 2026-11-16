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
import { CANONICAL_MENU_ITEMS } from '../config/menuDefaults';

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
    for (const item of CANONICAL_MENU_ITEMS) {
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
