// Health API route unit tests — exercise the real GET() handler

import { GET } from '@/app/api/health/route';
import packageJson from '@/../package.json';

describe('GET /api/health', () => {
  describe('HTTP status and response structure', () => {
    it('returns HTTP 200', async () => {
      const response = await GET();
      expect(response.status).toBe(200);
    });

    it('returns JSON content type', async () => {
      const response = await GET();
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('returns expected fields with correct types', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('version');
      
      // Type checks
      expect(typeof data.status).toBe('string');
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.environment).toBe('string');
      expect(typeof data.version).toBe('string');
    });

    it('version matches package.json version', async () => {
      const response = await GET();
      const data = await response.json();
      expect(data.version).toBe(packageJson.version);
    });
  });

  describe('timestamp validation', () => {
    it('timestamp is a valid ISO date string', async () => {
      const response = await GET();
      const data = await response.json();
      const ts: string = data.timestamp;

      expect(typeof ts).toBe('string');
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(ts).getTime()).toBeGreaterThan(0);
    });

    it('timestamp is recent (within 5 seconds)', async () => {
      const response = await GET();
      const data = await response.json();
      const ts = new Date(data.timestamp).getTime();
      const now = Date.now();
      
      expect(now - ts).toBeLessThan(5000); // Within 5 seconds
    });

    it('timestamp is not in the future', async () => {
      const response = await GET();
      const data = await response.json();
      const ts = new Date(data.timestamp).getTime();
      const now = Date.now();
      
      expect(ts).toBeLessThanOrEqual(now);
    });
  });

  describe('environment handling', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('environment reflects NODE_ENV', async () => {
      const response = await GET();
      const data = await response.json();
      expect(data.environment).toBe(process.env.NODE_ENV ?? 'development');
    });

    it('uses development as fallback when NODE_ENV is undefined', async () => {
      delete process.env.NODE_ENV;
      const response = await GET();
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('reflects production when NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production';
      const response = await GET();
      const data = await response.json();
      expect(data.environment).toBe('production');
    });

    it('reflects test when NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';
      const response = await GET();
      const data = await response.json();
      expect(data.environment).toBe('test');
    });
  });

  describe('status field', () => {
    it('always returns status "ok"', async () => {
      // Multiple calls to ensure consistency
      for (let i = 0; i < 5; i++) {
        const response = await GET();
        const data = await response.json();
        expect(data.status).toBe('ok');
      }
    });

    it('status is lowercase string', async () => {
      const response = await GET();
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.status).not.toBe('OK');
      expect(data.status).not.toBe('Ok');
    });
  });

  describe('version handling', () => {
    it('version is a valid semver string', async () => {
      const response = await GET();
      const data = await response.json();
      const version = data.version;
      
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('version is not empty', async () => {
      const response = await GET();
      const data = await response.json();
      expect(data.version.length).toBeGreaterThan(0);
    });
  });

  describe('performance and reliability', () => {
    it('responds quickly (< 50ms)', async () => {
      const start = Date.now();
      await GET();
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('handles multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => GET());
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('returns consistent responses across calls', async () => {
      const response1 = await GET();
      const data1 = await response1.json();
      
      const response2 = await GET();
      const data2 = await response2.json();
      
      // Core fields should be consistent
      expect(data1.status).toBe(data2.status);
      expect(data1.version).toBe(data2.version);
      expect(data1.environment).toBe(data2.environment);
      
      // Timestamps should differ
      expect(data1.timestamp).not.toBe(data2.timestamp);
    });
  });

  describe('response headers', () => {
    it('sets appropriate cache headers', async () => {
      const response = await GET();
      const cacheControl = response.headers.get('cache-control');
      
      // Health endpoints typically shouldn't be cached
      if (cacheControl) {
        expect(cacheControl).toMatch(/no-cache|no-store|max-age=0/);
      }
    });

    it('sets CORS headers if configured', async () => {
      const response = await GET();
      // Check for common CORS headers
      const origin = response.headers.get('access-control-allow-origin');
      // This may be undefined if CORS isn't configured, so we just note it's there if present
      if (origin) {
        expect(origin).toBe('*');
      }
    });
  });

  describe('error scenarios', () => {
    it('handles missing environment variables gracefully', async () => {
      // The health endpoint should still work even if env vars are missing
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      
      const response = await GET();
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.environment).toBe('development');
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});