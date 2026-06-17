'use client';

import React from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import {
  Activity,
  Bell,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';

const stats = [
  { label: 'Portfolio Value', value: '$12,450.00', change: '+5.2%', up: true, icon: Wallet },
  { label: '24h P&L', value: '+$643.00', change: '+5.2%', up: true, icon: TrendingUp },
  { label: 'Active Orders', value: '3', change: '2 limit, 1 DCA', up: true, icon: Activity },
  { label: 'Notifications', value: '5', change: '2 unread', up: false, icon: Bell },
];

const recentActivity = [
  { type: 'Swap', detail: 'SOL → USDC', amount: '$500', time: '2 min ago', up: false },
  { type: 'Deposit', detail: 'SOL received', amount: '+2.5 SOL', time: '1 hr ago', up: true },
  { type: 'Limit Order', detail: 'SOL/USDC filled', amount: '$1,200', time: '3 hr ago', up: true },
  { type: 'DCA', detail: 'Weekly BTC buy', amount: '$100', time: '1 day ago', up: true },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 md:p-8" role="main">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold mb-1">
            <NeonText size="xl">User Dashboard</NeonText>
          </h1>
          <p className="text-[var(--color-text-secondary)]">Welcome back! Here&apos;s your portfolio overview.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, up, icon: Icon }) => (
            <GlowCard key={label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-sm ${up ? 'text-green-400' : 'text-red-400'}`}>
                    {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {change}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                  <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-primary)]" />
              Recent Activity
            </h2>
            <ul className="space-y-3" role="list">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{item.type}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{item.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${item.up ? 'text-green-400' : 'text-[var(--color-text)]'}`}>{item.amount}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlowCard>

          {/* Notifications */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--color-primary)]" />
              Notifications
            </h2>
            <ul className="space-y-3" role="list">
              {[
                { msg: 'Limit order SOL/USDC filled at $98.50', time: '3 hr ago', read: false },
                { msg: 'DCA order executed: $100 BTC purchased', time: '1 day ago', read: false },
                { msg: 'New token listing: PYTH available', time: '2 days ago', read: true },
                { msg: 'Wallet connected successfully', time: '3 days ago', read: true },
              ].map((n, i) => (
                <li key={i} className={`flex items-start gap-3 py-2 border-b border-[var(--color-border)] last:border-0`}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? 'bg-[var(--color-border)]' : 'bg-[var(--color-primary)]'}`} />
                  <div>
                    <p className={`text-sm ${n.read ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>{n.msg}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlowCard>
        </div>
      </div>
    </main>
  );
}
