import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export type UserRole = 'Admin' | 'Developer' | 'User' | 'Auditor';

export interface AuthUser {
  userId: string;
  walletAddress: string;
  role?: UserRole;
}

export const verifyAuth = (request: NextRequest): AuthUser | null => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as AuthUser;
    
    return decoded;
  } catch {
    return null;
  }
};

export const requireAuth = (request: NextRequest): AuthUser => {
  const user = verifyAuth(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
};

export const requireRole = (request: NextRequest, roles: UserRole[]): AuthUser => {
  const user = requireAuth(request);

  if (user.role && !roles.includes(user.role)) {
    throw new Error('Forbidden: insufficient permissions');
  }

  return user;
};


