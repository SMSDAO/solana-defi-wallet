# Database Schema

Complete database schema documentation for the Solana DeFi Wallet application using Prisma ORM with PostgreSQL.

## Overview

The database stores:
- User accounts and authentication
- Orders (limit and DCA)
- Transaction history
- User preferences
- API usage tracking

---

## Schema Definition

### Core Models

#### User

```prisma
model User {
  id            String      @id @default(cuid())
  publicKey     String      @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastLoginAt   DateTime?
  
  // Relationships
  orders        Order[]
  transactions  Transaction[]
  preferences   UserPreference?
  
  @@index([publicKey])
  @@map("users")
}
```

**Fields:**
- `id`: Unique identifier (CUID)
- `publicKey`: Solana wallet address (unique)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
- `lastLoginAt`: Last login timestamp

---

#### Order

```prisma
enum OrderType {
  LIMIT
  DCA
}

enum OrderStatus {
  ACTIVE
  PAUSED
  FILLED
  PARTIALLY_FILLED
  CANCELLED
  EXPIRED
}

model Order {
  id              String       @id @default(cuid())
  userId          String
  type            OrderType
  status          OrderStatus  @default(ACTIVE)
  
  // Token information
  inputMint       String
  outputMint      String
  
  // Order parameters
  inputAmount     String       // Decimal as string to avoid precision issues
  outputAmount    String?
  limitPrice      Float?
  slippage        Float?
  
  // DCA specific
  cycleFrequency  Int?         // Seconds between executions
  numberOfCycles  Int?
  completedCycles Int          @default(0)
  nextExecution   DateTime?
  
  // Execution tracking
  filledAmount    String       @default("0")
  averagePrice    Float?
  
  // Metadata
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  expiresAt       DateTime?
  
  // Relationships
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  executions      OrderExecution[]
  
  @@index([userId, status])
  @@index([status, nextExecution])
  @@map("orders")
}
```

**Order Types:**
- `LIMIT`: Single execution at target price
- `DCA`: Multiple executions over time

**Order Status:**
- `ACTIVE`: Order is active and monitoring
- `PAUSED`: Temporarily paused (DCA only)
- `FILLED`: Completely filled
- `PARTIALLY_FILLED`: Some fills, still active
- `CANCELLED`: Cancelled by user
- `EXPIRED`: Expired before filling

---

#### OrderExecution

```prisma
model OrderExecution {
  id              String    @id @default(cuid())
  orderId         String
  
  // Execution details
  cycle           Int?      // For DCA orders
  inputAmount     String
  outputAmount    String
  executionPrice  Float
  
  // Transaction
  txSignature     String    @unique
  blockTime       DateTime?
  
  // Fees
  platformFee     String?
  networkFee      String?
  
  // Metadata
  executedAt      DateTime  @default(now())
  
  // Relationships
  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([orderId])
  @@index([txSignature])
  @@map("order_executions")
}
```

---

#### Transaction

```prisma
enum TransactionType {
  SWAP
  TRANSFER
  LIMIT_ORDER
  DCA_ORDER
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
}

model Transaction {
  id            String            @id @default(cuid())
  userId        String
  type          TransactionType
  status        TransactionStatus @default(PENDING)
  
  // Transaction details
  signature     String            @unique
  fromToken     String
  toToken       String?
  amount        String
  
  // Metadata
  blockTime     DateTime?
  slot          BigInt?
  fee           String?
  
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  // Relationships
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([signature])
  @@index([status])
  @@map("transactions")
}
```

---

#### UserPreference

```prisma
model UserPreference {
  id                String   @id @default(cuid())
  userId            String   @unique
  
  // Display preferences
  theme             String   @default("dark")
  currency          String   @default("USD")
  
  // Trading preferences
  defaultSlippage   Float    @default(0.5)
  priorityFee       String   @default("medium")
  
  // Notifications
  emailNotifications Boolean @default(false)
  pushNotifications  Boolean @default(true)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relationships
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_preferences")
}
```

---

### Supporting Models

#### ApiUsage

```prisma
model ApiUsage {
  id          String   @id @default(cuid())
  
  // Request details
  endpoint    String
  method      String
  statusCode  Int
  
  // User tracking (nullable for public endpoints)
  userId      String?
  ipAddress   String
  userAgent   String?
  
  // Performance
  responseTime Int     // Milliseconds
  
  timestamp   DateTime @default(now())
  
  @@index([userId, timestamp])
  @@index([endpoint, timestamp])
  @@map("api_usage")
}
```

---

#### Session

