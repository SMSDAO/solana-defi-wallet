'use client';

import React from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import { Users, Search } from 'lucide-react';

const users = [
  { wallet: 'CmNwi...r4Kp', role: 'Admin', status: 'Active', orders: 12, joined: '2025-01-10' },
  { wallet: 'AkP3x...m8Nq', role: 'Developer', status: 'Active', orders: 8, joined: '2025-01-14' },
  { wallet: 'Bw7Yt...z2Lf', role: 'User', status: 'Active', orders: 24, joined: '2025-01-15' },
  { wallet: 'Dx9Rk...s6Vj', role: 'User', status: 'Active', orders: 5, joined: '2025-01-16' },
  { wallet: 'Fm2Qp...n4Wx', role: 'Auditor', status: 'Active', orders: 0, joined: '2025-01-17' },
  { wallet: 'Hp5Tz...k1Ms', role: 'User', status: 'Suspended', orders: 3, joined: '2025-01-18' },
];

export default function UsersPage() {
  return (
    <main className="min-h-screen p-4 md:p-8" role="main">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--color-primary)]" />
          <div>
            <h1 className="text-3xl font-bold">
              <NeonText size="xl">Users</NeonText>
            </h1>
            <p className="text-[var(--color-text-secondary)]">All registered wallet users.</p>
          </div>
        </header>

        <GlowCard>
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <input
              type="search"
              placeholder="Search by wallet address..."
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none"
              aria-label="Search users"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="text-[var(--color-text-secondary)] text-left border-b border-[var(--color-border)]">
                  <th className="pb-2 pr-4 font-medium">Wallet</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Orders</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.wallet} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-primary)]/5 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs">{u.wallet}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs ${u.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-text)]">{u.orders}</td>
                    <td className="py-3 text-[var(--color-text-secondary)] text-xs">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>
      </div>
    </main>
  );
}
