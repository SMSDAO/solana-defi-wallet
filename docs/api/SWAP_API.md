# Swap API

The Swap API provides three modes for token swapping on Solana, each optimized for different use cases.

## Endpoints

### 1. Ultra API - MEV Protection

**POST** `/api/swap/ultra`

Advanced swap API with MEV protection, dynamic slippage, and priority fees.

#### Request Body

```typescript
{
  inputMint: string;        // Input token mint address
  outputMint: string;       // Output token mint address
  amount: string;           // Amount in base units (lamports)
  mevProtection?: boolean;  // Enable MEV protection (default: true)
  dynamicSlippage?: boolean;// Auto-calculate slippage (default: true)
  priorityFee?: 'low' | 'medium' | 'high' | 'auto'; // Transaction priority
  slippage?: number;        // Manual slippage (0-100, default: 0.5)
  userPublicKey?: string;   // User's wallet address
}
```

#### Response

```typescript
{
  quote: {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    price: number;
    priceImpact: number;
    marketPrice: number;
    slippageAdjusted: number;
  };
  route: {
    marketInfos: Array<{
      id: string;
      label: string;
      inputMint: string;
      outputMint: string;
      notEnoughLiquidity: boolean;
      inAmount: string;
      outAmount: string;
      priceImpactPct: number;
      lpFee: { amount: string; mint: string; pct: number };
      platformFee: { amount: string; mint: string; pct: number };
    }>;
  };
  mevProtection: {
    enabled: boolean;
    protectionLevel: 'high' | 'medium' | 'low';
    estimatedSavings: string;
  };
  priorityFee: {
    level: string;
    computeUnits: number;
    microLamports: number;
  };
  estimatedGas: string;
  minimumReceived: string;
}
```

#### Example

```typescript
const response = await fetch('/api/swap/ultra', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputMint: 'So11111111111111111111111111111111111111112', // SOL
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    amount: '1000000000', // 1 SOL
    mevProtection: true,
    dynamicSlippage: true,
    priorityFee: 'high'
  })
});

const data = await response.json();
console.log('Quote:', data.quote);
console.log('MEV Protection:', data.mevProtection);
```

---

### 2. Standard API

**POST** `/api/swap/standard`

Standard swap API for common use cases with manual slippage control.

#### Request Body

```typescript
{
  inputMint: string;    // Input token mint address
  outputMint: string;   // Output token mint address
  amount: string;       // Amount in base units
  slippage?: number;    // Slippage tolerance (0-100, default: 0.5)
  userPublicKey?: string;
}
```

#### Response

```typescript
{
  quote: {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    price: number;
    priceImpact: number;
  };
  route: {
    marketInfos: Array<{ /* market info */ }>;
  };
  estimatedGas: string;
  minimumReceived: string;
}
```

#### Example

```typescript
const response = await fetch('/api/swap/standard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: '1000000000',
    slippage: 1.0
  })
});

const quote = await response.json();
```

---

### 3. Lite API

**POST** `/api/swap/lite`

Lightweight API optimized for speed with minimal response data.

#### Request Body

```typescript
{
  inputMint: string;    // Input token mint address
  outputMint: string;   // Output token mint address
  amount: string;       // Amount in base units
}
```

#### Response

```typescript
{
  inAmount: string;
  outAmount: string;
  price: number;
  priceImpact: number;
  minimumReceived: string;
}
```

#### Example

```typescript
const response = await fetch('/api/swap/lite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: '1000000000'
  })
});

const quote = await response.json();
console.log('Expected output:', quote.outAmount);
```

---

## Execute Swap

**POST** `/api/swap/execute`

Execute a swap transaction.

#### Request Body

```typescript
{
  quote: object;            // Quote from any swap API
  userPublicKey: string;    // User's wallet address
  signedTransaction: string;// Base64 encoded signed transaction
}
```

#### Response

```typescript
{
  signature: string;        // Transaction signature
  status: 'pending' | 'confirmed' | 'failed';
  confirmationTime?: number;
  error?: string;
}
```

---

## Aggregator Sources

The Swap APIs aggregate routes from multiple DEXs:

- Jupiter
- Raydium
- Orca
- Serum
- Saber
- Mercurial
- Aldrin
- Crema
- Lifinity
- Cykura
- And 12+ more

---

## Slippage Calculation

### Manual Slippage
Set a fixed slippage percentage:

```typescript
slippage: 0.5  // 0.5%
slippage: 1.0  // 1.0%
slippage: 2.0  // 2.0%
```

### Dynamic Slippage (Ultra API only)
Automatically calculated based on:
- Token liquidity
- Market volatility
- Route complexity
- Historical slippage data

---

## MEV Protection (Ultra API only)

MEV (Maximal Extractable Value) protection helps prevent:
- **Front-running**: Transactions placed before yours
- **Sandwich attacks**: Your trade sandwiched between two malicious trades
- **Back-running**: Transactions immediately after yours

### Protection Levels

**High Protection**
- Private mempool submission
- Transaction ordering guarantees
- Monitoring for suspicious activity

**Medium Protection**
- Basic mempool privacy
- Standard ordering

**Low Protection**
- Minimal protections
- Faster execution

---

## Priority Fees

Control transaction priority with compute budget:

```typescript
priorityFee: 'low'    // Standard priority, lower fees
priorityFee: 'medium' // Moderate priority, balanced
priorityFee: 'high'   // High priority, faster confirmation
priorityFee: 'auto'   // Automatically determined
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_LIQUIDITY` | Not enough liquidity for swap |
| `SLIPPAGE_EXCEEDED` | Slippage tolerance exceeded |
| `INVALID_AMOUNT` | Invalid input amount |
| `INVALID_MINT` | Invalid token mint address |
| `ROUTE_NOT_FOUND` | No route found for swap |
| `TIMEOUT` | Request timeout |

---

## Best Practices

1. **Always validate token addresses** before swapping
2. **Use appropriate slippage** based on token liquidity
3. **Enable MEV protection** for large trades (Ultra API)
4. **Set priority fees** during network congestion
5. **Monitor transaction status** after execution
6. **Handle errors gracefully** with retry logic

---

## SDK Usage

```typescript
import { SolanaWalletSDK } from '@/api/sdk';

const sdk = new SolanaWalletSDK();

// Ultra swap with all features
const ultraQuote = await sdk.swap.getUltraQuote({
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: '1000000000',
  mevProtection: true,
  dynamicSlippage: true,
  priorityFee: 'high'
});

// Standard swap
const standardQuote = await sdk.swap.getStandardQuote({
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: '1000000000',
  slippage: 0.5
});

// Lite swap for quick quotes
const liteQuote = await sdk.swap.getLiteQuote({
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: '1000000000'
});
```

---

**Related Documentation:**
- [Token API](TOKEN_API.md) - Token information
- [Price API](PRICE_API.md) - Price data
- [Authentication](AUTHENTICATION.md) - API authentication

**Last Updated**: 2025-01-20
