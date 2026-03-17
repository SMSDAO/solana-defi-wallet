import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export type UserRole = 'Admin' | 'Developer' | 'User' | 'Auditor';

export interface AuthUser {
  userId: string;
  walletAddress: string;
  role?: UserRole;
}

/** Thrown by requireAuth when a valid token is absent. */
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** Thrown by requireRole when the authenticated user lacks the required role. */
export class ForbiddenError extends Error {
  constructor(message = 'Forbidden: insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

function getVerifySecret(): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Cannot verify tokens without JWT_SECRET in production
      return null;
    }
    // Dev/CI fallback — never use in production
    return 'dev-only-secret-do-not-use-in-production';
  }
  return secret;
}

export const verifyAuth = (request: NextRequest): AuthUser | null => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const secret = getVerifySecret();
    if (!secret) {
      return null;
    }

    const decoded = jwt.verify(token, secret) as AuthUser;

    return decoded;
  } catch {
    return null;
  }
};

export const requireAuth = (request: NextRequest): AuthUser => {
  const user = verifyAuth(request);

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
};

export const requireRole = (request: NextRequest, roles: UserRole[]): AuthUser => {
  const user = requireAuth(request);

  if (!user.role || !roles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
};

