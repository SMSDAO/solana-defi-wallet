# Security Architecture

Comprehensive security documentation for the Solana DeFi Wallet application.

## Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimal access rights
3. **Secure by Default** - Secure configurations out of the box
4. **Zero Trust** - Verify everything
5. **Data Protection** - Encrypt sensitive data

---

## Authentication & Authorization

### JWT Authentication

#### Token Structure

```typescript
interface JWTPayload {
  sub: string;        // User wallet address
  iat: number;        // Issued at
  exp: number;        // Expiration
  type: 'access' | 'refresh';
}
```

#### Token Generation

```typescript
import jwt from 'jsonwebtoken';

export function generateAccessToken(publicKey: string): string {
  return jwt.sign(
    {
      sub: publicKey,
      type: 'access'
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '24h'
    }
  );
}

export function generateRefreshToken(publicKey: string): string {
  return jwt.sign(
    {
      sub: publicKey,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: '30d'
    }
  );
}
```

#### Token Verification

```typescript
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
}
```

---

### Wallet Signature Verification

#### Message Signing Flow

```typescript
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Buffer.from(signature, 'base64');
    const publicKeyBytes = new PublicKey(publicKey).toBytes();

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    return false;
  }
}
```

#### Nonce Generation

```typescript
export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function isNonceValid(
  nonce: string,
  timestamp: number
): boolean {
  const age = Date.now() - timestamp;
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  return age < maxAge && !usedNonces.has(nonce);
}
```

---

## API Security

### Rate Limiting

```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100,      // Number of requests
  duration: 60,     // Per 60 seconds
  blockDuration: 60 // Block for 60 seconds if exceeded
});

export async function rateLimit(identifier: string) {
  try {
    await rateLimiter.consume(identifier);
  } catch (error) {
    throw new Error('Rate limit exceeded');
  }
}

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await rateLimit(ip);
  } catch (error) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Process request
}
```

---

### Input Validation

```typescript
import { z } from 'zod';

// Define schemas
const SwapParamsSchema = z.object({
  inputMint: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
  outputMint: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
  amount: z.string().regex(/^\d+$/),
  slippage: z.number().min(0).max(100).optional()
});

// Validate input
export function validateSwapParams(params: unknown) {
  try {
    return SwapParamsSchema.parse(params);
  } catch (error) {
    throw new Error('Invalid parameters');
  }
}

// Usage
export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const params = validateSwapParams(body);
    // Process validated params
  } catch (error) {
    return Response.json(
      { error: 'Validation failed' },
      { status: 400 }
    );
  }
}
```

---

### SQL Injection Prevention

Prisma ORM provides automatic protection:

```typescript
// ✅ Safe - Prisma uses parameterized queries
const user = await prisma.user.findUnique({
  where: { publicKey: userInput }
});

// ✅ Safe - Prisma escapes input
const users = await prisma.user.findMany({
  where: {
    publicKey: { contains: searchTerm }
  }
});

// ❌ Never do this - Raw SQL with user input
// const users = await prisma.$queryRaw`
//   SELECT * FROM users WHERE publicKey = ${userInput}
// `;

// ✅ If raw SQL needed, use parameters
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE publicKey = ${Prisma.sql`${userInput}`}
`;
```

---

### XSS Prevention

React provides automatic XSS protection:

```typescript
// ✅ Safe - React escapes by default
<div>{userInput}</div>

// ✅ Safe - Still escaped
<input value={userInput} />

// ❌ Dangerous - Bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe alternative - Sanitize first
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

---

## Data Security

### Environment Variables

```typescript
// .env file structure
DATABASE_URL="postgresql://..."
JWT_SECRET="minimum-32-characters-random-string"
JWT_REFRESH_SECRET="different-32-character-string"

# Never commit .env file
# Use .env.example as template

// Validate required env vars
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

requiredEnvVars.forEach(name => {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
});
```

---

### Password Hashing (if applicable)

```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

### Database Encryption

```typescript
// Encrypt sensitive fields
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  });
}

export function decrypt(encryptedData: string): string {
  const { encrypted, iv, authTag } = JSON.parse(encryptedData);
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## Security Headers

Configured in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};
```

---

