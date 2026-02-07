# Component Architecture

Detailed documentation of the component structure and organization in the Solana DeFi Wallet.

## Overview

The application follows a component-based architecture with clear separation of concerns and reusable UI elements.

## Component Hierarchy

```
src/components/
├── wallet/          # Wallet-related components
├── swap/            # Swap interface components
├── tokens/          # Token list and details
├── portfolio/       # Portfolio management
├── theme/           # Theme management
├── ui/              # Reusable UI components
└── ErrorBoundary.tsx
```

---

## Core Components

### 1. Wallet Components

#### WalletProvider
**Location:** `src/components/wallet/WalletProvider.tsx`

Provides Solana wallet adapter context to the entire application.

```typescript
interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // ... more wallets
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletAdapterProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletAdapterProvider>
    </ConnectionProvider>
  );
}
```

**Features:**
- Multi-wallet support
- Auto-connect functionality
- Connection error handling
- Wallet modal integration

---

#### WalletButton
**Location:** `src/components/wallet/WalletButton.tsx`

Button for connecting/disconnecting wallet with visual feedback.

```typescript
interface WalletButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export function WalletButton({ className, variant = 'default' }: WalletButtonProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <button
      onClick={connected ? disconnect : () => setVisible(true)}
      className={cn(styles.button, className)}
    >
      {connected ? (
        <>
          <WalletIcon />
          {formatAddress(publicKey)}
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
```

**Features:**
- Connection status display
- Address formatting
- Disconnect functionality
- Responsive design

---

### 2. Swap Components

#### SwapInterface
**Location:** `src/components/swap/SwapInterface.tsx`

Main swap interface with token selection and amount input.

```typescript
interface SwapInterfaceProps {
  mode?: 'ultra' | 'standard' | 'lite';
}

export function SwapInterface({ mode = 'standard' }: SwapInterfaceProps) {
  const [inputToken, setInputToken] = useState<Token | null>(null);
  const [outputToken, setOutputToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);

  return (
    <GlowCard>
      <TokenSelect 
        value={inputToken}
        onChange={setInputToken}
        label="From"
      />
      
      <AmountInput
        value={amount}
        onChange={setAmount}
        token={inputToken}
      />
      
      <SwapButton onClick={handleSwap} />
      
      {quote && <QuoteDisplay quote={quote} />}
    </GlowCard>
  );
}
```

**Features:**
- Token selection
- Amount input with validation
- Quote display
- Swap execution
- Error handling

---

#### TokenSelect
**Location:** `src/components/swap/TokenSelect.tsx`

Token selector with search and favorites.

```typescript
interface TokenSelectProps {
  value: Token | null;
  onChange: (token: Token) => void;
  label: string;
  exclude?: string[];
}

export function TokenSelect({ value, onChange, label, exclude }: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { tokens, loading } = useTokens({ search, exclude });

  return (
    <div>
      <label>{label}</label>
      <button onClick={() => setOpen(true)}>
        {value ? (
          <TokenDisplay token={value} />
        ) : (
          'Select Token'
        )}
      </button>
      
      <Modal open={open} onClose={() => setOpen(false)}>
        <SearchInput value={search} onChange={setSearch} />
        <TokenList 
          tokens={tokens}
          onSelect={(token) => {
            onChange(token);
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
```

**Features:**
- Search functionality
- Popular tokens
- Recent selections
- Token metadata display

---

### 3. Token Components

#### TokenList
**Location:** `src/components/tokens/TokenList.tsx`

Displays list of tokens with search and filtering.

```typescript
interface TokenListProps {
  onSelect?: (token: Token) => void;
  filter?: 'all' | 'verified' | 'favorites';
}

export function TokenList({ onSelect, filter = 'all' }: TokenListProps) {
  const [search, setSearch] = useState('');
  const { tokens, loading } = useTokens({ search, verified: filter === 'verified' });

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      
      <div className="token-grid">
        {tokens.map(token => (
          <TokenCard
            key={token.address}
            token={token}
            onClick={() => onSelect?.(token)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

#### TokenCard
**Location:** `src/components/tokens/TokenCard.tsx`

Individual token display card.

```typescript
interface TokenCardProps {
  token: Token;
  onClick?: () => void;
  showPrice?: boolean;
}

export const TokenCard = memo(function TokenCard({ 
  token, 
  onClick,
  showPrice = true 
}: TokenCardProps) {
  const { price, change24h } = useTokenPrice(token.address);

  return (
    <GlowCard onClick={onClick} hover>
      <div className="flex items-center gap-3">
        <TokenLogo src={token.logoURI} alt={token.name} />
        
        <div>
          <h3>{token.symbol}</h3>
          <p className="text-sm text-gray-500">{token.name}</p>
        </div>
        
        {showPrice && price && (
          <div className="ml-auto">
            <p>${price.toFixed(4)}</p>
            <PriceChange value={change24h} />
          </div>
        )}
      </div>
    </GlowCard>
  );
});
```

---

### 4. Portfolio Components

#### Portfolio
**Location:** `src/components/portfolio/Portfolio.tsx`

Displays user's token holdings and portfolio value.

```typescript
export function Portfolio() {
  const { publicKey } = useWallet();
  const { holdings, totalValue, loading } = usePortfolio(publicKey);

  if (!publicKey) {
    return <ConnectWalletPrompt />;
  }

  return (
    <GlowCard>
      <h2>Portfolio</h2>
      
      <TotalValue value={totalValue} />
      
      <HoldingsList holdings={holdings} loading={loading} />
    </GlowCard>
  );
}
```

---

### 5. UI Components

#### GlowCard
**Location:** `src/components/ui/GlowCard.tsx`

Container with glow effects and animations.

```typescript
interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
  hover?: boolean;
}

