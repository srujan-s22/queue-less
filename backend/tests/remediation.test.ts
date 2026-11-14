import request from 'supertest';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { createApp } from '../src/app';
import { initSocket } from '../src/socket';
import { setupTestDb } from './setup';
import { Order, MenuItem, PickupSlot, User } from '../src/models';

setupTestDb();

const app = createApp();

describe('Phase 3.1 Audit Remediation Regression Tests', () => {
  let studentAToken = '';
  let studentBToken = '';
  let staffToken = '';
  let adminToken = '';
  let studentAId = '';
  let studentBId = '';
  let testOrderId = '';
  let testOrderNumber = '';

  let httpServer: any;
  let serverPort = 0;

  beforeAll(async () => {
    // 1. Start test HTTP server with socket
    httpServer = createServer(app);
    initSocket(httpServer);
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        serverPort = httpServer.address().port;
        resolve();
      });
    });

    // 2. Authenticate Student A (Aarav)
    const studentARes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav.sharma@campus.edu', password: 'student123' });
    studentAToken = studentARes.body.data.token;
    studentAId = studentARes.body.data.user.id;

    // 3. Create & Authenticate Student B
    const studentBEmail = `student.b.${Date.now()}@campus.edu`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Student B',
        email: studentBEmail,
        password: 'password123',
        studentId: `2024TEST${Date.now().toString().slice(-4)}`,
        department: 'Electronics',
        phone: '+91 91234 56789',
      });
    studentBToken = regRes.body.data.token;
    studentBId = regRes.body.data.user.id;

    // 4. Authenticate Staff (Ramesh)
    const staffRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.canteen@campus.edu', password: 'staff123' });
    staffToken = staffRes.body.data.token;

    // 5. Authenticate Admin (Ananya)
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ananya.iyer@campus.edu', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    // 6. Create a test order owned by Student A
    const item = await MenuItem.findOne({ isAvailable: true, isArchived: false });
    const slot = await PickupSlot.findOne({ isActive: true });

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        pickupSlotId: slot!._id.toString(),
        paymentMethod: 'counter_cash',
        items: [{ menuItemId: item!._id.toString(), quantity: 1 }],
      });

    testOrderId = orderRes.body.data._id;
    testOrderNumber = orderRes.body.data.orderNumber;
  });

  afterAll(async () => {
    if (httpServer) {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
  });

  // ==========================================
  // FINDING 1: SOCK-AUTH-01 (Socket.IO Authorization)
  // ==========================================
  describe('SOCK-AUTH-01: Socket Order Room Authorization', () => {
    it('should allow Student A to join their own order room via MongoDB ObjectId', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        auth: { token: studentAToken },
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', testOrderId, (response: any) => {
          expect(response.success).toBe(true);
          expect(response.orderId).toBe(testOrderId);
          client.disconnect();
          done();
        });
      });
    });

    it('should allow Student A to join their own order room via human-readable orderNumber', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        auth: { token: studentAToken },
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', testOrderNumber, (response: any) => {
          expect(response.success).toBe(true);
          expect(response.orderNumber).toBe(testOrderNumber);
          client.disconnect();
          done();
        });
      });
    });

    it('should forbid Student B from joining Student A\'s order room', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        auth: { token: studentBToken },
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', testOrderId, (response: any) => {
          expect(response.success).toBe(false);
          expect(response.error).toContain('Forbidden');
          client.disconnect();
          done();
        });
      });
    });

    it('should reject unauthenticated socket from joining any order room', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', testOrderId, (response: any) => {
          expect(response.success).toBe(false);
          expect(response.error).toContain('Authentication required');
          client.disconnect();
          done();
        });
      });
    });

    it('should allow Staff to join any order room for operational tracking', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        auth: { token: staffToken },
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', testOrderId, (response: any) => {
          expect(response.success).toBe(true);
          client.disconnect();
          done();
        });
      });
    });

    it('should allow Admin to join any order room', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        auth: { token: adminToken },
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', testOrderId, (response: any) => {
          expect(response.success).toBe(true);
          client.disconnect();
          done();
        });
      });
    });

    it('should reject joining a non-existent order with not_found', (done) => {
      const client = Client(`http://localhost:${serverPort}`, {
        auth: { token: staffToken },
        transports: ['websocket'],
      });

      client.on('connect', () => {
        client.emit('join:order', '507f1f77bcf86cd799439011', (response: any) => {
          expect(response.success).toBe(false);
          expect(response.error).toBe('Order not found');
          client.disconnect();
          done();
        });
      });
    });
  });

  // ==========================================
  // FINDING 2: API-ID-MISMATCH-01 (Order Identifier Mapping)
  // ==========================================
  describe('API-ID-MISMATCH-01: Order Identifier Mapping & Multi-Format Lookups', () => {
    it('should retrieve order details using MongoDB ObjectId', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testOrderId);
      expect(res.body.data.orderNumber).toBe(testOrderNumber);
    });

    it('should retrieve order details using human-readable orderNumber (e.g. QL-1011-XX)', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrderNumber}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBe(testOrderNumber);
      expect(res.body.data._id).toBe(testOrderId);
    });

    it('should update order status using orderNumber as identifier', async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${testOrderNumber}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
    });

    it('should update order status using MongoDB ObjectId as identifier', async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'PREPARING' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PREPARING');
    });
  });

  // ==========================================
  // FINDING 5: UI-MOCK-01 (Admin Staff Roster)
  // ==========================================
  describe('UI-MOCK-01: Admin Persistent Staff Roster Management', () => {
    it('should allow admin to list all staff accounts from database', async () => {
      const res = await request(app)
        .get('/api/v1/admin/staff')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const ramesh = res.body.data.find((s: any) => s.email === 'ramesh.canteen@campus.edu');
      expect(ramesh).toBeDefined();
      expect(ramesh.role).toBe('Kitchen Operator');
    });

    it('should forbid non-admin users from accessing staff roster', async () => {
      const res = await request(app)
        .get('/api/v1/admin/staff')
        .set('Authorization', `Bearer ${studentAToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to create a new staff account', async () => {
      const newStaffEmail = `staff.${Date.now()}@campus.edu`;
      const res = await request(app)
        .post('/api/v1/admin/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Sunita Rao',
          email: newStaffEmail,
          password: 'staffpassword123',
          department: 'Express Counter #2 Line Cook',
          phone: '+91 97777 88888',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(newStaffEmail);

      // Verify role is locked to staff in DB
      const createdInDb = await User.findOne({ email: newStaffEmail });
      expect(createdInDb).toBeDefined();
      expect(createdInDb!.role).toBe('staff');
    });

    it('should allow admin to toggle staff member status', async () => {
      const staffUser = await User.findOne({ role: 'staff' });
      const res = await request(app)
        .patch(`/api/v1/admin/staff/${staffUser!._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('On Break');

      // Toggle back to active
      const restoreRes = await request(app)
        .patch(`/api/v1/admin/staff/${staffUser!._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.status).toBe('Active');
    });
  });

  // ==========================================
  // FINDING 6: UI-MOCK-02 (Item 86 Availability)
  // ==========================================
  describe('UI-MOCK-02: Item 86 Availability Toggle & Catalog Sync', () => {
    it('should toggle dish availability to false (Item 86)', async () => {
      const item = await MenuItem.findOne({ isArchived: false });
      const res = await request(app)
        .patch(`/api/v1/menu/${item!._id}/availability`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAvailable: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isAvailable).toBe(false);

      // Verify in public menu catalog
      const catalogRes = await request(app).get('/api/v1/menu');
      const updatedItem = catalogRes.body.data.find((i: any) => i._id === item!._id.toString());
      expect(updatedItem.isAvailable).toBe(false);

      // Restore availability
      await request(app)
        .patch(`/api/v1/menu/${item!._id}/availability`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAvailable: true });
    });
  });
});
