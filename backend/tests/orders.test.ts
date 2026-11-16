import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { Order, PickupSlot, MenuItem, OrderStatusHistory, User } from '../src/models';

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

  describe('Checkout Dish Validation, Pricing Integrity & Mock ID Resolution', () => {
    let cleanUpOrderIds: string[] = [];

    afterEach(async () => {
      for (const id of cleanUpOrderIds) {
        await Order.findByIdAndDelete(id);
        await OrderStatusHistory.deleteMany({ orderId: id });
      }
      cleanUpOrderIds = [];
    });

    it('1. should successfully place an order with valid MongoDB ObjectIds', async () => {
      const dosa = await MenuItem.findOne({ name: 'Crispy Masala Dosa' });
      const wrap = await MenuItem.findOne({ name: 'Paneer Tikka Kathi Wrap' });

      expect(dosa).toBeDefined();
      expect(wrap).toBeDefined();

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [
            { menuItemId: dosa!._id.toString(), quantity: 1 },
            { menuItemId: wrap!._id.toString(), quantity: 1 },
          ],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      cleanUpOrderIds.push(res.body.data._id);

      const expectedSubtotal = dosa!.price + wrap!.price; // 70 + 110 = 180
      const expectedPackaging = 10;
      const expectedTax = Math.round((expectedSubtotal * 5) / 100); // 9
      const expectedTotal = expectedSubtotal + expectedPackaging + expectedTax; // 199

      expect(res.body.data.subtotal).toBe(expectedSubtotal);
      expect(res.body.data.packagingFee).toBe(expectedPackaging);
      expect(res.body.data.tax).toBe(expectedTax);
      expect(res.body.data.total).toBe(expectedTotal);
      expect(res.body.data.items).toHaveLength(2);
    });

    it('2. should successfully resolve legacy mock IDs menu_04 and menu_07 matching production scenario', async () => {
      // Replicates exact user scenario:
      // Punjabi Chole Bhature (menu_04, ₹90) + Authentic South Indian Filter Coffee (menu_07, ₹25)
      // Subtotal ₹115 + Packaging ₹10 + GST (5%) ₹6 = Total ₹131
      await User.findOneAndUpdate(
        { email: 'aarav.sharma@campus.edu' },
        { $set: { walletBalance: 1000 } }
      );

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [
            { menuItemId: 'menu_04', quantity: 1 },
            { menuItemId: 'menu_07', quantity: 1 },
          ],
          paymentMethod: 'campus_wallet',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const order = res.body.data;
      cleanUpOrderIds.push(order._id);

      // Verify exact matching production totals
      expect(order.subtotal).toBe(115);
      expect(order.packagingFee).toBe(10);
      expect(order.tax).toBe(6);
      expect(order.total).toBe(131);
      expect(order.paymentMethod).toBe('campus_wallet');
      expect(order.paymentStatus).toBe('collected');

      // Verify item snapshots resolve to canonical names and valid ObjectIds
      expect(order.items).toHaveLength(2);
      expect(order.items[0].name).toBe('Punjabi Chole Bhature');
      expect(order.items[0].unitPrice).toBe(90);
      expect(order.items[0].menuItemId).not.toBe('menu_04');
      expect(order.items[0].menuItemId).toMatch(/^[0-9a-fA-F]{24}$/);

      expect(order.items[1].name).toBe('Authentic South Indian Filter Coffee');
      expect(order.items[1].unitPrice).toBe(25);
      expect(order.items[1].menuItemId).not.toBe('menu_07');
      expect(order.items[1].menuItemId).toMatch(/^[0-9a-fA-F]{24}$/);
    });

    it('3. should reject checkout with nonexistent menu ID with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: 'nonexistent_dish_123', quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Dish 'nonexistent_dish_123' does not exist or has been removed.");
    });

    it('4. should reject checkout with unavailable dish (Item 86 / isAvailable: false) with 409 Conflict', async () => {
      const unavailableDish = await MenuItem.findOne({ name: 'Veg Hakka Noodles Bowl' });
      expect(unavailableDish).toBeDefined();
      expect(unavailableDish!.isAvailable).toBe(false);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: unavailableDish!._id.toString(), quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("is currently sold out (Item 86)");
    });

    it('5. should strictly enforce server-controlled price calculation', async () => {
      const dosa = await MenuItem.findOne({ name: 'Crispy Masala Dosa' });
      expect(dosa).toBeDefined();

      // Client attempts to pass a quantity of 2 for ₹70 item = server price ₹140
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: dosa!._id.toString(), quantity: 2 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(201);
      cleanUpOrderIds.push(res.body.data._id);

      // Server enforces 70 * 2 = 140 regardless of any client inputs
      expect(res.body.data.items[0].unitPrice).toBe(70);
      expect(res.body.data.subtotal).toBe(140);
    });

    it('6. should correctly compute GST (5%) and packaging fee (₹10)', async () => {
      const sandwich = await MenuItem.findOne({ name: 'Artisan Grilled Veggie & Cheese Sandwich' });
      expect(sandwich).toBeDefined(); // price: 65

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: sandwich!._id.toString(), quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(201);
      cleanUpOrderIds.push(res.body.data._id);

      const subtotal = 65;
      const packagingFee = 10;
      const tax = Math.round((65 * 5) / 100); // 3.25 rounded to 3
      const total = subtotal + packagingFee + tax; // 65 + 10 + 3 = 78

      expect(res.body.data.subtotal).toBe(subtotal);
      expect(res.body.data.packagingFee).toBe(packagingFee);
      expect(res.body.data.tax).toBe(tax);
      expect(res.body.data.total).toBe(total);
    });

    it('7. should ensure student wallet balance remains untouched when validation or checkout fails', async () => {
      await User.findOneAndUpdate(
        { email: 'aarav.sharma@campus.edu' },
        { $set: { walletBalance: 750 } }
      );

      const userBefore = await User.findOne({ email: 'aarav.sharma@campus.edu' });
      expect(userBefore!.walletBalance).toBe(750);

      // Attempt order with invalid dish
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: 'nonexistent_dish_999', quantity: 1 }],
          paymentMethod: 'campus_wallet',
        });

      expect(res.status).toBe(400);

      // Verify wallet balance is completely untouched
      const userAfter = await User.findOne({ email: 'aarav.sharma@campus.edu' });
      expect(userAfter!.walletBalance).toBe(750);
    });

    it('8. should successfully deduct student wallet balance when order succeeds with campus_wallet', async () => {
      await User.findOneAndUpdate(
        { email: 'aarav.sharma@campus.edu' },
        { $set: { walletBalance: 500 } }
      );

      const coffee = await MenuItem.findOne({ name: 'Authentic South Indian Filter Coffee' });
      expect(coffee).toBeDefined(); // price: 25

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: coffee!._id.toString(), quantity: 1 }],
          paymentMethod: 'campus_wallet',
        });

      expect(res.status).toBe(201);
      cleanUpOrderIds.push(res.body.data._id);

      const total = res.body.data.total; // 25 + 10 (packaging) + 1 (tax) = 36
      const userAfter = await User.findOne({ email: 'aarav.sharma@campus.edu' });
      expect(userAfter!.walletBalance).toBe(500 - total);
    });

    it('9. should atomically rollback slot reservation when order fails validation or creation', async () => {
      const slotBefore = await PickupSlot.findById(testSlotId);
      const countBefore = slotBefore!.reservedCount;

      // Send invalid item order
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [{ menuItemId: 'nonexistent_dish_xyz', quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(400);

      // Verify slot reserved count was rolled back and is unchanged
      const slotAfter = await PickupSlot.findById(testSlotId);
      expect(slotAfter!.reservedCount).toBe(countBefore);
    });

    it('10. should correctly resolve multiple items with mixed valid ObjectIds and mock IDs in one order', async () => {
      const dosa = await MenuItem.findOne({ name: 'Crispy Masala Dosa' });
      expect(dosa).toBeDefined(); // price 70

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: testSlotId,
          items: [
            { menuItemId: dosa!._id.toString(), quantity: 1 }, // ObjectId: ₹70
            { menuItemId: 'menu_04', quantity: 1 },             // Mock ID (Punjabi Chole Bhature): ₹90
          ],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(201);
      cleanUpOrderIds.push(res.body.data._id);

      const expectedSubtotal = 70 + 90; // 160
      const expectedPackaging = 10;
      const expectedTax = Math.round((160 * 5) / 100); // 8
      const expectedTotal = 160 + 10 + 8; // 178

      expect(res.body.data.subtotal).toBe(expectedSubtotal);
      expect(res.body.data.packagingFee).toBe(expectedPackaging);
      expect(res.body.data.tax).toBe(expectedTax);
      expect(res.body.data.total).toBe(expectedTotal);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.items[0].name).toBe('Crispy Masala Dosa');
      expect(res.body.data.items[1].name).toBe('Punjabi Chole Bhature');
    });
  });
});
