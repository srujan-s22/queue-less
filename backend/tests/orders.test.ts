import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { Order, PickupSlot, MenuItem, OrderStatusHistory } from '../src/models';

setupTestDb();

const app = createApp();

describe('Order Lifecycle & Concurrency Endpoints', () => {
  let studentToken = '';
  let staffToken = '';
  let testSlotId = '';
  let testItemId = '';
  let testItemPrice = 0;
  let createdOrderId = '';

  beforeAll(async () => {
    // Authenticate student
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav.sharma@campus.edu', password: 'student123' });
    studentToken = studentRes.body.data.token;

    // Authenticate staff
    const staffRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.canteen@campus.edu', password: 'staff123' });
    staffToken = staffRes.body.data.token;

    // Get an available pickup slot
    const slotsRes = await request(app).get('/api/v1/slots');
    testSlotId = slotsRes.body.data[0]._id;

    // Get an available menu item
    const menuRes = await request(app).get('/api/v1/menu');
    const availableDish = menuRes.body.data.find((d: any) => d.isAvailable);
    testItemId = availableDish._id;
    testItemPrice = availableDish.price;
  });

  afterAll(async () => {
    // Clean up test order if created
    if (createdOrderId) {
      await Order.findByIdAndDelete(createdOrderId);
      await OrderStatusHistory.deleteMany({ orderId: createdOrderId });
    }
  });

  it('should place a new pre-order and compute exact pricing on the server', async () => {
    const slotBefore = await PickupSlot.findById(testSlotId);
    const countBefore = slotBefore!.reservedCount;

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        pickupSlotId: testSlotId,
        items: [{ menuItemId: testItemId, quantity: 2 }],
        paymentMethod: 'counter_cash',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const order = res.body.data;
    createdOrderId = order._id;

    expect(order.orderNumber).toMatch(/^QL-\d+/);
    expect(order.tokenNumber).toBeDefined();
    expect(order.status).toBe('PLACED');
    expect(order.subtotal).toBe(testItemPrice * 2);
    expect(order.packagingFee).toBe(10);
    expect(order.tax).toBe(Math.round((testItemPrice * 2 * 5) / 100));
    expect(order.total).toBe(order.subtotal + order.packagingFee + order.tax);

    // Verify slot reserved count was atomically incremented
    const slotAfter = await PickupSlot.findById(testSlotId);
    expect(slotAfter!.reservedCount).toBe(countBefore + 1);
  });

  it('should list user orders under /api/v1/orders/my-orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders/my-orders')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((o: any) => o._id === createdOrderId)).toBe(true);
  });

  it('should retrieve individual order tracking details with audit history', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(createdOrderId);
    expect(Array.isArray(res.body.data.history)).toBe(true);
    expect(res.body.data.history.length).toBeGreaterThan(0);
  });

  it('should progress order lifecycle: PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP', async () => {
    // 1. Staff accepts order
    const acceptRes = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'ACCEPTED' });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('ACCEPTED');

    // 2. Staff moves to cooking
    const prepRes = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'PREPARING' });
    expect(prepRes.status).toBe(200);
    expect(prepRes.body.data.status).toBe('PREPARING');

    // 3. Staff marks ready for pickup -> pickupDeadline should be set
    const readyRes = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'READY_FOR_PICKUP' });
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.data.status).toBe('READY_FOR_PICKUP');
    expect(readyRes.body.data.readyAt).toBeDefined();
    expect(readyRes.body.data.pickupDeadline).toBeDefined();
  });

  it('should confirm handover at pickup counter via staff terminal', async () => {
    const res = await request(app)
      .post(`/api/v1/staff/orders/${createdOrderId}/handover`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PICKED_UP');
    expect(res.body.data.paymentStatus).toBe('collected');
    expect(res.body.data.collectedAt).toBeDefined();
  });

  it('should allow student to cancel order when in PLACED status and release slot', async () => {
    const slotBefore = await PickupSlot.findById(testSlotId);
    const countBefore = slotBefore!.reservedCount;

    // Place an order to cancel
    const placeRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        pickupSlotId: testSlotId,
        items: [{ menuItemId: testItemId, quantity: 1 }],
        paymentMethod: 'counter_cash',
      });
    const tempOrderId = placeRes.body.data._id;

    // Student cancels
    const cancelRes = await request(app)
      .post(`/api/v1/orders/${tempOrderId}/cancel`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ reason: 'Class rescheduled' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Verify slot capacity was released
    const slotAfter = await PickupSlot.findById(testSlotId);
    expect(slotAfter!.reservedCount).toBe(countBefore);

    // Clean up
    await Order.findByIdAndDelete(tempOrderId);
    await OrderStatusHistory.deleteMany({ orderId: tempOrderId });
  });
});
