# Price API

The Price API aggregates real-time token prices from 22+ DEXs and 40+ swap aggregators on Solana.

## Endpoints

### 1. Get Token Price

**GET** `/api/prices/[token]`

Get current price for a specific token.

#### Parameters

- `token`: Token mint address or symbol (SOL, USDC, etc.)

#### Query Parameters

```typescript
{
  sources?: string;  // Comma-separated sources (default: all)
  convert?: string;  // Convert to currency (USD, EUR, etc.)
}
```

#### Response

```typescript
{
  token: string;
  price: number;
  priceUSD: number;
  sources: Array<{
    name: string;
    price: number;
    timestamp: number;
    confidence: number;
  }>;
  aggregatedPrice: {
    weighted: number;
    median: number;
    mean: number;
  };
  change24h: number;
  volume24h: number;
  lastUpdate: string;
}
```

#### Example

```typescript
const response = await fetch('/api/prices/So11111111111111111111111111111111111111112');
const { price, change24h } = await response.json();
console.log(`SOL: $${price} (${change24h}%)`);
```

---

### 2. Get Multiple Prices

**GET** `/api/prices`

Get prices for multiple tokens in one request.

#### Query Parameters

```typescript
{
  tokens: string;     // Comma-separated addresses or symbols
  sources?: string;   // Comma-separated sources
  convert?: string;   // Currency conversion
}
```

#### Response

```typescript
{
  prices: {
    [token: string]: {
      price: number;
      change24h: number;
      volume24h: number;
      lastUpdate: string;
    };
  };
  timestamp: string;
}
```

#### Example

```typescript
const tokens = 'SOL,USDC,BONK';
const response = await fetch(`/api/prices?tokens=${tokens}&sources=coingecko,birdeye`);
const { prices } = await response.json();

Object.entries(prices).forEach(([token, data]) => {
  console.log(`${token}: $${data.price}`);
});
```

---

### 3. Get Historical Prices

**GET** `/api/prices/[token]/history`

Get historical price data for a token.

#### Query Parameters

```typescript
{
  from: string;       // Start timestamp (ISO 8601)
  to?: string;        // End timestamp (default: now)
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
}
```

#### Response

```typescript
{
  token: string;
  interval: string;
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}
```

#### Example

```typescript
const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const response = await fetch(`/api/prices/SOL/history?from=${from}&interval=1d`);
const { data } = await response.json();
```

---

### 4. Compare Prices Across Sources

**GET** `/api/prices/[token]/compare`

Compare prices across different sources.

#### Response

```typescript
{
  token: string;
  sources: Array<{
    name: string;
    price: number;
    volume: number;
    liquidity: number;
    lastUpdate: number;
  }>;
  spread: {
    absolute: number;
    percentage: number;
    highest: { source: string; price: number };
    lowest: { source: string; price: number };
  };
  recommendation: {
    bestPrice: string;
    bestLiquidity: string;
    safest: string;
  };
}
```

---

## Price Sources

### DEX Sources (On-Chain)
- Raydium
- Orca
- Serum
- Saber
- Mercurial
- Aldrin
- Crema
- Lifinity
- Cykura
- Marinade Finance

### Aggregator Sources (Off-Chain)
- Jupiter
- CoinGecko
- Birdeye
- DexScreener
- CoinMarketCap

### Selection Strategy

The API uses intelligent source selection:

1. **High Confidence**: Multiple sources agree
2. **Volume Weighted**: Prefer high-volume sources
3. **Liquidity Weighted**: Factor in DEX liquidity
4. **Recency**: Prioritize recent prices
5. **Outlier Detection**: Remove suspicious prices

---

## Price Aggregation Methods

### 1. Weighted Average (Default)
```
price = Σ(source_price × source_weight) / Σ(source_weight)
```

Weights based on:
- Trading volume
- Liquidity depth
- Historical accuracy
- Update frequency

### 2. Median Price
Middle value from all sources, resistant to outliers.

### 3. Mean Price
Simple average of all source prices.

---

## WebSocket Price Feeds

Real-time price updates via WebSocket.

```typescript
const ws = new WebSocket('ws://localhost:3000/api/ws');

// Subscribe to price updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'prices',
  tokens: ['SOL', 'USDC', 'BONK'],
  sources: ['birdeye', 'coingecko']
}));

// Handle updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Price update:', update);
  // { token: 'SOL', price: 105.50, change: 0.5, timestamp: '...' }
};

// Unsubscribe
ws.send(JSON.stringify({
  type: 'unsubscribe',
  channel: 'prices'
}));
```

---

## Caching Strategy

Prices are cached with different TTLs:

- **High-volume tokens** (SOL, USDC): 10 seconds
- **Medium-volume tokens**: 30 seconds  
- **Low-volume tokens**: 60 seconds
- **Historical data**: 5 minutes

---

## SDK Usage

```typescript
import { SolanaWalletSDK } from '@/api/sdk';

const sdk = new SolanaWalletSDK();

// Get single price
const solPrice = await sdk.prices.get('SOL');

// Get multiple prices
const prices = await sdk.prices.getMultiple(['SOL', 'USDC', 'BONK']);

// Get historical data
const history = await sdk.prices.getHistory('SOL', {
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  interval: '1d'
});

// Subscribe to real-time updates
sdk.prices.subscribe(['SOL', 'USDC'], (update) => {
  console.log('Price update:', update);
});
```

---

## Rate Limiting

Price API endpoints have specific rate limits:

- **Single price**: 60 requests/minute
- **Multiple prices**: 30 requests/minute
- **Historical data**: 10 requests/minute
- **WebSocket**: Unlimited (with connection limits)

---

## Error Codes

| Code | Description |
|------|-------------|
| `TOKEN_NOT_FOUND` | Token not found in price feeds |
| `SOURCE_UNAVAILABLE` | Requested source is unavailable |
| `INVALID_INTERVAL` | Invalid time interval |
| `INSUFFICIENT_DATA` | Not enough data for the requested period |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Best Practices

1. **Use WebSocket** for real-time price updates
2. **Cache prices** appropriately on the client
3. **Request multiple prices** in batch when possible
4. **Handle source failures** gracefully
5. **Consider price confidence** in decision making
6. **Monitor price spreads** for arbitrage detection
7. **Use historical data** for trend analysis

---

## Price Confidence Levels

Prices include confidence scores (0-100):

- **90-100**: High confidence (multiple sources, high volume)
- **70-89**: Good confidence (2+ sources agree)
- **50-69**: Moderate confidence (limited sources)
- **0-49**: Low confidence (single source or stale data)

---

**Related Documentation:**
- [Token API](TOKEN_API.md) - Token information
- [Swap API](SWAP_API.md) - Token swaps
- [Authentication](AUTHENTICATION.md) - API authentication

**Last Updated**: 2025-01-20
