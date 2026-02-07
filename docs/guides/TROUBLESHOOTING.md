# Troubleshooting Guide

Common issues and solutions for the Solana DeFi Wallet.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Wallet Connection Issues](#wallet-connection-issues)
- [API Issues](#api-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Problem: npm install fails

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or use force flag
npm install --force

# Clear cache first if still failing
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### Problem: Node version incompatible

**Error:**
```
error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check Node version
node --version

# Install Node 18+
# Using nvm:
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

### Problem: Sharp installation fails

**Error:**
```
Something went wrong installing the "sharp" module
```

**Solution:**
```bash
# Reinstall sharp
npm install --legacy-peer-deps sharp

# Or skip sharp (uses native next/image)
npm install --legacy-peer-deps --ignore-scripts
```

---

## Build Issues

### Problem: Build fails with TypeScript errors

**Error:**
```
Type error: Cannot find module '@/components/...'
```

**Solution:**
```bash
# Verify TypeScript paths in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Restart TypeScript server in IDE
# Or rebuild
npm run build
```

---

### Problem: Prisma client not found

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
# Generate Prisma client
npx prisma generate

# If still failing, check schema
npx prisma validate

# Regenerate and rebuild
npx prisma generate
npm run build
```

---

### Problem: Module not found errors

**Error:**
```
Module not found: Can't resolve 'three'
```

**Solution:**
```bash
# Check if using light build
# If yes, some modules are intentionally excluded

# For full build, reinstall dependencies
npm install --legacy-peer-deps

# Or switch to full package.json
cp package.full.json package.json
npm install --legacy-peer-deps
```

---

### Problem: Out of memory during build

**Error:**
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solution:**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or in package.json:
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```

---

## Runtime Issues

### Problem: Page won't load

**Symptoms:**
- Blank page
- Loading forever
- No error messages

**Solution:**
```bash
# Check browser console for errors
# Common fixes:

# 1. Clear .next cache
rm -rf .next
npm run dev

# 2. Check environment variables
cat .env

# 3. Verify all required env vars
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://api.mainnet-beta.solana.com

# 4. Check for JavaScript errors in browser console
```

---

### Problem: Hydration errors

**Error:**
```
Error: Hydration failed because the initial UI does not match
```

**Solution:**
```typescript
// Use useEffect for client-only code
useEffect(() => {
  // Client-only code here
}, []);

// Or use dynamic import with ssr: false
const Component = dynamic(() => import('./Component'), {
  ssr: false
});

// Or suppress hydration warning (last resort)
<div suppressHydrationWarning>
  {typeof window !== 'undefined' && <ClientComponent />}
</div>
```

---

### Problem: Port 3000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

---

## Wallet Connection Issues

### Problem: Wallet not detected

**Symptoms:**
- "No wallet found" message
- Wallet button disabled

**Solution:**
```bash
# 1. Install wallet extension
# Phantom: https://phantom.app
# Solflare: https://solflare.com

# 2. Refresh page after installation

# 3. Check browser compatibility
# Chrome, Firefox, Brave, Edge supported

# 4. Disable conflicting extensions
# Try in incognito mode

# 5. Check wallet is unlocked
```

---

### Problem: Wallet connection fails

**Error:**
```
User rejected the request
WalletNotReadyError
```

**Solution:**
```typescript
// 1. Ensure wallet is unlocked
// 2. User must approve connection
// 3. Check wallet permissions

// In code, handle errors:
try {
  await connect();
} catch (error) {
  if (error.name === 'WalletNotReadyError') {
    toast.error('Please unlock your wallet');
  }
}
```

---

### Problem: Transaction fails

**Error:**
```
Transaction simulation failed
Insufficient SOL for transaction
```

**Solution:**
```bash
# 1. Check SOL balance (need for gas)
# Minimum: 0.001 SOL

# 2. Check slippage settings
# Increase slippage for volatile tokens

# 3. Check RPC endpoint
# May be rate limited or slow

# 4. Try again with higher priority fee
```

---

## API Issues

### Problem: API returns 500 error

**Error:**
```
Internal Server Error
```

**Solution:**
```bash
# 1. Check API logs
npm run dev
# Look for errors in terminal

# 2. Verify environment variables
# All required variables set?

# 3. Check external API status
# Jupiter, Birdeye, etc.

# 4. Test API endpoint directly
curl http://localhost:3000/api/tokens
```

---

### Problem: Rate limit exceeded

**Error:**
```
429 Too Many Requests
```

**Solution:**
```typescript
// 1. Implement exponential backoff
async function retryWithBackoff(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      } else {
        throw error;
      }
    }
  }
}

// 2. Cache responses
// 3. Reduce request frequency
// 4. Upgrade API plan if needed
```

---

### Problem: CORS errors

**Error:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
```typescript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## Database Issues

### Problem: Database connection fails

**Error:**
```
Can't reach database server
PrismaClientInitializationError
```

**Solution:**
```bash
# 1. Verify DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# 2. Check PostgreSQL is running
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service

# 3. Test connection
npx prisma db pull

# 4. Check firewall rules
```

---

### Problem: Migration fails

**Error:**
```
Migration failed to apply
```

**Solution:**
```bash
# 1. Reset database (development only!)
npx prisma migrate reset

# 2. Or force apply migration
npx prisma migrate deploy --force

# 3. Check for conflicting migrations
npx prisma migrate status

# 4. Manual fix if needed
psql -d your_database -f migration.sql
```

---

### Problem: Schema out of sync

**Error:**
```
Prisma schema and database are out of sync
```

**Solution:**
```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Apply pending migrations
npx prisma migrate dev

# 3. Or pull schema from database
npx prisma db pull

# 4. Verify
npx prisma validate
```

---

## Performance Issues

### Problem: Slow page loads

**Symptoms:**
- Long loading times
- Laggy interactions

**Solution:**
```bash
# 1. Check bundle size
npm run build
# Look for large chunks

# 2. Optimize images
# Use next/image component
# Use AVIF/WebP formats

# 3. Enable caching
# Use proper Cache-Control headers

# 4. Use CDN
# Deploy to Vercel or similar

# 5. Analyze with Lighthouse
# Check Performance score
```

---

### Problem: High memory usage

**Symptoms:**
- Browser slows down
- Tab crashes

**Solution:**
```typescript
// 1. Memoize components
const MemoComponent = React.memo(Component);

// 2. Use virtual lists for long lists
import { FixedSizeList } from 'react-window';

// 3. Clean up effects
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);

// 4. Lazy load components
const Heavy = dynamic(() => import('./Heavy'));
```

---

### Problem: API calls slow

**Symptoms:**
- Long response times
- Timeouts

**Solution:**
```typescript
// 1. Implement caching
const cache = new Map();

async function getCachedData(key, fetchFn, ttl = 60000) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

// 2. Use parallel requests
const [tokens, prices] = await Promise.all([
  fetchTokens(),
  fetchPrices()
]);

// 3. Implement request deduplication
// 4. Use faster RPC endpoint
```

---

## Getting More Help

If your issue isn't listed here:

1. **Search GitHub Issues**: https://github.com/SMSDAO/solana-defi-wallet/issues
2. **Check Documentation**: Review relevant docs
3. **Open New Issue**: Include:
   - Error message
   - Steps to reproduce
   - Environment details
   - What you've tried

### Issue Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox]
- Node version: [e.g. 18.0.0]
- Package version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

---

**Last Updated**: 2025-01-20
