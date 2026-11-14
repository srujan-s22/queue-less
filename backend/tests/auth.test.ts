import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { User } from '../src/models';
import { env } from '../src/config/env';

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
});
