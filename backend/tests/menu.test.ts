import request from 'supertest';
import { createApp } from '../src/app';
import { setupTestDb } from './setup';
import { MenuItem } from '../src/models';

setupTestDb();

const app = createApp();

describe('Menu Catalog & Inventory Endpoints', () => {
  let adminToken = '';
  let staffToken = '';
  let studentToken = '';

  beforeAll(async () => {
    // Authenticate admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ananya.iyer@campus.edu', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    // Authenticate staff
    const staffRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ramesh.canteen@campus.edu', password: 'staff123' });
    staffToken = staffRes.body.data.token;

    // Authenticate student
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'aarav.sharma@campus.edu', password: 'student123' });
    studentToken = studentRes.body.data.token;
  });

  it('should list public menu catalog without requiring auth', async () => {
    const res = await request(app).get('/api/v1/menu');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should filter menu items by category', async () => {
    const res = await request(app).get('/api/v1/menu?category=breakfast');
    expect(res.status).toBe(200);
    expect(res.body.data.every((item: any) => item.category === 'breakfast')).toBe(true);
  });

  it('should filter menu items by dietary restriction', async () => {
    const res = await request(app).get('/api/v1/menu?dietary=vegan');
    expect(res.status).toBe(200);
    expect(res.body.data.every((item: any) => item.dietary === 'vegan')).toBe(true);
  });

  it('should allow staff to toggle dish availability (Item 86)', async () => {
    const items = await MenuItem.find({ isArchived: false });
    const targetItem = items[0];

    const res = await request(app)
      .patch(`/api/v1/menu/${targetItem._id}/availability`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ isAvailable: !targetItem.isAvailable });

    expect(res.status).toBe(200);
    expect(res.body.data.isAvailable).toBe(!targetItem.isAvailable);

    // Revert state
    await request(app)
      .patch(`/api/v1/menu/${targetItem._id}/availability`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ isAvailable: targetItem.isAvailable });
  });

  it('should forbid student from toggling item availability', async () => {
    const items = await MenuItem.find({ isArchived: false });
    const targetItem = items[0];

    const res = await request(app)
      .patch(`/api/v1/menu/${targetItem._id}/availability`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ isAvailable: false });

    expect(res.status).toBe(403);
  });

  it('should allow admin to create a new menu item', async () => {
    const newDishName = `Test Special Dish ${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: newDishName,
        description: 'Authentic delicacy crafted with special kitchen herbs.',
        category: 'quick-bites',
        price: 85,
        dietary: 'veg',
        prepTimeMinutes: 7,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        addons: [{ name: 'Spicy Dip', price: 15 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(newDishName);

    // Clean up
    await MenuItem.findByIdAndDelete(res.body.data._id);
  });
});
