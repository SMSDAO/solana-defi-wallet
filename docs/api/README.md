# API Documentation

The Solana DeFi Wallet provides a comprehensive REST API for interacting with Solana blockchain, managing swaps, tokens, prices, and orders.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most API endpoints require JWT authentication. See [Authentication](AUTHENTICATION.md) for details.

## API Categories

### 1. Swap APIs
- [Swap API Documentation](SWAP_API.md)
- Ultra API - MEV protection and advanced features
- Standard API - Common use cases
- Lite API - Optimized for speed

### 2. Token API
- [Token API Documentation](TOKEN_API.md)
- Token registry with 22,000+ tokens
- Token search and filtering
- Token metadata and logos

### 3. Price API
- [Price API Documentation](PRICE_API.md)
- Real-time prices from 22+ DEX
- Multi-source price aggregation
- Historical price data

### 4. Orders API
- [Orders API Documentation](ORDERS_API.md)
- Limit orders
- DCA (Dollar Cost Averaging) orders
- Order management

## Quick Examples

### Get Token Price
```typescript
const response = await fetch('/api/prices/So11111111111111111111111111111111111111112');
const data = await response.json();
console.log(data.price);
```

### Get Swap Quote
```typescript
const response = await fetch('/api/swap/standard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: '1000000000',
    slippage: 0.5
  })
});
const quote = await response.json();
```

### Search Tokens
```typescript
const response = await fetch('/api/tokens?search=SOL&verified=true&limit=50');
const tokens = await response.json();
```

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:
- **Authenticated requests**: 100 requests per minute
- **Unauthenticated requests**: 20 requests per minute

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `INVALID_REQUEST` - Missing or invalid parameters
- `UNAUTHORIZED` - Authentication required
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `NOT_FOUND` - Resource not found

## API Response Format

Successful responses follow this format:

```json
{
  "data": {},
  "meta": {
    "timestamp": "2025-01-20T00:00:00Z",
    "version": "1.0.0"
  }
}
```

## SDK Usage

We provide a TypeScript SDK for easier API integration:

```typescript
import { SolanaWalletSDK } from '@/api/sdk';

const sdk = new SolanaWalletSDK({
  baseUrl: 'http://localhost:3000/api',
  apiKey: 'your-api-key'
});

// Get swap quote
const quote = await sdk.swap.getQuote({
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: '1000000000',
  mode: 'standard'
});

// Get token info
const token = await sdk.tokens.get('So11111111111111111111111111111111111111112');

// Get prices
const prices = await sdk.prices.getMultiple(['SOL', 'USDC', 'BONK']);
```

## Pagination

List endpoints support pagination:

```
GET /api/tokens?page=1&limit=50
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 22000,
    "hasMore": true
  }
}
```

## WebSocket Support

Real-time updates available via WebSocket:

```typescript
const ws = new WebSocket('ws://localhost:3000/api/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price update:', data);
};

// Subscribe to token prices
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'prices',
  tokens: ['SOL', 'USDC']
}));
```

## API Versioning

The API is versioned via the URL path:

```
/api/v1/swap/standard
/api/v2/swap/standard
```

Current version: `v1` (default, no version prefix needed)

## Next Steps

- [Swap API](SWAP_API.md) - Detailed swap endpoint documentation
- [Token API](TOKEN_API.md) - Token registry and search
- [Price API](PRICE_API.md) - Price aggregation
- [Orders API](ORDERS_API.md) - Limit and DCA orders
- [Authentication](AUTHENTICATION.md) - JWT authentication details

---

**Last Updated**: 2025-01-20  
**API Version**: 1.0.0
