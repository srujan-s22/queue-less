import mongoose from 'mongoose';
import { PickupSlot, IPickupSlot } from '../models';
import { getISTMidnightUTC } from '../utils/timezone';
import { ConflictError, NotFoundError } from '../utils/errors';

export const listPickupSlots = async (targetDate?: string) => {
  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const dateMidnight = getISTMidnightUTC(dateObj);

  let slots = await PickupSlot.find({ date: dateMidnight, isActive: true }).sort({ slotCode: 1 });

  // If no slots exist for the given day, automatically generate default slots for that day
  if (slots.length === 0) {
    slots = (await seedSlotsForDate(dateMidnight)) as any;
  }

  return slots;
};

export const getSlotById = async (id: string) => {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slotCode: id };
  const slot = await PickupSlot.findOne(query);
  if (!slot) {
    throw new NotFoundError('Pickup slot not found.');
  }
  return slot;
};

export const atomicReserveSlot = async (slotId: string): Promise<IPickupSlot> => {
  const query = mongoose.isValidObjectId(slotId) ? { _id: slotId } : { slotCode: slotId };
  const reservedSlot = await PickupSlot.findOneAndUpdate(
    {
      ...query,
      isActive: true,
      $expr: { $lt: ['$reservedCount', '$maxCapacity'] },
    },
    { $inc: { reservedCount: 1 } },
    { new: true }
  );

  if (!reservedSlot) {
    throw new ConflictError(
      'Selected pickup slot is full or unavailable. Please choose another collection slot.'
    );
  }

  return reservedSlot;
};

export const atomicReleaseSlot = async (slotId: string | any): Promise<void> => {
  if (!slotId) return;
  const query = mongoose.isValidObjectId(slotId) ? { _id: slotId } : { slotCode: slotId };
  await PickupSlot.findOneAndUpdate(query, {
    $inc: { reservedCount: -1 },
  });
};

export const seedSlotsForDate = async (dateMidnight: Date): Promise<IPickupSlot[]> => {
  const templates = [
    { slotCode: 'SLOT-1230-1245', startTime: '12:30 PM', endTime: '12:45 PM', label: '12:30 PM – 12:45 PM', maxCapacity: 30 },
    { slotCode: 'SLOT-1245-1300', startTime: '12:45 PM', endTime: '01:00 PM', label: '12:45 PM – 01:00 PM', maxCapacity: 30 },
    { slotCode: 'SLOT-1300-1315', startTime: '01:00 PM', endTime: '01:15 PM', label: '01:00 PM – 01:15 PM', maxCapacity: 30 },
    { slotCode: 'SLOT-1315-1330', startTime: '01:15 PM', endTime: '01:30 PM', label: '01:15 PM – 01:30 PM', maxCapacity: 30 },
    { slotCode: 'SLOT-1330-1345', startTime: '01:30 PM', endTime: '01:45 PM', label: '01:30 PM – 01:45 PM', maxCapacity: 30 },
    { slotCode: 'SLOT-1345-1400', startTime: '01:45 PM', endTime: '02:00 PM', label: '01:45 PM – 02:00 PM', maxCapacity: 30 },
  ];

  const created: IPickupSlot[] = [];
  for (const t of templates) {
    const s = await PickupSlot.findOneAndUpdate(
      { date: dateMidnight, slotCode: t.slotCode },
      { ...t, reservedCount: 0, isActive: true, date: dateMidnight },
      { upsert: true, new: true }
    );
    created.push(s);
  }

  return created;
};
