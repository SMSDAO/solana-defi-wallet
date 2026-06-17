// Unit tests for the auth-gated GET /api/metrics route handler

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/metrics/route';

// Mirror getVerifySecret() in auth.ts: prefer JWT_SECRET when set (CI), fall back to dev constant.
const SIGN_SECRET = process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-production';

function makeRequest(payload?: object): NextRequest {
  const headers: Record<string, string> = {};
  if (payload) {
    const token = jwt.sign(payload, SIGN_SECRET);
    headers['authorization'] = `Bearer ${token}`;
  }
  return new NextRequest('http://localhost/api/metrics', { headers });
}

describe('GET /api/metrics', () => {
  it('returns 401 when no token is present', async () => {
    const req = makeRequest();
    const response = await GET(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Unauthorized');
  });

  it('returns 403 when role is not Admin or Developer', async () => {
    const req = makeRequest({ userId: 'u1', walletAddress: 'user.sol', role: 'User' });
    const response = await GET(req);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Forbidden');
  });

  it('returns 403 for Auditor role', async () => {
    const req = makeRequest({ userId: 'aud1', walletAddress: 'aud.sol', role: 'Auditor' });
    const response = await GET(req);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Forbidden');
  });

  it('returns 200 with expected shape for Admin role', async () => {
    const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('uptimeMs');
    expect(data).toHaveProperty('uptimeHuman');
    expect(data).toHaveProperty('memory');
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.uptimeMs).toBe('number');
    expect(typeof data.uptimeHuman).toBe('string');
    expect(typeof data.timestamp).toBe('string');
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('returns 200 with expected shape for Developer role', async () => {
    const req = makeRequest({ userId: 'd1', walletAddress: 'dev.sol', role: 'Developer' });
    const response = await GET(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('uptimeMs');
    expect(data).toHaveProperty('uptimeHuman');
    expect(data).toHaveProperty('memory');
    expect(data).toHaveProperty('timestamp');
  });

  it('memory field contains rss, heapUsed, heapTotal, and external', async () => {
    const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
    const response = await GET(req);
    const data = await response.json();
    expect(data.memory).toHaveProperty('rss');
    expect(data.memory).toHaveProperty('heapUsed');
    expect(data.memory).toHaveProperty('heapTotal');
    expect(data.memory).toHaveProperty('external');
  });
});
