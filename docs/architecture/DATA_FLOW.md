# Data Flow

Comprehensive documentation of data flow patterns in the Solana DeFi Wallet application.

## Overview

The application uses multiple data flow patterns depending on the type of data and operation:

1. **Unidirectional Data Flow** - React state and props
2. **Global State** - Zustand stores
3. **Server State** - API data with caching
4. **Blockchain State** - Solana on-chain data

---

## Data Flow Patterns

### 1. User Action Flow

```
┌──────────────┐
│ User Action  │ (Click, Type, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Component   │ (Event Handler)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Custom Hook  │ (useSwap, useWallet, etc.)
└──────┬───────┘
       │
       ├──────► Local State Update (if UI-only)
       │
       ├──────► Global State Update (Zustand)
       │
       └──────► API Call
                  │
                  ▼
           ┌──────────────┐
           │  API Route   │ (/api/swap/ultra)
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │Service Layer │ (SwapService)
           └──────┬───────┘
                  │
                  ├──────► Database (Prisma)
                  │
                  └──────► External APIs
                            │
                            ▼
                     ┌──────────────┐
                     │   Response   │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ State Update │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  UI Re-render│
                     └──────────────┘
```

---

## State Management

### Local Component State

Used for UI-specific state that doesn't need to be shared.

```typescript
export function SwapInterface() {
  // Local state
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);

  // UI logic only affects this component
  const handleAmountChange = (value: string) => {
    setAmount(value);
    // No external state changes
  };
}
```

**Use Cases:**
- Form inputs
- Modal open/closed state
- Loading indicators
- Error messages (component-specific)

---

### Global State (Zustand)

Shared state across multiple components.

```typescript
// Theme Store
interface ThemeState {
  mode: 'dark' | 'dim' | 'day';
  colors: ColorScheme;
  setMode: (mode: string) => void;
  setColors: (colors: ColorScheme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  colors: defaultColors,
  setMode: (mode) => set({ mode }),
  setColors: (colors) => set({ colors }),
}));

// Usage in components
function ThemeSwitcher() {
  const { mode, setMode } = useThemeStore();
  return <button onClick={() => setMode('day')}>Day Mode</button>;
}

function ThemedComponent() {
  const colors = useThemeStore(state => state.colors);
  return <div style={{ color: colors.primary }}>Themed Text</div>;
}
```

**Use Cases:**
- Theme preferences
- Wallet connection state
- User preferences
- UI state shared across routes

---

### Server State

Data fetched from APIs with caching and revalidation.

```typescript
// Custom hook for server state
export function useTokenPrice(tokenAddress: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      try {
        setLoading(true);
        const response = await fetch(`/api/prices/${tokenAddress}`);
        const data = await response.json();
        
        if (!cancelled) {
          setPrice(data.price);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrice();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tokenAddress]);

  return { price, loading, error };
}
```

**Use Cases:**
- Token prices
- Token metadata
- Portfolio data
- Order history

---

## API Data Flow

### Request Flow

```typescript
// 1. Component initiates request
function SwapButton() {
  const handleSwap = async () => {
    // 2. Call API through SDK
    const quote = await sdk.swap.getQuote({
      inputMint: 'SOL',
      outputMint: 'USDC',
      amount: '1000000000'
    });

    // 3. Update UI with response
    setQuote(quote);
  };
}

// SDK implementation
class SwapAPI {
  async getQuote(params: SwapParams): Promise<Quote> {
    // 4. Make HTTP request
    const response = await this.client.post('/swap/standard', params);
    
    // 5. Return processed data
    return response.data;
  }
}

// API Route handler
export async function POST(request: Request) {
  // 6. Parse request
  const params = await request.json();
  
  // 7. Call service layer
  const quote = await swapService.getQuote(params);
  
  // 8. Return response
  return Response.json(quote);
}

// Service layer
class SwapService {
  async getQuote(params: SwapParams): Promise<Quote> {
    // 9. Call external APIs
    const quotes = await Promise.all([
      jupiterAPI.getQuote(params),
      raydiumAPI.getQuote(params),
      // ... more sources
    ]);
    
    // 10. Aggregate and process
    return this.aggregateQuotes(quotes);
  }
}
```

---

### Response Caching

```typescript
// In-memory cache
const cache = new Map<string, CachedData>();

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60000 // 60 seconds
): Promise<T> {
  const cached = cache.get(key);
  
  // Return cached data if fresh
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  
  // Fetch new data
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  
  return data;
}

// Usage in API route
export async function GET(request: Request) {
  const token = request.url.split('/').pop();
  
  const price = await getCachedData(
    `price:${token}`,
    () => fetchPriceFromSources(token),
    30000 // 30 second cache
  );
  
  return Response.json({ price });
}
```

---

## Blockchain Data Flow

### Reading On-Chain Data

