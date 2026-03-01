# Orders API

The Orders API provides functionality for creating and managing limit orders and DCA (Dollar Cost Averaging) orders on Solana.

## Authentication Required

All Orders API endpoints require JWT authentication. See [Authentication](AUTHENTICATION.md).

---

## Limit Orders

### 1. Create Limit Order

**POST** `/api/orders/limit`

Create a new limit order.

#### Request Body

```typescript
{
  inputMint: string;       // Input token address
  outputMint: string;      // Output token address
  inputAmount: string;     // Amount to swap (base units)
  limitPrice: number;      // Target price
  expiry?: number;         // Expiry timestamp (optional)
  userPublicKey: string;   // User wallet address
}
```

#### Response

```typescript
{
  orderId: string;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  limitPrice: number;
  currentPrice: number;
  filledAmount: string;
  remainingAmount: string;
  expiry?: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Example

```typescript
const response = await fetch('/api/orders/limit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    inputAmount: '1000000000',
    limitPrice: 110.0,
    userPublicKey: 'YourWalletAddress...'
  })
});

const order = await response.json();
console.log('Order ID:', order.orderId);
```

---

### 2. Get Limit Orders

**GET** `/api/orders/limit`

Get user's limit orders with optional filtering.

#### Query Parameters

```typescript
{
  status?: 'active' | 'filled' | 'cancelled' | 'expired' | 'all';
  page?: number;
  limit?: number;
}
```

#### Response

```typescript
{
  orders: Array<{
    orderId: string;
    status: string;
    inputMint: string;
    outputMint: string;
    inputAmount: string;
    limitPrice: number;
    currentPrice: number;
    filledAmount: string;
    remainingAmount: string;
    expiry?: number;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

---

### 3. Get Specific Limit Order

**GET** `/api/orders/limit/[id]`

Get details of a specific limit order.

#### Response

```typescript
{
  orderId: string;
  status: string;
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  limitPrice: number;
  currentPrice: number;
  priceHistory: Array<{
    timestamp: number;
    price: number;
  }>;
  fills: Array<{
    timestamp: number;
    amount: string;
    price: number;
    txSignature: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

### 4. Cancel Limit Order

**DELETE** `/api/orders/limit/[id]`

Cancel an active limit order.

#### Response

```typescript
{
  orderId: string;
  status: 'cancelled';
  refundAmount: string;
  refundTxSignature: string;
  cancelledAt: string;
}
```

---

## DCA Orders

Dollar Cost Averaging orders allow automated recurring purchases.

### 1. Create DCA Order

**POST** `/api/orders/dca`

Create a new DCA order.

#### Request Body

```typescript
{
  inputMint: string;       // Input token address
  outputMint: string;      // Output token address
  amountPerCycle: string;  // Amount per purchase (base units)
  cycleFrequency: number;  // Frequency in seconds
  numberOfCycles: number;  // Total number of purchases
  startTime?: number;      // Start timestamp (default: now)
  slippage?: number;       // Slippage tolerance (default: 1%)
  userPublicKey: string;   // User wallet address
}
```

#### Response

```typescript
{
  orderId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  inputMint: string;
  outputMint: string;
  amountPerCycle: string;
  cycleFrequency: number;
  numberOfCycles: number;
  completedCycles: number;
  nextExecutionTime: number;
  totalInvested: string;
  averagePrice: number;
  createdAt: string;
}
```

#### Example

```typescript
const response = await fetch('/api/orders/dca', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    outputMint: 'So11111111111111111111111111111111111111112', // SOL
    amountPerCycle: '100000000', // 100 USDC
    cycleFrequency: 86400, // Daily (24h)
    numberOfCycles: 30, // 30 days
    userPublicKey: 'YourWalletAddress...'
  })
});

