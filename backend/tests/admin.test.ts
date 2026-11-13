import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';

setupTestDb();

const app = createApp();

describe('Administration, Settings & Analytics Endpoints', () => {
  let adminToken = '';
  let studentToken = '';

  beforeAll(async () => {
    // Authenticate admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ananya.iyer@campus.edu', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    // Authenticate student
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav.sharma@campus.edu', password: 'student123' });
    studentToken = studentRes.body.data.token;
  });

  it('should allow admin to view paginated orders register', async () => {
    const res = await request(app)
      .get('/api/v1/admin/orders?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it('should forbid student from accessing admin orders register', async () => {
    const res = await request(app)
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow fetching canteen global settings', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.status).toBe(200);
    expect(res.body.data.singletonKey).toBe('CANTEEN_GLOBAL_SETTINGS');
    expect(res.body.data.lateFeeAmount).toBe(20);
    expect(res.body.data.gracePeriodMinutes).toBe(10);
  });

  it('should allow admin to update canteen settings', async () => {
    const res = await request(app)
      .put('/api/v1/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        announcement: 'Special lunch discount today! All students get fast counter access.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.announcement).toContain('Special lunch discount');
  });

  it('should retrieve business analytics metrics for admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('overview');
    expect(res.body.data.overview).toHaveProperty('totalRevenue');
    expect(res.body.data.overview).toHaveProperty('totalOrders');
    expect(res.body.data).toHaveProperty('statusBreakdown');
    expect(res.body.data).toHaveProperty('topSellingItems');
  });

  it('should generate CSV export of orders', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/export-csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Order Number');
    expect(res.text).toContain('Token');
    expect(res.text).toContain('Total (INR)');
  });
});
