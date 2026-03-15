[![CI](https://github.com/SMSDAO/solana-defi-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/SMSDAO/solana-defi-wallet/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SMSDAO/solana-defi-wallet)

# Solana Wallet - Advanced Multi-Platform Wallet

A comprehensive Solana wallet application with advanced features, MEV protection, and multi-platform support (Web, Mobile APK, iOS, Windows).

## Features

### 🚀 Core Features
- **Multi-Wallet Support**: Connect with Phantom, Solflare, Torus, Ledger, MathWallet, and more
- **Ultra API**: MEV protection, dynamic slippage, priority fees
- **Standard Swap API**: Most common use case preset
- **Lite API**: Optimized for speed
- **Prices API**: Real-time multi-source pricing from 22+ DEX and 40+ swap aggregators
- **Token API**: 22,000+ tokens with logos, metadata, and sensor scoring
- **Limit Order API**: Conditional orders
- **DCA API**: Dollar cost averaging

### 🎨 UI Features
- **Modern 3D Design**: Aura FX and NEON Glow effects
- **Dynamic Color Matching**: Automatically matches token logo colors to UI elements
- **Theme System**: Dark, Dim, and Day modes
- **Responsive Design**: Works seamlessly across all devices

### 🔒 Security
- Secure API framework with authentication
- Admin controls and database integration
- Rate limiting and request validation
- JWT-based session management

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **Solana**: @solana/web3.js, @solana/wallet-adapter
- **Database**: PostgreSQL with Prisma ORM
- **API**: Next.js API Routes

## Getting Started

### Prerequisites
- Node.js 20+
- Solana RPC endpoint (public endpoints work out of the box)
- SQLite (local/CI) or PostgreSQL (production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SMSDAO/solana-defi-wallet.git
cd solana-defi-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# SQLite for local dev (default):
DATABASE_URL="file:./dev.db"

# PostgreSQL for production:
# DATABASE_URL="postgresql://user:password@localhost:5432/solana_wallet"

JWT_SECRET="your-32-char-secret-here"
NEXT_PUBLIC_RPC_URL="https://api.mainnet-beta.solana.com"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── wallet/      # Wallet connection components
│   │   ├── swap/        # Swap interface
│   │   ├── tokens/      # Token list components
│   │   ├── portfolio/   # Portfolio components
│   │   ├── theme/       # Theme components
│   │   └── ui/          # UI components (GlowCard, NeonText, etc.)
│   ├── lib/             # Utility libraries
│   │   ├── solana.ts    # Solana utilities
│   │   ├── swap-aggregators.ts
│   │   ├── price-aggregators.ts
│   │   └── token-registry.ts
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript types
│   └── api/             # API SDK
├── prisma/              # Database schema
└── public/              # Static assets
```

## API Documentation

### Swap APIs

#### Ultra API
```typescript
POST /api/swap/ultra
{
  inputMint: string;
  outputMint: string;
  amount: string;
  mevProtection?: boolean;
  dynamicSlippage?: boolean;
  priorityFee?: 'low' | 'medium' | 'high';
}
```

#### Standard Swap API
```typescript
POST /api/swap/standard
{
  inputMint: string;
  outputMint: string;
  amount: string;
  slippage?: number;
}
```

#### Lite API
```typescript
POST /api/swap/lite
{
  inputMint: string;
  outputMint: string;
  amount: string;
}
```

### Prices API
```typescript
GET /api/prices?tokens=TOKEN1,TOKEN2&sources=coingecko,birdeye
GET /api/prices/[token]
```

### Token API
```typescript
GET /api/tokens?search=SOL&verified=true&limit=50
GET /api/tokens/[address]
```

### Orders API
```typescript
# Limit Orders
GET /api/orders/limit
POST /api/orders/limit
DELETE /api/orders/limit/[id]

# DCA Orders
GET /api/orders/dca
POST /api/orders/dca
PATCH /api/orders/dca/[id]/pause
PATCH /api/orders/dca/[id]/resume
DELETE /api/orders/dca/[id]
```

## Mobile & Desktop Apps

### Mobile (React Native)
```bash
cd mobile
npm install
npm run android  # For Android APK
npm run ios      # For iOS
```

### Desktop (Electron/Tauri)
```bash
cd desktop
npm install
npm run dev      # Development
npm run build    # Production build
```

## Security Features

- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure wallet connection handling
- MEV protection for swaps
- Dynamic slippage calculation

## 📦 Version 1.0.0

**First Production Release** - January 20, 2025

This release includes:
- ✅ Production-ready optimizations (SEO, performance, security)
- ✅ Comprehensive error handling and accessibility
- ✅ Complete design system with documentation
- ✅ Full API documentation
- ✅ Vercel deployment ready

See [CHANGELOG.md](./CHANGELOG.md) for full release notes.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SMSDAO/solana-defi-wallet)

1. Click the button above
2. Add environment variables (see [.env.example](./.env.example))
3. Deploy!

## 🖼️ UI Preview

### User Dashboard
![User Dashboard](./docs/assets/ui/user-dashboard.png)

### Admin Dashboard
![Admin Dashboard](./docs/assets/ui/admin-dashboard.png)

### Developer Dashboard
![Developer Dashboard](./docs/assets/ui/dev-dashboard.png)

> Screenshots are captured automatically via the CI screenshot workflow.

## 📚 Documentation

**[📖 Complete Documentation Hub](./docs/README.md)** - Comprehensive documentation for all aspects of the project

### Quick Links
- **[Quick Start Guide](./docs/guides/QUICK_START.md)** - Get started in minutes
- **[API Documentation](./docs/api/README.md)** - Complete API reference
- **[Production Deployment](./docs/deployment/PRODUCTION_DEPLOYMENT.md)** - Deploy to production
- **[Architecture Overview](./docs/architecture/OVERVIEW.md)** - System architecture
- **[Contributing Guidelines](./docs/guides/CONTRIBUTING.md)** - How to contribute
- **[Troubleshooting Guide](./docs/guides/TROUBLESHOOTING.md)** - Common issues and solutions

### Platform-Specific
- **[Mobile App](./docs/mobile/README.md)** - React Native mobile app documentation
- **[Desktop App](./docs/desktop/README.md)** - Electron desktop app documentation

### Reference
- **[CHANGELOG](./CHANGELOG.md)** - Version history and detailed release notes
- **[Design System](./docs/guides/DESIGN_SYSTEM.md)** - Component architecture and theming
- **[Optimization Summary](./docs/guides/OPTIMIZATION_SUMMARY.md)** - Production optimizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## About

**Repository:** [https://github.com/StudioDeFi/solana-defi-wallet-repository](https://github.com/StudioDeFi/solana-defi-wallet-repository)

**Version:** 1.0.0  
**Maintained by:** StudioDeFi  
**Release Date:** January 20, 2025
