'use client';

import React from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import {
  Users,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Key,
  FileText,
  Settings,
  CheckCircle,
} from 'lucide-react';

const systemStats = [
  { label: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-400' },
  { label: 'Active Sessions', value: '84', icon: Activity, color: 'text-green-400' },
  { label: 'API Keys', value: '32', icon: Key, color: 'text-yellow-400' },
  { label: 'Alerts', value: '2', icon: AlertTriangle, color: 'text-red-400' },
];

const recentUsers = [
  { name: 'alice.sol', role: 'User', status: 'Active', joined: '2025-01-15' },
  { name: 'bob.sol', role: 'Developer', status: 'Active', joined: '2025-01-14' },
  { name: 'carol.sol', role: 'Admin', status: 'Active', joined: '2025-01-10' },
  { name: 'dave.sol', role: 'Auditor', status: 'Suspended', joined: '2025-01-08' },
];

const auditLog = [
  { action: 'User login', actor: 'alice.sol', time: '5 min ago', status: 'ok' },
  { action: 'API key created', actor: 'bob.sol', time: '1 hr ago', status: 'ok' },
  { action: 'Role changed: Auditor', actor: 'admin', time: '3 hr ago', status: 'ok' },
  { action: 'Failed login attempt', actor: 'unknown', time: '6 hr ago', status: 'warn' },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen p-4 md:p-8" role="main">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">
              <NeonText size="xl">Admin Dashboard</NeonText>
            </h1>
            <p className="text-[var(--color-text-secondary)]">System management and oversight.</p>
          </div>
        </header>

        {/* System Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {systemStats.map(({ label, value, icon: Icon, color }) => (
            <GlowCard key={label}>
              <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--color-primary)]" />
              Recent Users
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="text-[var(--color-text-secondary)] text-left border-b border-[var(--color-border)]">
                    <th className="pb-2 pr-4">Wallet</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.name} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{u.name}</td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`flex items-center gap-1 text-xs ${u.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                          <CheckCircle className="w-3 h-3" />
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2 text-[var(--color-text-secondary)] text-xs">{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlowCard>

          {/* Audit Log */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" />
              Audit Log
            </h2>
            <ul className="space-y-3" role="list">
              {auditLog.map((entry, i) => (
                <li key={i} className="flex items-start gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${entry.status === 'ok' ? 'bg-green-400' : 'bg-yellow-400'}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)] truncate">{entry.action}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">by {entry.actor} · {entry.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlowCard>
        </div>

        {/* Config Management */}
        <GlowCard>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-primary)]" />
            Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Rate Limit', value: '100 req/min' },
              { label: 'Session TTL', value: '1 hour' },
              { label: 'DB Provider', value: 'SQLite (CI)' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-background)]/50 border border-[var(--color-border)]">
                <span className="text-[var(--color-text-secondary)]">{label}</span>
                <span className="font-mono text-[var(--color-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>
    </main>
  );
}
