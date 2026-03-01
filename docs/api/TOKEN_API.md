# Token API

The Token API provides access to a comprehensive token registry with 22,000+ Solana tokens, including metadata, logos, and sensor scoring.

## Endpoints

### 1. List Tokens

**GET** `/api/tokens`

Retrieve a paginated list of tokens with optional filtering and search.

#### Query Parameters

```typescript
{
  search?: string;      // Search by name, symbol, or address
  verified?: boolean;   // Filter verified tokens only
  limit?: number;       // Results per page (default: 50, max: 100)
  page?: number;        // Page number (default: 1)
  sort?: 'name' | 'symbol' | 'volume' | 'marketCap';
  order?: 'asc' | 'desc';
}
```

#### Response

```typescript
{
  data: Array<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    verified: boolean;
    tags?: string[];
    extensions?: {
      coingeckoId?: string;
      discord?: string;
      telegram?: string;
      twitter?: string;
      website?: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

#### Examples

```typescript
// Search for SOL tokens
const response = await fetch('/api/tokens?search=SOL&verified=true&limit=10');
const { data } = await response.json();

// Get all stablecoin tokens
const stablecoins = await fetch('/api/tokens?search=USD&verified=true');

// Paginate through tokens
const page2 = await fetch('/api/tokens?page=2&limit=50');
```

---

### 2. Get Token by Address

**GET** `/api/tokens/[address]`

Get detailed information about a specific token.

#### Parameters

- `address`: Token mint address

#### Response

```typescript
{
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  verified: boolean;
  tags?: string[];
  extensions?: {
    coingeckoId?: string;
    discord?: string;
    telegram?: string;
    twitter?: string;
    website?: string;
    description?: string;
  };
  market?: {
    price: number;
    volume24h: number;
    marketCap: number;
    priceChange24h: number;
  };
  supply?: {
    total: string;
    circulating: string;
  };
  sensorScore?: {
    overall: number;
    liquidity: number;
    volume: number;
    holders: number;
    age: number;
  };
}
```

#### Example

```typescript
const response = await fetch('/api/tokens/So11111111111111111111111111111111111111112');
const solToken = await response.json();
console.log('SOL Price:', solToken.market?.price);
console.log('Sensor Score:', solToken.sensorScore?.overall);
```

---

### 3. Get Token Metadata

**GET** `/api/tokens/[address]/metadata`

Get on-chain metadata for a token.

#### Response

```typescript
{
  mint: string;
  updateAuthority: string;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
  collection?: {
    verified: boolean;
    key: string;
  };
}
```

---

### 4. Get Token Holders

**GET** `/api/tokens/[address]/holders`

Get top holders for a token.

#### Query Parameters

```typescript
{
  limit?: number;  // Number of holders (default: 100, max: 1000)
}
```

#### Response

```typescript
{
  holders: Array<{
    address: string;
    balance: string;
    percentage: number;
    uiAmount: number;
  }>;
  totalHolders: number;
  concentration: {
    top10: number;
    top50: number;
    top100: number;
  };
}
```

---

### 5. Validate Token Address

**GET** `/api/tokens/validate/[address]`

Validate if a token address is valid and exists.

#### Response

```typescript
{
  valid: boolean;
  exists: boolean;
  verified: boolean;
  warnings?: string[];
}
```

#### Example

```typescript
const response = await fetch('/api/tokens/validate/So11111111111111111111111111111111111111112');
const { valid, verified } = await response.json();

if (!verified) {
  console.warn('Token is not verified!');
}
```

---

## Token Tags

Tokens can have multiple tags for categorization:

- `stablecoin` - Stablecoins (USDC, USDT, etc.)
- `wrapped` - Wrapped tokens (wSOL, etc.)
- `lp-token` - Liquidity pool tokens
- `governance` - Governance tokens
- `nft` - NFT-related tokens
- `meme` - Meme tokens
- `community` - Community tokens
- `old-registry` - Deprecated tokens

---

## Sensor Scoring

Tokens are scored across multiple dimensions (0-100):

### Overall Score
Weighted average of all metrics

### Liquidity Score
- DEX liquidity depth
- Number of trading pairs
- Liquidity distribution

### Volume Score
- 24h trading volume
- Volume trend (7d, 30d)
- Volume consistency

### Holders Score
- Total holder count
- Holder distribution
- Growth rate

### Age Score
- Token age
- Historical activity
- Community age

---

## Token Verification

Tokens are verified through:

1. **Community Verification**
   - Manual review by community
   - Social media presence
   - Website verification

2. **Automatic Verification**
   - Trading volume threshold
   - Liquidity requirements
   - Holder count
   - Age requirements

3. **Partnership Verification**
   - Direct partnerships
   - Ecosystem integration
   - Official audits

---

## Batch Operations

### Get Multiple Tokens

**POST** `/api/tokens/batch`

Get information for multiple tokens in one request.

#### Request Body

```typescript
{
  addresses: string[];  // Array of token addresses (max: 100)
}
```

#### Response

```typescript
{
  tokens: Array<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    verified: boolean;
  }>;
}
```

#### Example

```typescript
const response = await fetch('/api/tokens/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    addresses: [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' // USDT
    ]
  })
});

const { tokens } = await response.json();
```

---

## Popular Tokens

Common token addresses for quick reference:

```typescript
const POPULAR_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
};
```

---

## SDK Usage

```typescript
import { SolanaWalletSDK } from '@/api/sdk';

const sdk = new SolanaWalletSDK();

// Search tokens
const tokens = await sdk.tokens.search('SOL', {
  verified: true,
  limit: 10
});

// Get specific token
const solToken = await sdk.tokens.get('So11111111111111111111111111111111111111112');

// Get multiple tokens
const multipleTokens = await sdk.tokens.getBatch([
  'So11111111111111111111111111111111111111112',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
]);

// Validate token
const isValid = await sdk.tokens.validate('So11111111111111111111111111111111111111112');
```

---

## Best Practices

1. **Always check verification status** before displaying tokens to users
2. **Use batch endpoints** when fetching multiple tokens
3. **Cache token metadata** to reduce API calls
4. **Validate addresses** before making transactions
5. **Check sensor scores** for risk assessment
6. **Monitor warnings** for potentially risky tokens

---

## Error Codes

| Code | Description |
|------|-------------|
| `TOKEN_NOT_FOUND` | Token address doesn't exist |
| `INVALID_ADDRESS` | Invalid token mint address |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |
| `INVALID_PARAMS` | Invalid query parameters |

---

**Related Documentation:**
- [Price API](PRICE_API.md) - Token price data
- [Swap API](SWAP_API.md) - Token swaps
- [Authentication](AUTHENTICATION.md) - API authentication

**Last Updated**: 2025-01-20
