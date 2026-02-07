# Contributing Guidelines

Thank you for considering contributing to the Solana DeFi Wallet project! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (optional for full features)
- Git
- A Solana wallet (Phantom, Solflare, etc.)

### Setup

1. **Fork the repository**
   ```bash
   # Visit https://github.com/SMSDAO/solana-defi-wallet
   # Click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/solana-defi-wallet.git
   cd solana-defi-wallet
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/SMSDAO/solana-defi-wallet.git
   ```

4. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/xxx` - New features
- `fix/xxx` - Bug fixes
- `docs/xxx` - Documentation updates

### Creating a Branch

```bash
# Update your local repository
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Make your changes** in small, logical commits
2. **Write meaningful commit messages**
3. **Test your changes** thoroughly
4. **Update documentation** if needed

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(swap): add MEV protection to ultra API"
git commit -m "fix(wallet): resolve connection issue with Ledger"
git commit -m "docs(api): update swap API documentation"
```

---

## Coding Standards

### TypeScript

We use TypeScript for type safety. Follow these guidelines:

1. **Always define types**
   ```typescript
   // Good
   interface SwapParams {
     inputMint: string;
     outputMint: string;
     amount: string;
   }
   
   function getQuote(params: SwapParams): Promise<Quote> {
     // ...
   }
   
   // Bad
   function getQuote(params: any): any {
     // ...
   }
   ```

2. **Use strict mode**
   - Enabled in `tsconfig.json`
   - No implicit `any`
   - Null checks required

3. **Prefer interfaces over types**
   ```typescript
   // Good
   interface User {
     id: string;
     name: string;
   }
   
   // Acceptable for unions
   type Status = 'active' | 'inactive';
   ```

### React Components

1. **Use functional components with hooks**
   ```typescript
   // Good
   export function MyComponent({ prop }: Props) {
     const [state, setState] = useState();
     return <div>{prop}</div>;
   }
   
   // Avoid class components
   ```

2. **Memoize expensive components**
   ```typescript
   export const ExpensiveComponent = React.memo(({ data }) => {
     // Complex rendering logic
   });
   ```

3. **Use proper prop types**
   ```typescript
   interface Props {
     title: string;
     onClick?: () => void;
     children?: React.ReactNode;
   }
   ```

### File Organization

```
src/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── components/       # React components
│   ├── ui/          # UI components
│   ├── wallet/      # Wallet components
│   └── swap/        # Swap components
├── lib/             # Utility libraries
├── hooks/           # Custom hooks
├── store/           # State management
├── types/           # TypeScript types
└── utils/           # Helper functions
```

### Naming Conventions

- **Components**: PascalCase (`SwapInterface.tsx`)
- **Hooks**: camelCase with `use` prefix (`useWallet.ts`)
- **Utilities**: camelCase (`formatNumber.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SLIPPAGE`)
- **Types/Interfaces**: PascalCase (`SwapParams`)

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

3. **Build successfully**
   ```bash
   npm run build
   ```

4. **Update documentation**
   - Update relevant `.md` files
   - Add JSDoc comments to functions
   - Update CHANGELOG.md

### Submitting PR

1. **Push your changes**
   ```bash
   git push origin your-branch
   ```

2. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How have you tested this?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. **Automated checks** must pass
   - Build successful
   - Tests passing
   - Linting passed
   - Type checking passed

2. **Code review** by maintainer
   - Code quality
   - Best practices
   - Documentation
   - Testing

3. **Changes requested** (if needed)
   - Address feedback
   - Push updates
   - Request re-review

4. **Approval and merge**
   - Squash and merge (preferred)
   - Merge commit (for large features)

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { SwapInterface } from './SwapInterface';

describe('SwapInterface', () => {
  it('renders swap form', () => {
    render(<SwapInterface />);
    expect(screen.getByText('Swap')).toBeInTheDocument();
  });
  
  it('validates input amount', () => {
    render(<SwapInterface />);
    // Test validation logic
  });
});
```

### Test Coverage

Aim for:
- **Unit tests**: 80%+ coverage
- **Integration tests**: Critical paths
- **E2E tests**: Key user flows

---

## Documentation

### Code Documentation

Use JSDoc for functions and complex logic:

```typescript
/**
 * Get a swap quote from multiple sources
 * @param params - Swap parameters
 * @param params.inputMint - Input token address
 * @param params.outputMint - Output token address
 * @param params.amount - Amount in base units
 * @returns Promise resolving to swap quote
 * @throws {Error} If tokens are invalid
 */
export async function getSwapQuote(params: SwapParams): Promise<Quote> {
  // Implementation
}
```

### README Updates

Update relevant documentation:
- API changes → `docs/api/`
- Architecture changes → `docs/architecture/`
- Deployment changes → `docs/deployment/`
- User-facing changes → `docs/guides/`

---

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email security@example.com
- **General**: Join our Discord/Telegram

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Solana DeFi Wallet!** 🎉

Your contributions help make this project better for everyone.

---

**Last Updated**: 2025-01-20