const dcaOrder = await response.json();
console.log('DCA Order ID:', dcaOrder.orderId);
```

---

### 2. Get DCA Orders

**GET** `/api/orders/dca`

Get user's DCA orders.

#### Query Parameters

```typescript
{
  status?: 'active' | 'paused' | 'completed' | 'cancelled' | 'all';
  page?: number;
  limit?: number;
}
```

#### Response

```typescript
{
  orders: Array<{
    orderId: string;
    status: string;
    inputMint: string;
    outputMint: string;
    amountPerCycle: string;
    cycleFrequency: number;
    numberOfCycles: number;
    completedCycles: number;
    nextExecutionTime: number;
    totalInvested: string;
    averagePrice: number;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

---

### 3. Get Specific DCA Order

**GET** `/api/orders/dca/[id]`

Get details of a specific DCA order.

#### Response

```typescript
{
  orderId: string;
  status: string;
  inputMint: string;
  outputMint: string;
  amountPerCycle: string;
  cycleFrequency: number;
  numberOfCycles: number;
  completedCycles: number;
  nextExecutionTime: number;
  totalInvested: string;
  totalReceived: string;
  averagePrice: number;
  executions: Array<{
    cycle: number;
    timestamp: number;
    amountIn: string;
    amountOut: string;
    price: number;
    txSignature: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

### 4. Pause DCA Order

**PATCH** `/api/orders/dca/[id]/pause`

Pause an active DCA order.

#### Response

```typescript
{
  orderId: string;
  status: 'paused';
  pausedAt: string;
}
```

---

### 5. Resume DCA Order

**PATCH** `/api/orders/dca/[id]/resume`

Resume a paused DCA order.

#### Response

```typescript
{
  orderId: string;
  status: 'active';
  nextExecutionTime: number;
  resumedAt: string;
}
```

---

### 6. Cancel DCA Order

**DELETE** `/api/orders/dca/[id]`

Cancel a DCA order.

#### Response

```typescript
{
  orderId: string;
  status: 'cancelled';
  completedCycles: number;
  refundAmount: string;
  refundTxSignature?: string;
  cancelledAt: string;
}
```

---

## Order Status

### Limit Orders
- `active` - Order is active and monitoring price
- `filled` - Order has been completely filled
- `partially_filled` - Order is partially filled
- `cancelled` - Order was cancelled by user
- `expired` - Order expired before filling

### DCA Orders
- `active` - Order is running
- `paused` - Order is temporarily paused
- `completed` - All cycles completed
- `cancelled` - Order was cancelled by user

---

## SDK Usage

```typescript
import { SolanaWalletSDK } from '@/api/sdk';

const sdk = new SolanaWalletSDK({
  apiKey: 'your-jwt-token'
});

// Create limit order
const limitOrder = await sdk.orders.createLimit({
  inputMint: 'SOL',
  outputMint: 'USDC',
  inputAmount: '1000000000',
  limitPrice: 110.0,
  userPublicKey: 'YourAddress...'
});

// Get limit orders
const limitOrders = await sdk.orders.getLimitOrders({
  status: 'active'
});

// Cancel limit order
await sdk.orders.cancelLimit('order-id');

// Create DCA order
const dcaOrder = await sdk.orders.createDCA({
  inputMint: 'USDC',
  outputMint: 'SOL',
  amountPerCycle: '100000000',
  cycleFrequency: 86400,
  numberOfCycles: 30,
  userPublicKey: 'YourAddress...'
});

// Pause DCA order
await sdk.orders.pauseDCA('order-id');

// Resume DCA order
await sdk.orders.resumeDCA('order-id');
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `ORDER_NOT_FOUND` | Order doesn't exist |
| `INSUFFICIENT_BALANCE` | Not enough balance for order |
| `INVALID_PRICE` | Invalid limit price |
| `INVALID_FREQUENCY` | Invalid cycle frequency |
| `ORDER_ALREADY_FILLED` | Order is already filled |
| `ORDER_EXPIRED` | Order has expired |
| `CANNOT_MODIFY` | Order cannot be modified in current state |

---

## Best Practices

1. **Set reasonable expiry times** for limit orders
2. **Monitor order status** regularly
3. **Use appropriate slippage** for DCA orders
4. **Consider gas costs** for frequent DCA cycles
5. **Pause DCA orders** during high volatility if needed
6. **Cancel unfilled orders** to release locked funds
7. **Track average price** for DCA orders

---

**Related Documentation:**
- [Swap API](SWAP_API.md) - Token swaps
- [Token API](TOKEN_API.md) - Token information
- [Authentication](AUTHENTICATION.md) - API authentication

**Last Updated**: 2025-01-20