## CORS Configuration

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://your-domain.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
].filter(Boolean);

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  if (allowedOrigins.includes(origin)) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
  
  return NextResponse.next();
}
```

---

## Blockchain Security

### Transaction Validation

```typescript
export async function validateTransaction(
  transaction: Transaction,
  expectedSigner: PublicKey
): Promise<boolean> {
  // 1. Verify signer
  const signers = transaction.signatures.map(sig => sig.publicKey);
  if (!signers.some(s => s.equals(expectedSigner))) {
    return false;
  }
  
  // 2. Verify no suspicious instructions
  for (const instruction of transaction.instructions) {
    if (isSuspiciousInstruction(instruction)) {
      return false;
    }
  }
  
  // 3. Verify fee payer
  if (!transaction.feePayer?.equals(expectedSigner)) {
    return false;
  }
  
  return true;
}

function isSuspiciousInstruction(instruction: TransactionInstruction): boolean {
  // Check for known malicious program IDs
  const maliciousPrograms = [...]; // Known bad programs
  return maliciousPrograms.includes(instruction.programId.toBase58());
}
```

---

### Slippage Protection

```typescript
export function validateSlippage(
  expectedOutput: number,
  actualOutput: number,
  maxSlippage: number
): boolean {
  const slippage = Math.abs(expectedOutput - actualOutput) / expectedOutput;
  return slippage <= maxSlippage / 100;
}

// Usage before swap
const quote = await getSwapQuote(params);
const actualOutput = await simulateSwap(params);

if (!validateSlippage(quote.outAmount, actualOutput, params.slippage)) {
  throw new Error('Slippage exceeded');
}
```

---

## Monitoring & Logging

### Security Event Logging

```typescript
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity';
  timestamp: Date;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
}

export function logSecurityEvent(event: SecurityEvent) {
  // Log to security monitoring service
  console.warn('[SECURITY]', JSON.stringify(event));
  
  // Alert on critical events
  if (isCritical(event)) {
    sendAlert(event);
  }
}

// Usage
export async function POST(request: Request) {
  try {
    await rateLimit(ip);
  } catch (error) {
    logSecurityEvent({
      type: 'rate_limit',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || '',
      userAgent: request.headers.get('user-agent') || '',
      details: { error: error.message }
    });
    
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }
}
```

---

## Security Checklist

### Development
- [ ] All dependencies up to date
- [ ] No secrets in code
- [ ] Environment variables validated
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS in production
- [ ] Security headers configured

### Authentication
- [ ] JWT secrets are strong (32+ characters)
- [ ] Tokens have expiration
- [ ] Refresh token rotation implemented
- [ ] Signature verification working
- [ ] Nonce validation in place

### API Security
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protected (Prisma)
- [ ] XSS protection (React)
- [ ] CORS properly configured
- [ ] Authentication required where needed

### Data Security
- [ ] Database connections encrypted
- [ ] Sensitive fields encrypted
- [ ] Backup encryption enabled
- [ ] Access logs enabled

### Blockchain Security
- [ ] Transaction validation
- [ ] Slippage protection
- [ ] Malicious instruction detection
- [ ] Fee payer verification

---

## Incident Response

### Security Breach Protocol

1. **Identify** - Detect and confirm breach
2. **Contain** - Isolate affected systems
3. **Eradicate** - Remove threat
4. **Recover** - Restore services
5. **Learn** - Post-mortem analysis

### Emergency Contacts

- Security Team: security@example.com
- Infrastructure: ops@example.com
- On-call: +1-XXX-XXX-XXXX

---

## Security Audits

### Regular Audits
- Monthly dependency updates
- Quarterly security reviews
- Annual penetration testing

### Tools
- `npm audit` - Check for vulnerable dependencies
- `snyk` - Continuous security monitoring
- `OWASP ZAP` - Web application security scanner

```bash
# Check dependencies
npm audit

# Fix automatically
npm audit fix

# Manual review
npm audit --json
```

---

## Related Documentation

- [Architecture Overview](OVERVIEW.md)
- [Data Flow](DATA_FLOW.md)
- [API Authentication](../api/AUTHENTICATION.md)

---

**Last Updated**: 2025-01-20  
**Security Level**: Production Ready
