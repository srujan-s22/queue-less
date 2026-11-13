import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { User } from '../src/models';

setupTestDb();

const app = createApp();

describe('Authentication & User Profile Endpoints', () => {
  const testStudentEmail = `test.student.${Date.now()}@campus.edu`;
  const testStudentRoll = `ROLL-${Date.now().toString().slice(-6)}`;
  let studentToken = '';

  afterAll(async () => {
    // Cleanup test user
    await User.deleteMany({ email: { $regex: /test\.student/ } });
  });

  it('should register a new student user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Student',
        email: testStudentEmail,
        password: 'password123',
        studentId: testStudentRoll,
        department: 'Electronics',
        phone: '+91 99999 88888',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testStudentEmail);
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.token).toBeDefined();

    studentToken = res.body.data.token;
  });

  it('should fail registration when duplicate email is submitted', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another Student',
        email: testStudentEmail,
        password: 'password123',
        studentId: `ROLL-DIFF-${Date.now()}`,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testStudentEmail,
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testStudentEmail,
        password: 'incorrectPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should retrieve authenticated user profile via /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testStudentEmail);
  });

  it('should reject unauthenticated request to /auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should top up wallet balance', async () => {
    const res = await request(app)
      .post('/api/v1/users/wallet/topup')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ amount: 200 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.walletBalance).toBe(200);
  });
});
