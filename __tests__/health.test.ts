// Health API route unit tests — exercise the real GET() handler

import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns HTTP 200', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('returns expected fields with correct values', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('version', '1.0.0');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('environment');
  });

  it('timestamp is a valid ISO date string', async () => {
    const response = await GET();
    const data = await response.json();
    const ts: string = data.timestamp;

    expect(typeof ts).toBe('string');
    expect(new Date(ts).getTime()).toBeGreaterThan(0);
  });

  it('environment reflects NODE_ENV', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.environment).toBe(process.env.NODE_ENV ?? 'development');
  });
});