```typescript
// Connection to Solana
const connection = new Connection(RPC_ENDPOINT);

// Read account data
async function getTokenBalance(
  walletAddress: string,
  tokenMint: string
): Promise<number> {
  // 1. Get associated token account
  const ata = await getAssociatedTokenAddress(
    new PublicKey(tokenMint),
    new PublicKey(walletAddress)
  );
  
  // 2. Fetch account info
  const accountInfo = await connection.getTokenAccountBalance(ata);
  
  // 3. Return balance
  return accountInfo.value.uiAmount || 0;
}

// In component
function Portfolio() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (publicKey) {
      getTokenBalance(
        publicKey.toBase58(),
        SOL_MINT
      ).then(setBalance);
    }
  }, [publicKey]);

  return <div>Balance: {balance} SOL</div>;
}
```

---

### Transaction Flow

```typescript
// 1. Build transaction
async function buildSwapTransaction(
  params: SwapParams
): Promise<Transaction> {
  const transaction = new Transaction();
  
  // Add swap instructions
  transaction.add(
    await createSwapInstruction(params)
  );
  
  return transaction;
}

// 2. Sign transaction
async function signTransaction(
  transaction: Transaction,
  wallet: WalletAdapter
): Promise<Transaction> {
  const signed = await wallet.signTransaction(transaction);
  return signed;
}

// 3. Send transaction
async function sendTransaction(
  transaction: Transaction
): Promise<string> {
  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  );
  
  return signature;
}

// 4. Confirm transaction
async function confirmTransaction(
  signature: string
): Promise<void> {
  await connection.confirmTransaction(signature, 'confirmed');
}

// Complete flow
async function executeSwap(params: SwapParams) {
  try {
    // Build
    const tx = await buildSwapTransaction(params);
    
    // Sign
    const signed = await signTransaction(tx, wallet);
    
    // Send
    const signature = await sendTransaction(signed);
    
    // Wait for confirmation
    await confirmTransaction(signature);
    
    // Update UI
    toast.success('Swap successful!');
  } catch (error) {
    toast.error('Swap failed');
  }
}
```

---

## Real-Time Data

### WebSocket Connections

```typescript
// Price feed WebSocket
class PriceFeed {
  private ws: WebSocket | null = null;
  private subscriptions = new Set<string>();

  connect() {
    this.ws = new WebSocket('wss://api.example.com/prices');
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handlePriceUpdate(update);
    };
  }

  subscribe(token: string) {
    this.subscriptions.add(token);
    this.ws?.send(JSON.stringify({
      type: 'subscribe',
      token
    }));
  }

  unsubscribe(token: string) {
    this.subscriptions.delete(token);
    this.ws?.send(JSON.stringify({
      type: 'unsubscribe',
      token
    }));
  }

  private handlePriceUpdate(update: PriceUpdate) {
    // Emit to subscribers
    eventEmitter.emit('price-update', update);
  }
}

// Usage in component
function TokenPrice({ token }: { token: string }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    priceFeed.subscribe(token);
    
    const handler = (update: PriceUpdate) => {
      if (update.token === token) {
        setPrice(update.price);
      }
    };
    
    eventEmitter.on('price-update', handler);
    
    return () => {
      priceFeed.unsubscribe(token);
      eventEmitter.off('price-update', handler);
    };
  }, [token]);

  return <div>${price}</div>;
}
```

---

## Event System

### Custom Events

```typescript
// Event emitter
class EventEmitter {
  private events = new Map<string, Set<Function>>();

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  off(event: string, handler: Function) {
    this.events.get(event)?.delete(handler);
  }

  emit(event: string, data: any) {
    this.events.get(event)?.forEach(handler => handler(data));
  }
}

export const appEvents = new EventEmitter();

// Usage
appEvents.on('wallet-connected', (publicKey) => {
  console.log('Wallet connected:', publicKey);
});

appEvents.emit('wallet-connected', publicKey);
```

---

## Data Synchronization

### Optimistic Updates

```typescript
async function createOrder(order: OrderParams) {
  // 1. Optimistically update UI
  const tempId = generateTempId();
  const optimisticOrder = { ...order, id: tempId, status: 'pending' };
  addOrderToUI(optimisticOrder);

  try {
    // 2. Send to server
    const createdOrder = await api.post('/orders/limit', order);
    
    // 3. Replace optimistic order with real data
    replaceOrder(tempId, createdOrder);
  } catch (error) {
    // 4. Rollback on error
    removeOrderFromUI(tempId);
    toast.error('Failed to create order');
  }
}
```

---

### Polling vs WebSocket

**Polling** - Simple, works everywhere:
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetchData();
    setData(data);
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

**WebSocket** - Real-time, more efficient:
```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setData(data);
  };

  return () => ws.close();
}, []);
```

---

## Error Handling

### Error Boundary Flow

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

## Performance Optimization

### Request Deduplication

```typescript
const pendingRequests = new Map<string, Promise<any>>();

async function fetchWithDedup<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Return existing promise if pending
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Create new promise
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Usage
const data1 = await fetchWithDedup('user:123', () => fetchUser('123'));
const data2 = await fetchWithDedup('user:123', () => fetchUser('123'));
// Only one request is made
```

---

## Related Documentation

- [Architecture Overview](OVERVIEW.md)
- [Component Architecture](COMPONENTS.md)
- [Security Architecture](SECURITY.md)

---

**Last Updated**: 2025-01-20
