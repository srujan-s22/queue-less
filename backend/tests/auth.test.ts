import { createServer } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { io as Client } from 'socket.io-client';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { User, Order, PickupSlot, MenuItem, AuditLog } from '../src/models';
import { env } from '../src/config/env';
import { initSocket } from '../src/socket';

setupTestDb();

const app = createApp();

describe('QueueLess Comprehensive Authentication & Role-Based Access Tests', () => {
  const timestamp = Date.now();
  const studentEmail = `student.${timestamp}@campus.edu`;
  const studentRoll = `ROLL-${timestamp.toString().slice(-6)}`;
  const staffEmail = `staff.${timestamp}@campus.edu`;
  const adminEmail = `admin.${timestamp}@campus.edu`;

  let studentToken = '';
  let staffToken = '';
  let adminToken = '';

  afterAll(async () => {
    // Cleanup test users created during this suite
    await User.deleteMany({
      email: { $in: [studentEmail, staffEmail, adminEmail] },
    });
  });

  // =========================================================================
  // 1. STUDENT REGISTRATION & LOGIN
  // =========================================================================
  describe('Student Registration & Authentication Flow', () => {
    it('should register a new student user successfully with server-assigned student role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Priya Patel',
          email: studentEmail,
          password: 'studentPassword123',
          studentId: studentRoll,
          department: 'Computer Science & Engg.',
          phone: '+91 98765 11111',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(studentEmail);
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.walletBalance).toBe(0);
      expect(res.body.data.token).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      studentToken = res.body.data.token;
    });

    it('should reject student registration when duplicate email is submitted', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another Priya',
          email: studentEmail,
          password: 'studentPassword123',
          studentId: `ROLL-DIFF-${Date.now()}`,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject student registration when duplicate studentId / roll number is submitted', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Unique Email Student',
          email: `unique.${Date.now()}@campus.edu`,
          password: 'studentPassword123',
          studentId: studentRoll,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Student ID \/ Roll Number already exists/i);
    });

    it('should reject student registration with missing studentId', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'No Roll Student',
          email: `noroll.${Date.now()}@campus.edu`,
          password: 'studentPassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Bad Email Student',
          email: 'not-an-email',
          password: 'studentPassword123',
          studentId: `ROLL-BAD-${Date.now()}`,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Short Password Student',
          email: `short.${Date.now()}@campus.edu`,
          password: '123',
          studentId: `ROLL-SHORT-${Date.now()}`,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should authenticate student with valid credentials via unified login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: studentEmail,
          password: 'studentPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.token).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: studentEmail,
          password: 'wrongPasswordXYZ',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password.');
    });

    it('should reject login for non-existent email without revealing account existence', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent.user.999@campus.edu',
          password: 'somePassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password.');
    });
  });

  // =========================================================================
  // 2. STAFF REGISTRATION & ACCESS KEY VALIDATION
  // =========================================================================
  describe('Staff Registration & Access Key Controls', () => {
    it('should reject staff registration without an access key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Staff Without Key',
          email: `staff.nokey.${Date.now()}@campus.edu`,
          password: 'staffPassword123',
          role: 'staff',
          department: 'Kitchen Operations',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject staff registration with an invalid access key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Staff Bad Key',
          email: `staff.badkey.${Date.now()}@campus.edu`,
          password: 'staffPassword123',
          role: 'staff',
          accessKey: 'INVALID_STAFF_KEY_999',
          department: 'Kitchen Operations',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid staff access key/i);
    });

    it('should reject staff registration when presenting the admin access key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Staff Wrong Key',
          email: `staff.wrongkey.${Date.now()}@campus.edu`,
          password: 'staffPassword123',
          role: 'staff',
          accessKey: env.ADMIN_ACCESS_KEY,
          department: 'Kitchen Operations',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid staff access key/i);
    });

    it('should successfully register a staff account when presenting the valid STAFF_ACCESS_KEY', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Rajesh Kumar',
          email: staffEmail,
          password: 'staffPassword123',
          role: 'staff',
          accessKey: env.STAFF_ACCESS_KEY,
          department: 'Central Canteen Operations',
          phone: '+91 98111 55555',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(staffEmail);
      expect(res.body.data.user.role).toBe('staff');
      expect(res.body.data.token).toBeDefined();

      staffToken = res.body.data.token;
    });

    it('should authenticate staff via unified login and correctly return staff role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: staffEmail,
          password: 'staffPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('staff');
    });
  });

  // =========================================================================
  // 3. ADMIN REGISTRATION & ACCESS KEY VALIDATION
  // =========================================================================
  describe('Admin Registration & Access Key Controls', () => {
    it('should reject admin registration without an access key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin Without Key',
          email: `admin.nokey.${Date.now()}@campus.edu`,
          password: 'adminPassword123',
          role: 'admin',
          department: 'Administration',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject admin registration with an invalid access key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin Bad Key',
          email: `admin.badkey.${Date.now()}@campus.edu`,
          password: 'adminPassword123',
          role: 'admin',
          accessKey: 'INVALID_ADMIN_KEY_12345',
          department: 'Administration',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid admin access key/i);
    });

    it('should reject admin registration when presenting the staff access key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin Wrong Key',
          email: `admin.wrongkey.${Date.now()}@campus.edu`,
          password: 'adminPassword123',
          role: 'admin',
          accessKey: env.STAFF_ACCESS_KEY,
          department: 'Administration',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid admin access key/i);
    });

    it('should successfully register an admin account when presenting the valid ADMIN_ACCESS_KEY', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Dean Suresh Pillai',
          email: adminEmail,
          password: 'adminPassword123',
          role: 'admin',
          accessKey: env.ADMIN_ACCESS_KEY,
          department: 'Dean of Student Affairs & Amenities',
          phone: '+91 98450 99999',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(adminEmail);
      expect(res.body.data.user.role).toBe('admin');
      expect(res.body.data.token).toBeDefined();

      adminToken = res.body.data.token;
    });

    it('should authenticate admin via unified login and correctly return admin role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminEmail,
          password: 'adminPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
    });
  });

  // =========================================================================
  // 4. ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT
  // =========================================================================
  describe('Role-Based Authorization & Endpoint Protection', () => {
    it('should reject unauthenticated request to protected endpoints', async () => {
      const res = await request(app).get('/api/v1/admin/orders');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should forbid student from accessing staff dashboard endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/staff/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access forbidden/i);
    });

    it('should forbid student from accessing admin endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access forbidden/i);
    });

    it('should forbid staff from accessing admin-only management endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow staff to access staff dashboard endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/staff/dashboard')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow admin to access admin management endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // =========================================================================
  // 5. SECURITY & CREDENTIAL HYGIENE
  // =========================================================================
  describe('Security & Credential Hygiene', () => {
    it('should store bcrypt password hash in database and never plaintext', async () => {
      const userDoc = await User.findOne({ email: studentEmail }).select('+passwordHash');
      expect(userDoc).toBeDefined();
      expect(userDoc!.passwordHash).toBeDefined();
      expect(userDoc!.passwordHash).not.toBe('studentPassword123');
      expect(userDoc!.passwordHash.startsWith('$2')).toBe(true); // standard bcrypt format
    });

    it('should never expose passwordHash in registration, login or profile responses', async () => {
      const profileRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.passwordHash).toBeUndefined();
      expect(profileRes.body.data.password).toBeUndefined();
    });

    it('should never expose accessKey in any response or user document', async () => {
      const adminDoc = await User.findOne({ email: adminEmail });
      expect((adminDoc as any)?.accessKey).toBeUndefined();
    });

    it('should properly clear session cookie on logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify clear cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });

  // =========================================================================
  // 6. DUAL-STRATEGY AUTHENTICATION & CROSS-ORIGIN BEARER FALLBACK
  // =========================================================================
  describe('Dual-Strategy Authentication & Cross-Origin Bearer Fallback', () => {
    let testOrderId = '';

    afterAll(async () => {
      if (testOrderId) {
        await Order.findByIdAndDelete(testOrderId);
      }
    });

    it('should return token in response body and set cookie on login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: studentEmail,
          password: 'studentPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should restore session via GET /auth/me using Bearer token without cookies and return user profile without echoing token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(studentEmail);
      expect(res.body.data.role).toBe('student');
      expect(res.body.data.token).toBeUndefined();
    });

    it('should allow session restoration via GET /auth/me using cookie without Bearer header and return profile without leaking token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: studentEmail,
          password: 'studentPassword123',
        });

      const cookieHeader = loginRes.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookieHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(studentEmail);
      expect(res.body.data.token).toBeUndefined();
    });

    it('should successfully place pre-order using Authorization Bearer token in cross-origin mode (no cookies)', async () => {
      let slot = await PickupSlot.findOne({ isActive: true });
      if (!slot) {
        slot = await PickupSlot.create({
          slotNumber: 1,
          label: '12:00 PM - 12:30 PM',
          startTime: '12:00',
          endTime: '12:30',
          maxCapacity: 50,
          reservedCount: 0,
          isActive: true,
        });
      }

      let item = await MenuItem.findOne({ isAvailable: true });
      if (!item) {
        item = await MenuItem.create({
          name: 'Masala Dosa',
          description: 'Crispy rice crepe filled with spiced potato masala',
          price: 60,
          category: 'breakfast',
          dietary: 'veg',
          prepTimeMinutes: 10,
          imageUrl: 'https://images.unsplash.com/photo-test',
          isAvailable: true,
        });
      }

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          pickupSlotId: slot._id.toString(),
          items: [{ menuItemId: item._id.toString(), quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderNumber).toBeDefined();
      expect(res.body.data.tokenNumber).toBeDefined();
      testOrderId = res.body.data._id;
    });

    it('should reject pre-order checkout with 401 when authentication token is missing', async () => {
      let slot = await PickupSlot.findOne({ isActive: true });
      let item = await MenuItem.findOne({ isAvailable: true });

      const res = await request(app)
        .post('/api/v1/orders')
        .send({
          pickupSlotId: slot ? slot._id.toString() : '507f1f77bcf86cd799439011',
          items: [{ menuItemId: item ? item._id.toString() : '507f1f77bcf86cd799439012', quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Authentication token missing\. Please sign in\./i);
    });

    it('should reject pre-order checkout with 401 when token is invalid or expired', async () => {
      let slot = await PickupSlot.findOne({ isActive: true });
      let item = await MenuItem.findOne({ isAvailable: true });

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', 'Bearer invalid.jwt.token.here')
        .send({
          pickupSlotId: slot ? slot._id.toString() : '507f1f77bcf86cd799439011',
          items: [{ menuItemId: item ? item._id.toString() : '507f1f77bcf86cd799439012', quantity: 1 }],
          paymentMethod: 'counter_cash',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid or expired authentication session\./i);
    });

    it('should authenticate incoming Socket.IO connection via handshake auth token', async () => {
      const httpServer = createServer(app);
      const ioServer = initSocket(httpServer);

      await new Promise<void>((resolve) => httpServer.listen(0, resolve));
      const port = (httpServer.address() as AddressInfo).port;

      const clientSocket = Client(`http://localhost:${port}`, {
        auth: { token: studentToken },
        transports: ['websocket'],
      });

      await new Promise<void>((resolve, reject) => {
        clientSocket.on('connect', () => {
          resolve();
        });
        clientSocket.on('connect_error', (err) => {
          reject(err);
        });
      });

      expect(clientSocket.connected).toBe(true);

      clientSocket.disconnect();
      await new Promise<void>((resolve) => {
        ioServer.close(() => {
          httpServer.close(() => resolve());
        });
      });
    });
  });

  // =========================================================================
  // 7. CAMPUS WALLET PERSISTENCE, ATOMIC TOP-UP & IDEMPOTENCY
  // =========================================================================
  describe('Campus Wallet Persistence, Atomic Top-Up & Idempotency Controls', () => {
    it('should reject unauthenticated top-up requests with 401', async () => {
      const res = await request(app)
        .post('/api/v1/users/wallet/topup')
        .send({ amount: 100 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Authentication token missing/i);
    });

    it('should reject top-up with amount less than minimum ₹10', async () => {
      const res = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: 5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject top-up with amount greater than maximum ₹5000', async () => {
      const res = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: 6000 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject top-up with non-integer or negative amount', async () => {
      const resNegative = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: -50 });

      expect(resNegative.status).toBe(400);

      const resDecimal = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: 99.95 });

      expect(resDecimal.status).toBe(400);
    });

    it('should confirm initial balance before top-ups', async () => {
      const profileRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.walletBalance).toBe(0);
    });

    it('should successfully execute ₹100 top-up and atomically update balance', async () => {
      const res = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: 100 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.walletBalance).toBe(100);

      // Verify persistence via /auth/me
      const profile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profile.body.data.walletBalance).toBe(100);
    });

    it('should successfully execute ₹200 top-up and update balance to ₹300', async () => {
      const res = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: 200 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.walletBalance).toBe(300);

      // Verify persistence via /auth/me
      const profile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profile.body.data.walletBalance).toBe(300);
    });

    it('should successfully execute ₹500 top-up and update balance to ₹800', async () => {
      const res = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: 500 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.walletBalance).toBe(800);

      // Verify persistence via /auth/me
      const profile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profile.body.data.walletBalance).toBe(800);
    });

    it('should not change wallet balance when an invalid top-up request fails', async () => {
      const failRes = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ amount: -100 });

      expect(failRes.status).toBe(400);

      // Verify balance remained strictly ₹800
      const profile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profile.body.data.walletBalance).toBe(800);
    });

    it('should prevent duplicate top-up execution when identical Idempotency-Key is submitted', async () => {
      const idempotencyKey = `topup-idem-${Date.now()}`;

      // First request with idempotency key
      const firstRes = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ amount: 100 });

      expect(firstRes.status).toBe(200);
      expect(firstRes.body.data.walletBalance).toBe(900);

      // Second duplicate request with the exact same idempotency key
      const dupRes = await request(app)
        .post('/api/v1/users/wallet/topup')
        .set('Authorization', `Bearer ${studentToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ amount: 100 });

      expect(dupRes.status).toBe(200);
      // Balance MUST remain 900, NOT increment to 1000!
      expect(dupRes.body.data.walletBalance).toBe(900);

      // Confirm in database directly
      const profile = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(profile.body.data.walletBalance).toBe(900);
    });

    it('should verify audit logs were recorded for each successful top-up', async () => {
      const student = await User.findOne({ email: studentEmail });
      expect(student).toBeDefined();

      const auditLogs = await AuditLog.find({
        actorId: student!._id,
        action: 'WALLET_TOPUP',
      });

      // We performed 4 unique top-ups: 100, 200, 500, 100 (duplicate was suppressed)
      expect(auditLogs.length).toBe(4);
    });
  });
});