```prisma
model Session {
  id            String   @id @default(cuid())
  userId        String
  
  // Token information
  accessToken   String   @unique
  refreshToken  String   @unique
  
  // Metadata
  ipAddress     String
  userAgent     String?
  expiresAt     DateTime
  
  createdAt     DateTime @default(now())
  lastUsedAt    DateTime @default(now())
  
  @@index([userId])
  @@index([accessToken])
  @@index([expiresAt])
  @@map("sessions")
}
```

---

## Relationships

```
User (1) ──────────── (N) Order
User (1) ──────────── (N) Transaction
User (1) ──────────── (1) UserPreference
Order (1) ─────────── (N) OrderExecution
```

---

## Indexes

### Performance Indexes

```prisma
// User lookups
@@index([publicKey])

// Order queries
@@index([userId, status])
@@index([status, nextExecution])

// Transaction history
@@index([userId, createdAt])
@@index([signature])

// API analytics
@@index([endpoint, timestamp])
```

---

## Migrations

### Creating Migrations

```bash
# Create migration
npx prisma migrate dev --name add_orders_table

# Apply migrations
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

### Example Migration

```sql
-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "inputMint" TEXT NOT NULL,
    "outputMint" TEXT NOT NULL,
    "inputAmount" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_userId_status_idx" ON "orders"("userId", "status");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Queries

### Common Queries

#### Get User Orders

```typescript
const orders = await prisma.order.findMany({
  where: {
    userId: user.id,
    status: 'ACTIVE'
  },
  include: {
    executions: {
      orderBy: { executedAt: 'desc' },
      take: 5
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

#### Get User Portfolio

```typescript
const transactions = await prisma.transaction.findMany({
  where: {
    userId: user.id,
    status: 'CONFIRMED'
  },
  orderBy: { blockTime: 'desc' },
  take: 50
});
```

#### Get DCA Orders Due for Execution

```typescript
const dueOrders = await prisma.order.findMany({
  where: {
    type: 'DCA',
    status: 'ACTIVE',
    nextExecution: {
      lte: new Date()
    }
  }
});
```

---

## Data Management

### Backup Strategy

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql

# Automated daily backups
# Add to cron: 0 2 * * * /path/to/backup.sh
```

### Data Retention

```typescript
// Clean old API usage logs (keep 30 days)
await prisma.apiUsage.deleteMany({
  where: {
    timestamp: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
});

// Archive old transactions (keep 1 year)
await prisma.transaction.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    },
    status: 'CONFIRMED'
  }
});
```

---

## Performance Optimization

### Connection Pooling

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Query Optimization

```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    publicKey: true,
    createdAt: true
  }
});

// Use pagination
const orders = await prisma.order.findMany({
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' }
});

// Use aggregation
const stats = await prisma.order.aggregate({
  where: { status: 'FILLED' },
  _count: true,
  _avg: { averagePrice: true }
});
```

---

## Security

### Row-Level Security

```typescript
// Ensure user can only access their own data
async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId } // Always filter by userId
  });
}

// Validate ownership before update
async function updateOrder(orderId: string, userId: string, data: any) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId }
  });
  
  if (!order) {
    throw new Error('Order not found or access denied');
  }
  
  return prisma.order.update({
    where: { id: orderId },
    data
  });
}
```

---

## Monitoring

### Database Metrics

```typescript
// Track slow queries
const startTime = Date.now();
const result = await prisma.user.findMany();
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn(`Slow query: ${duration}ms`);
}

// Monitor connection pool
console.log('Active connections:', await prisma.$queryRaw`
  SELECT count(*) FROM pg_stat_activity
  WHERE datname = current_database()
`);
```

---

## Schema Evolution

### Adding New Fields

```prisma
// Before
model User {
  id        String @id
  publicKey String @unique
}

// After
model User {
  id        String  @id
  publicKey String  @unique
  nickname  String? // New optional field
}
```

```bash
# Generate migration
npx prisma migrate dev --name add_user_nickname
```

### Renaming Fields

```prisma
// Migration SQL
ALTER TABLE "users" RENAME COLUMN "publicKey" TO "wallet_address";
```

---

## Testing

### Test Database

```typescript
// Use separate test database
// .env.test
DATABASE_URL="postgresql://localhost:5432/test_db"

// In tests
beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.order.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Related Documentation

- [Architecture Overview](OVERVIEW.md)
- [Data Flow](DATA_FLOW.md)
- [Security Architecture](SECURITY.md)

---

**Last Updated**: 2025-01-20  
**Database**: PostgreSQL 15+  
**ORM**: Prisma 5+
