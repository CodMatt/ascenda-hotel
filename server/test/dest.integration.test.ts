import request from 'supertest';
import mongoose from 'mongoose';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import {app} from '../index';

interface Destination {
  uid: string;
  term: string;
  state: string;
  country: string;
}

const testMongoose = new mongoose.Mongoose();
beforeAll(async () => {
  const uri = process.env.MONGODB_URI_TEST;
  console.log(process.env.MONGODB_URI_TEST);
  if (!uri) throw new Error("Missing MONGODB_URI_TEST in .env.test");
  await testMongoose.connect(uri);
});

afterAll(async () => {
  await testMongoose.connection.close();
});

describe('GET /api/destinations', () => {
  it('no search query should not have any search destinations', async () => {
    const res = await request(app).get('/api/destinations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it('returns autocomplete results when search query provided', async () => {
    const res = await request(app).get('/api/destinations').query({ search: 'singap' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((d: Destination) => d.term.toLowerCase().includes('singap'))).toBe(true);
  });

  it('handles no matches gracefully', async () => {
    const res = await request(app).get('/api/destinations').query({ search: 'zzzzzzzzzz' });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});