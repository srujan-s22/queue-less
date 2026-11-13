import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { PickupSlot } from '../src/models';

setupTestDb();

const app = createApp();

describe('Pickup Slot Scheduling & Capacity Endpoints', () => {
  it('should list pickup slots for current date with capacity counts', async () => {
    const res = await request(app).get('/api/v1/slots');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstSlot = res.body.data[0];
    expect(firstSlot).toHaveProperty('slotCode');
    expect(firstSlot).toHaveProperty('maxCapacity');
    expect(firstSlot).toHaveProperty('reservedCount');
  });

  it('should reject slot booking when slot capacity is exhausted', async () => {
    // Create a temporary mock saturated slot
    const saturatedSlot = await PickupSlot.create({
      slotCode: `TEST-FULL-${Date.now()}`,
      startTime: '01:00 PM',
      endTime: '01:15 PM',
      label: '01:00 PM – 01:15 PM (Full)',
      maxCapacity: 5,
      reservedCount: 5, // Fully booked
      isActive: true,
      date: new Date(),
    });

    // Authenticate student
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav.sharma@campus.edu', password: 'student123' });
    const studentToken = studentRes.body.data.token;

    // Fetch an available menu item
    const menuRes = await request(app).get('/api/v1/menu');
    const availableDish = menuRes.body.data.find((d: any) => d.isAvailable);

    // Attempt to book into saturated slot
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        pickupSlotId: saturatedSlot._id.toString(),
        items: [{ menuItemId: availableDish._id, quantity: 1 }],
        paymentMethod: 'counter_cash',
      });

    expect(orderRes.status).toBe(409); // Conflict / Capacity exceeded
    expect(orderRes.body.success).toBe(false);

    // Clean up temporary slot
    await PickupSlot.findByIdAndDelete(saturatedSlot._id);
  });
});
