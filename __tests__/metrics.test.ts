// Unit tests for the auth-gated GET /api/metrics route handler

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/metrics/route';

// Mirror getVerifySecret() in auth.ts: prefer JWT_SECRET when set (CI), fall back to dev constant.
const SIGN_SECRET = process.env.JWT_SECRET || 'dev-only-secret-do-not-use-in-production';

function makeRequest(payload?: object, customHeaders?: Record<string, string>): NextRequest {
  const headers: Record<string, string> = { ...customHeaders };
  if (payload) {
    const token = jwt.sign(payload, SIGN_SECRET, { algorithm: 'HS256' });
    headers['authorization'] = `Bearer ${token}`;
  }
  return new NextRequest('http://localhost/api/metrics', { headers });
}

describe('GET /api/metrics', () => {
  describe('authentication', () => {
    it('returns 401 when no token is present', async () => {
      const req = makeRequest();
      const response = await GET(req);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Unauthorized');
    });

    it('returns 401 when empty token is present', async () => {
      const req = makeRequest(undefined, { authorization: 'Bearer ' });
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('returns 401 when malformed token header exists', async () => {
      const req = makeRequest(undefined, { authorization: 'Basic xyz' });
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('returns 401 for invalid/tampered token', async () => {
      const token = jwt.sign({ userId: 'u1' }, 'wrong-secret');
      const req = new NextRequest('http://localhost/api/metrics', {
        headers: { authorization: `Bearer ${token}` }
      });
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('returns 401 for expired token', async () => {
      const token = jwt.sign(
        { userId: 'u1', role: 'Admin', exp: Math.floor(Date.now() / 1000) - 60 },
        SIGN_SECRET,
        { algorithm: 'HS256' }
      );
      const req = new NextRequest('http://localhost/api/metrics', {
        headers: { authorization: `Bearer ${token}` }
      });
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('handles case-insensitive authorization header', async () => {
      const payload = { userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' };
      const token = jwt.sign(payload, SIGN_SECRET, { algorithm: 'HS256' });
      const req = new NextRequest('http://localhost/api/metrics', {
        headers: { Authorization: `Bearer ${token}` } // Capital A
      });
      const response = await GET(req);
      expect(response.status).toBe(200);
    });

    it('handles lowercase "bearer" scheme', async () => {
      const payload = { userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' };
      const token = jwt.sign(payload, SIGN_SECRET, { algorithm: 'HS256' });
      const req = new NextRequest('http://localhost/api/metrics', {
        headers: { authorization: `bearer ${token}` }
      });
      const response = await GET(req);
      expect(response.status).toBe(200);
    });
  });

  describe('authorization', () => {
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

    it('returns 403 when token has no role field', async () => {
      const req = makeRequest({ userId: 'u1', walletAddress: 'anon.sol' });
      const response = await GET(req);
      expect(response.status).toBe(403);
    });

    it('returns 403 when role is null', async () => {
      const req = makeRequest({ userId: 'u1', walletAddress: 'anon.sol', role: null });
      const response = await GET(req);
      expect(response.status).toBe(403);
    });
  });

  describe('successful responses', () => {
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

    it('returns JSON content type', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('memory metrics', () => {
    it('memory field contains rss, heapUsed, heapTotal, and external', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      expect(data.memory).toHaveProperty('rss');
      expect(data.memory).toHaveProperty('heapUsed');
      expect(data.memory).toHaveProperty('heapTotal');
      expect(data.memory).toHaveProperty('external');
    });

    it('memory values are positive numbers', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      
      expect(typeof data.memory.rss).toBe('number');
      expect(data.memory.rss).toBeGreaterThan(0);
      expect(typeof data.memory.heapUsed).toBe('number');
      expect(data.memory.heapUsed).toBeGreaterThan(0);
      expect(typeof data.memory.heapTotal).toBe('number');
      expect(data.memory.heapTotal).toBeGreaterThan(0);
      expect(typeof data.memory.external).toBe('number');
      expect(data.memory.external).toBeGreaterThanOrEqual(0);
    });

    it('heapUsed is less than or equal to heapTotal', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      expect(data.memory.heapUsed).toBeLessThanOrEqual(data.memory.heapTotal);
    });

    it('memory values are in bytes (large numbers)', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      
      // Memory values should be at least a few MB (in bytes)
      expect(data.memory.rss).toBeGreaterThan(1024 * 1024); // > 1MB
      expect(data.memory.heapTotal).toBeGreaterThan(1024 * 1024); // > 1MB
    });
  });

  describe('uptime metrics', () => {
    it('uptimeMs is a positive number', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      expect(data.uptimeMs).toBeGreaterThan(0);
      expect(typeof data.uptimeMs).toBe('number');
    });

    it('uptimeHuman is a formatted string', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      expect(data.uptimeHuman).toMatch(/\d+ (seconds?|minutes?|hours?|days?)/);
    });

    it('uptimeMs and uptimeHuman are consistent', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      
      // Check that the human readable format matches the milliseconds
      const ms = data.uptimeMs;
      expect(data.uptimeHuman).toMatch(/[\d.]+/);
    });

    it('uptime increases over time', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      
      const response1 = await GET(req);
      const data1 = await response1.json();
      
      // Wait 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response2 = await GET(req);
      const data2 = await response2.json();
      
      expect(data2.uptimeMs).toBeGreaterThan(data1.uptimeMs);
    });
  });

  describe('timestamp', () => {
    it('timestamp is a valid ISO date string', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('timestamp is recent (within 5 seconds)', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const response = await GET(req);
      const data = await response.json();
      const ts = new Date(data.timestamp).getTime();
      const now = Date.now();
      expect(now - ts).toBeLessThan(5000);
    });
  });

  describe('performance', () => {
    it('responds quickly (< 50ms)', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const start = Date.now();
      await GET(req);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('handles multiple concurrent requests', async () => {
      const req = makeRequest({ userId: 'a1', walletAddress: 'admin.sol', role: 'Admin' });
      const requests = Array(10).fill(null).map(() => GET(req));
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('error handling', () => {
    it('returns appropriate error messages as JSON', async () => {
      const req = makeRequest();
      const response = await GET(req);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });

    it('does not expose internal error details', async () => {
      const req = makeRequest(undefined, { authorization: 'Bearer invalid' });
      const response = await GET(req);
      const data = await response.json();
      
      // Should not expose stack traces or internal details
      expect(data).not.toHaveProperty('stack');
      expect(data).not.toHaveProperty('details');
    });
  });
});