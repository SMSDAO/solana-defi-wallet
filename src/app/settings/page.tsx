'use client';

import React from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import { Settings, Moon, Bell, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8" role="main">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-[var(--color-primary)]" />
          <div>
            <h1 className="text-3xl font-bold">
              <NeonText size="xl">Settings</NeonText>
            </h1>
            <p className="text-[var(--color-text-secondary)]">Manage your preferences.</p>
          </div>
        </header>

        <GlowCard>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-[var(--color-primary)]" />
            Appearance
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Use the theme switcher in the header to toggle Dark, Dim, and Day modes.
          </p>
        </GlowCard>

        <GlowCard>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--color-primary)]" />
            Notifications
          </h2>
          <div className="space-y-3 text-sm">
            {['Order fills', 'Price alerts', 'Security events'].map((item) => (
              <div key={item} className="flex justify-between items-center py-1 border-b border-[var(--color-border)] last:border-0">
                <span className="text-[var(--color-text)]">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" aria-label={`Toggle ${item} notifications`} />
                  <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:bg-[var(--color-primary)] transition-colors" />
                </label>
              </div>
            ))}
          </div>
        </GlowCard>

        <GlowCard>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-primary)]" />
            Security
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">Session timeout</span>
              <span className="font-mono text-[var(--color-primary)]">1 hour</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">Two-factor auth</span>
              <span className="text-[var(--color-text-secondary)]">Coming soon</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[var(--color-primary)]" />
            Network
          </h2>
          <div className="space-y-2 text-sm">
            {['Mainnet', 'Devnet', 'Custom RPC'].map((net) => (
              <label key={net} className="flex items-center gap-3 cursor-pointer py-1">
                <input type="radio" name="network" defaultChecked={net === 'Mainnet'} className="accent-[var(--color-primary)]" />
                <span className="text-[var(--color-text)]">{net}</span>
              </label>
            ))}
          </div>
        </GlowCard>
      </div>
    </main>
  );
}
