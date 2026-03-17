// Auth middleware unit tests — exercise requireAuth and requireRole directly

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { UserRole, requireAuth, requireRole, ForbiddenError, UnauthorizedError } from '@/middleware/auth';

// Must match the dev-fallback secret used by getVerifySecret() in non-production
const DEV_SECRET = 'dev-only-secret-do-not-use-in-production';

function makeRequest(payload?: object): NextRequest {
  const headers: Record<string, string> = {};
  if (payload) {
    const token = jwt.sign(payload, DEV_SECRET);
    headers['authorization'] = `Bearer ${token}`;
  }
  return new NextRequest('http://localhost/', { headers });
}

describe('RBAC role definitions', () => {
  const validRoles: UserRole[] = ['Admin', 'Developer', 'User', 'Auditor'];

  it('defines four RBAC roles', () => {
    expect(validRoles).toHaveLength(4);
    expect(validRoles).toContain('Admin');
    expect(validRoles).toContain('Developer');
    expect(validRoles).toContain('User');
    expect(validRoles).toContain('Auditor');
  });
});

describe('requireAuth', () => {
  it('throws UnauthorizedError when no token is present', () => {
    const req = makeRequest();
    expect(() => requireAuth(req)).toThrow(UnauthorizedError);
    expect(() => requireAuth(req)).toThrow('Unauthorized');
  });

  it('returns the decoded user for a valid token', () => {
    const payload = { userId: 'u1', walletAddress: 'test.sol', role: 'User' };
    const req = makeRequest(payload);
    const user = requireAuth(req);
    expect(user.userId).toBe('u1');
    expect(user.walletAddress).toBe('test.sol');
    expect(user.role).toBe('User');
  });

  it('throws UnauthorizedError for a tampered token', () => {
    const token = jwt.sign({ userId: 'u1', walletAddress: 'x' }, 'wrong-secret');
    const req = new NextRequest('http://localhost/', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => requireAuth(req)).toThrow(UnauthorizedError);
  });
});

describe('requireRole', () => {
  it('returns the user when role is in the allowed list', () => {
    const req = makeRequest({ userId: 'u1', walletAddress: 'admin.sol', role: 'Admin' });
    const user = requireRole(req, ['Admin', 'Developer']);
    expect(user.role).toBe('Admin');
  });

  it('throws ForbiddenError when role is not in the allowed list', () => {
    const req = makeRequest({ userId: 'u1', walletAddress: 'user.sol', role: 'User' });
    expect(() => requireRole(req, ['Admin'])).toThrow(ForbiddenError);
    expect(() => requireRole(req, ['Admin'])).toThrow('Forbidden');
  });

  it('throws ForbiddenError when the token has no role field', () => {
    const req = makeRequest({ userId: 'u1', walletAddress: 'anon.sol' });
    expect(() => requireRole(req, ['Admin'])).toThrow(ForbiddenError);
  });

  it('throws UnauthorizedError (not ForbiddenError) when no token is present', () => {
    const req = makeRequest();
    expect(() => requireRole(req, ['Admin'])).toThrow(UnauthorizedError);
  });

  it('Admin can access routes restricted to Admin only', () => {
    const req = makeRequest({ userId: 'a1', walletAddress: 'a.sol', role: 'Admin' });
    expect(() => requireRole(req, ['Admin'])).not.toThrow();
  });

  it('Auditor can access read-only routes', () => {
    const req = makeRequest({ userId: 'aud1', walletAddress: 'aud.sol', role: 'Auditor' });
    expect(() => requireRole(req, ['Admin', 'Auditor'])).not.toThrow();
  });
});
