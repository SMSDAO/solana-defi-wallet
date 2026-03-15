'use client';

import React from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import { BookOpen, ExternalLink } from 'lucide-react';

const docSections = [
  {
    title: 'Getting Started',
    href: 'https://github.com/SMSDAO/solana-defi-wallet/blob/main/QUICK_START.md',
    desc: 'Quick start guide for setting up the wallet locally.',
  },
  {
    title: 'Architecture',
    href: 'https://github.com/SMSDAO/solana-defi-wallet/blob/main/docs/architecture/OVERVIEW.md',
    desc: 'High-level architecture overview including frontend, backend, and database layers.',
  },
  {
    title: 'API Reference',
    href: 'https://github.com/SMSDAO/solana-defi-wallet/blob/main/docs/api/README.md',
    desc: 'Complete API documentation for tokens, prices, swap, and orders.',
  },
  {
    title: 'Authentication & RBAC',
    href: 'https://github.com/SMSDAO/solana-defi-wallet/blob/main/docs/api/AUTHENTICATION.md',
    desc: 'Authentication flows, JWT tokens, and role-based access control.',
  },
  {
    title: 'Deployment',
    href: 'https://github.com/SMSDAO/solana-defi-wallet/blob/main/docs/deployment/PRODUCTION_DEPLOYMENT.md',
    desc: 'Deploying to Vercel, Docker, and other environments.',
  },
  {
    title: 'Environment Variables',
    href: 'https://github.com/SMSDAO/solana-defi-wallet/blob/main/.env.example',
    desc: 'All required and optional environment variables.',
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8" role="main">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[var(--color-primary)]" />
          <div>
            <h1 className="text-3xl font-bold">
              <NeonText size="xl">Documentation</NeonText>
            </h1>
            <p className="text-[var(--color-text-secondary)]">Guides, API references, and deployment docs.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {docSections.map(({ title, href, desc }) => (
            <GlowCard key={title}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                aria-label={`Open ${title} documentation`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {title}
                  </h2>
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-secondary)] flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{desc}</p>
              </a>
            </GlowCard>
          ))}
        </div>
      </div>
    </main>
  );
}
