import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    // Dev/CI fallback — never use in production
    return 'dev-only-secret-do-not-use-in-production';
  }
  return secret;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminHashedPassword = process.env.ADMIN_PASSWORD_HASH;

    if (email !== adminEmail) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Always verify password when hash is configured
    if (adminHashedPassword) {
      const valid = await bcrypt.compare(password, adminHashedPassword);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // Generate with: node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('yourpassword',12).then(console.log)"
      return NextResponse.json(
        { error: 'Server misconfigured: ADMIN_PASSWORD_HASH is not set. Generate with: node -e "const bcrypt=require(\'bcryptjs\'); bcrypt.hash(\'yourpassword\',12).then(console.log)"' },
        { status: 503 }
      );
    }

    const secret = getJwtSecret();
    const payload = {
      userId: 'admin-1',
      walletAddress: adminEmail,
      role: 'Admin',
    };

    const token = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return NextResponse.json({
      token,
      user: { email: adminEmail, role: 'Admin' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    console.error('Auth error:', message);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
