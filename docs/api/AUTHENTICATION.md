# Authentication

The Solana DeFi Wallet API uses JWT (JSON Web Tokens) for authentication.

## Overview

Authentication is required for:
- Creating and managing orders (limit/DCA)
- Accessing user-specific data
- Modifying user settings
- Protected API endpoints

Public endpoints (no authentication required):
- Token information
- Price data
- Swap quotes (view-only)

---

## Getting Started

### 1. Connect Wallet

First, users must connect their Solana wallet through the UI or SDK.

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, signMessage } = useWallet();
```

---

### 2. Request Authentication

**POST** `/api/auth/login`

Sign a message with your wallet to get a JWT token.

#### Request Body

```typescript
{
  publicKey: string;    // Wallet address
  signature: string;    // Signed message (base64)
  message: string;      // Original message
}
```

#### Message Format

```typescript
const message = `Sign this message to authenticate with Solana DeFi Wallet.

Nonce: ${nonce}
Timestamp: ${timestamp}`;
```

#### Example

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

async function authenticate() {
  const { publicKey, signMessage } = useWallet();
  
  // Get nonce from server
  const nonceResponse = await fetch('/api/auth/nonce');
  const { nonce } = await nonceResponse.json();
  
  // Create message
  const message = `Sign this message to authenticate with Solana DeFi Wallet.

Nonce: ${nonce}
Timestamp: ${Date.now()}`;
  
  // Sign message
  const encodedMessage = new TextEncoder().encode(message);
  const signature = await signMessage(encodedMessage);
  
  // Get token
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: publicKey.toBase58(),
      signature: Buffer.from(signature).toString('base64'),
      message
    })
  });
  
  const { token, expiresIn } = await response.json();
  return token;
}
```

#### Response

```typescript
{
  token: string;           // JWT token
  expiresIn: number;       // Token expiration (seconds)
  refreshToken: string;    // Refresh token
  user: {
    publicKey: string;
    createdAt: string;
  };
}
```

---

### 3. Use Token in Requests

Include the JWT token in the Authorization header:

```typescript
const response = await fetch('/api/orders/limit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ /* order data */ })
});
```

---

## Token Management

### Get Nonce

**GET** `/api/auth/nonce`

Get a nonce for message signing.

#### Response

```typescript
{
  nonce: string;
  expiresAt: number;
}
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Refresh an expired JWT token.

#### Request Body

```typescript
{
  refreshToken: string;
}
```

#### Response

```typescript
{
  token: string;
  expiresIn: number;
  refreshToken: string;
}
```

---

### Logout

**POST** `/api/auth/logout`

Invalidate current token.

#### Headers

```
Authorization: Bearer {token}
```

#### Response

```typescript
{
  success: boolean;
  message: string;
}
```

---

## Token Details

### JWT Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-wallet-address",
    "iat": 1705708800,
    "exp": 1705795200,
    "type": "access"
  }
}
```

### Token Expiration

- **Access Token**: 24 hours
- **Refresh Token**: 30 days
- **Nonce**: 5 minutes

---

## Security Best Practices

### Client-Side

1. **Store tokens securely**
   ```typescript
   // Use secure storage
   localStorage.setItem('auth_token', token);
   
   // Or better, use httpOnly cookies (if server-side)
   ```

2. **Validate token before use**
   ```typescript
   function isTokenExpired(token: string): boolean {
     const payload = JSON.parse(atob(token.split('.')[1]));
     return payload.exp * 1000 < Date.now();
   }
   ```

3. **Refresh tokens proactively**
   ```typescript
   async function ensureValidToken() {
     if (isTokenExpired(accessToken)) {
       const newToken = await refreshToken(refreshToken);
       setAccessToken(newToken);
     }
     return accessToken;
   }
   ```

4. **Clear tokens on logout**
   ```typescript
   function logout() {
     localStorage.removeItem('auth_token');
     localStorage.removeItem('refresh_token');
     // Redirect to home
   }
   ```

---

### Server-Side

The API implements several security measures:

1. **Token Validation**
   - Signature verification
   - Expiration checking
   - Revocation checking

2. **Rate Limiting**
   - Per-user limits
   - Global limits
   - Progressive delays

3. **Message Signing**
   - Nonce validation
   - Timestamp checking
   - Signature verification

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_SIGNATURE` | Signature verification failed | 401 |
| `EXPIRED_TOKEN` | Token has expired | 401 |
| `INVALID_TOKEN` | Token is malformed or invalid | 401 |
| `REVOKED_TOKEN` | Token has been revoked | 401 |
| `INVALID_NONCE` | Nonce is invalid or expired | 400 |
| `MISSING_AUTH` | Authorization header missing | 401 |
| `RATE_LIMIT_EXCEEDED` | Too many auth attempts | 429 |

---

## SDK Usage

The SDK handles authentication automatically:

```typescript
import { SolanaWalletSDK } from '@/api/sdk';
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const wallet = useWallet();
  
  useEffect(() => {
    const sdk = new SolanaWalletSDK();
    
    // Authenticate with wallet
    sdk.auth.loginWithWallet(wallet).then(() => {
      console.log('Authenticated!');
      
      // Now you can make authenticated requests
      sdk.orders.createLimit({ /* ... */ });
    });
  }, [wallet]);
}
```

### Automatic Token Refresh

```typescript
const sdk = new SolanaWalletSDK({
  autoRefresh: true,  // Automatically refresh tokens
  onTokenRefresh: (newToken) => {
    console.log('Token refreshed');
  },
  onAuthError: (error) => {
    console.error('Auth error:', error);
    // Handle re-authentication
  }
});
```

---

## Testing Authentication

### Development Mode

In development, you can use test tokens:

```typescript
// .env.local
NEXT_PUBLIC_TEST_MODE=true
TEST_JWT_SECRET=test-secret-key

// Use test token
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Production Mode

Always use real wallet signatures in production:

```typescript
if (process.env.NODE_ENV === 'production') {
  // Require real wallet signatures
  // No test tokens allowed
}
```

---

## Integration Examples

### React Hook

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

export function useAuth() {
  const wallet = useWallet();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = async () => {
    setLoading(true);
    try {
      const token = await authenticate(wallet);
      setToken(token);
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
  };
  
  return { token, login, logout, loading };
}
```

### API Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Verify token
    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/orders/:path*', '/api/user/:path*']
};
```

---

**Related Documentation:**
- [API Overview](README.md) - API introduction
- [Orders API](ORDERS_API.md) - Order management
- [Swap API](SWAP_API.md) - Token swaps

**Last Updated**: 2025-01-20