export const GlowCard = memo(function GlowCard({
  children,
  className,
  glowColor,
  intensity = 'medium',
  hover = false
}: GlowCardProps) {
  const colors = useThemeStore(state => state.colors);
  const finalGlowColor = glowColor || colors?.glow || '#0ea5e9';
  
  return (
    <motion.div
      className={cn('glow-card', className)}
      style={{
        '--glow-color': finalGlowColor,
        '--glow-intensity': intensityMap[intensity]
      }}
      whileHover={hover ? { scale: 1.02 } : undefined}
    >
      {children}
    </motion.div>
  );
});
```

**Variants:**
- `intensity`: Controls glow strength
- `hover`: Enable hover animations
- `glowColor`: Custom glow color

---

#### NeonText
**Location:** `src/components/ui/NeonText.tsx`

Text with neon glow effect.

```typescript
interface NeonTextProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export const NeonText = memo(function NeonText({
  children,
  className,
  glowColor,
  size = 'md',
  animate = false,
  as: Component = 'span'
}: NeonTextProps) {
  const colors = useThemeStore(state => state.colors);
  
  return (
    <Component
      className={cn('neon-text', sizeClasses[size], className)}
      style={{ '--neon-color': glowColor || colors?.glow }}
    >
      {children}
    </Component>
  );
});
```

---

### 6. Theme Components

#### ThemeProvider
**Location:** `src/components/theme/ThemeProvider.tsx`

Applies theme to the application.

```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, colors } = useThemeStore();

  useEffect(() => {
    // Apply CSS variables
    Object.entries(colors || {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply theme class
    document.documentElement.className = mode;
  }, [mode, colors]);

  return <>{children}</>;
}
```

---

#### ThemeSwitcher
**Location:** `src/components/theme/ThemeSwitcher.tsx`

Toggle between theme modes.

```typescript
export function ThemeSwitcher() {
  const { mode, setMode } = useThemeStore();
  
  const themes = [
    { value: 'dark', icon: MoonIcon, label: 'Dark' },
    { value: 'dim', icon: CloudIcon, label: 'Dim' },
    { value: 'day', icon: SunIcon, label: 'Day' }
  ];

  return (
    <div className="theme-switcher">
      {themes.map(theme => (
        <button
          key={theme.value}
          onClick={() => setMode(theme.value)}
          className={mode === theme.value ? 'active' : ''}
        >
          <theme.icon />
          <span>{theme.label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## Component Patterns

### 1. Compound Components

Used for complex components with multiple parts:

```typescript
export const TokenSelect = Object.assign(TokenSelectBase, {
  Trigger: TokenSelectTrigger,
  Content: TokenSelectContent,
  Item: TokenSelectItem
});

// Usage
<TokenSelect>
  <TokenSelect.Trigger />
  <TokenSelect.Content>
    <TokenSelect.Item token={sol} />
    <TokenSelect.Item token={usdc} />
  </TokenSelect.Content>
</TokenSelect>
```

### 2. Render Props

For flexible rendering:

```typescript
<TokenList
  render={(token) => (
    <CustomTokenDisplay token={token} />
  )}
/>
```

### 3. Higher-Order Components

For enhancing components:

```typescript
export const withTheme = (Component) => {
  return (props) => {
    const theme = useThemeStore();
    return <Component {...props} theme={theme} />;
  };
};
```

---

## State Management

### Component State
- Local UI state
- Form state
- Modal state

### Global State (Zustand)
- Wallet connection
- Theme preferences
- User settings

### Server State
- Token data
- Prices
- User portfolio

---

## Performance Optimization

### Memoization

```typescript
// Memoize expensive components
export const TokenList = memo(TokenListComponent);

// Memoize callbacks
const handleSelect = useCallback((token) => {
  onSelect(token);
}, [onSelect]);

// Memoize values
const filteredTokens = useMemo(() => {
  return tokens.filter(token => token.verified);
}, [tokens]);
```

### Lazy Loading

```typescript
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { ssr: false, loading: () => <Spinner /> }
);
```

### Virtual Lists

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tokens.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <TokenCard token={tokens[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletButton } from './WalletButton';

describe('WalletButton', () => {
  it('renders connect button when disconnected', () => {
    render(<WalletButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows wallet address when connected', () => {
    const { rerender } = render(<WalletButton />);
    // Mock wallet connection
    rerender(<WalletButton />);
    expect(screen.getByText(/[A-Za-z0-9]{4}\.\.\.[A-Za-z0-9]{4}/)).toBeInTheDocument();
  });
});
```

---

## Related Documentation

- [Architecture Overview](OVERVIEW.md)
- [Data Flow](DATA_FLOW.md)
- [Design System](../guides/DESIGN_SYSTEM.md)

---

**Last Updated**: 2025-01-20  
**Component Library**: Custom + Radix UI primitives
