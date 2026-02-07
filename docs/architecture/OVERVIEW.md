# System Architecture Overview

The Solana DeFi Wallet is built with a modern, scalable architecture using Next.js 14, React 18, and Solana blockchain integration.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Web    │  │  Mobile  │  │ Desktop  │              │
│  │ (Next.js)│  │  (React  │  │(Electron)│              │
│  │          │  │  Native) │  │          │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼─────────────────────────────────────────────────┐
│              Application Layer (Next.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Pages/App   │  │  API Routes  │  │  Middleware  │  │
│  │              │  │              │  │              │  │
│  │ - UI/UX      │  │ - REST API   │  │ - Auth       │  │
│  │ - Components │  │ - WebSocket  │  │ - Logging    │  │
│  │ - State Mgmt │  │ - Business   │  │ - Rate Limit │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼─────────┐  ┌───────▼──────┐  ┌─────────▼────────┐
│  Data Layer     │  │ Blockchain   │  │  External APIs   │
│                 │  │   Layer      │  │                  │
│ - PostgreSQL    │  │              │  │ - Jupiter        │
│ - Prisma ORM    │  │ - Solana RPC │  │ - Birdeye        │
│ - Redis Cache   │  │ - Wallet     │  │ - CoinGecko      │
│   (optional)    │  │   Adapters   │  │ - DEX APIs       │
└─────────────────┘  └──────────────┘  └──────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Cache**: In-memory (optional Redis)

### Blockchain
- **Network**: Solana
- **Web3 Library**: @solana/web3.js
- **Wallet Adapter**: @solana/wallet-adapter-react
- **Supported Wallets**: Phantom, Solflare, Ledger, Torus, MathWallet

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Vercel Postgres / AWS RDS / Supabase
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics (optional)

---

## Core Components

### 1. Application Layer

#### Next.js App Router
- Server Components for optimal performance
- Client Components for interactivity
- Parallel routes for complex layouts
- Streaming and Suspense for progressive rendering

#### API Routes
```
/api
├── /swap
│   ├── /ultra       # MEV-protected swaps
│   ├── /standard    # Standard swaps
│   ├── /lite        # Fast swaps
│   └── /execute     # Execute swap
├── /tokens
│   ├── /[address]   # Token details
│   └── /batch       # Batch token info
├── /prices
│   ├── /[token]     # Single price
│   └── /history     # Historical data
├── /orders
│   ├── /limit       # Limit orders
│   └── /dca         # DCA orders
└── /auth
    ├── /login       # Authentication
    ├── /refresh     # Token refresh
    └── /logout      # Logout
```

### 2. Data Layer

#### Database Schema
```prisma
model User {
  id         String   @id @default(cuid())
  publicKey  String   @unique
  createdAt  DateTime @default(now())
  orders     Order[]
}

model Order {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // 'limit' | 'dca'
  status      String   // 'active' | 'filled' | 'cancelled'
  inputMint   String
  outputMint  String
  amount      String
  price       Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3. Blockchain Layer

#### Solana Integration
- RPC connection pooling
- Transaction building and signing
- Wallet adapter integration
- On-chain data reading

#### Wallet Support
- Multiple wallet providers
- Unified adapter interface
- Auto-detection
- Mobile wallet support

---

## Design Patterns

### 1. Repository Pattern
```typescript
// Data access abstraction
class TokenRepository {
  async findByAddress(address: string): Promise<Token> {
    return prisma.token.findUnique({ where: { address } });
  }
}
```

### 2. Service Layer
```typescript
// Business logic
class SwapService {
  async getQuote(params: SwapParams): Promise<Quote> {
    // Aggregate from multiple sources
    // Apply MEV protection
    // Calculate optimal route
  }
}
```

### 3. Provider Pattern
```typescript
// Context providers for global state
<WalletProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</WalletProvider>
```

---

## Data Flow

### User Action Flow

```
User Action (Click)
    ↓
Component Handler
    ↓
Custom Hook (useSwap)
    ↓
SDK Client
    ↓
API Route (/api/swap/ultra)
    ↓
Service Layer (SwapService)
    ↓
External APIs (Jupiter, DEXs)
    ↓
Response Processing
    ↓
State Update (Zustand)
    ↓
UI Re-render
```

### Authentication Flow

```
User Connects Wallet
    ↓
Sign Message Request
    ↓
Wallet Signs Message
    ↓
POST /api/auth/login
    ↓
Verify Signature
    ↓
Generate JWT
    ↓
Store Token (localStorage)
    ↓
Include in API Requests
```

---

## State Management

### Global State (Zustand)

```typescript
// Theme Store
interface ThemeState {
  mode: 'dark' | 'dim' | 'day';
  colors: ColorScheme;
  setMode: (mode: string) => void;
}

// Wallet Store
interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
}
```

### Local State (React)
- Component-specific state
- Form state
- UI state (modals, dropdowns)

### Server State (React Query - optional)
- API data caching
- Automatic refetching
- Optimistic updates

---

## Security Architecture

### Authentication
- Wallet signature verification
- JWT tokens (short-lived)
- Refresh tokens (long-lived)
- Token rotation

### API Security
- Rate limiting per user
- Request validation
- SQL injection prevention (Prisma)
- XSS protection (React)
- CSRF protection

### Data Security
- Encrypted database connections
- Environment variable protection
- Secure API key storage
- No client-side secrets

---

## Performance Optimizations

### Frontend
- Code splitting (vendor, Solana libs)
- Image optimization (Next.js Image)
- Component memoization (React.memo)
- Lazy loading
- Suspense boundaries

### Backend
- Database query optimization
- Connection pooling
- Response caching
- CDN usage
- Edge functions

### Bundle Size
```
Vendor: ~200KB (React, Next.js)
Solana: ~150KB (web3.js, adapters)
UI: ~100KB (components, Tailwind)
App: ~50KB (application code)
Total: ~500KB (gzipped: ~150KB)
```

---

## Scalability

### Horizontal Scaling
- Serverless functions (Vercel)
- Database read replicas
- CDN distribution
- API Gateway

### Caching Strategy
- Static pages (CDN)
- API responses (in-memory/Redis)
- Token data (5-60 seconds)
- Price data (10-30 seconds)

### Load Handling
- Rate limiting
- Request queuing
- Graceful degradation
- Circuit breakers

---

## Monitoring & Observability

### Metrics
- API response times
- Error rates
- User activity
- Database performance

### Logging
- Structured logs
- Error tracking (Sentry)
- Performance monitoring
- User analytics

### Alerts
- High error rates
- Slow responses
- System outages
- Security events

---

## Deployment Architecture

### Vercel Deployment
```
GitHub Repository
    ↓
Push to main branch
    ↓
Vercel Build
    ↓
Edge Network Deployment
    ↓
Automatic HTTPS
    ↓
Global CDN
```

### Environment Separation
- Development (localhost)
- Staging (preview deployments)
- Production (main branch)

---

## Related Documentation

- [Component Architecture](COMPONENTS.md) - Component structure
- [Data Flow](DATA_FLOW.md) - Detailed data flow
- [Security Architecture](SECURITY.md) - Security details
- [Database Schema](DATABASE.md) - Database design

---

**Last Updated**: 2025-01-20  
**Version**: 1.0.0
