'use client';

import React, { useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import {
  Code2,
  Terminal,
  Activity,
  Server,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

const apiEndpoints = [
  { path: '/api/tokens', method: 'GET', status: 'ok', latency: '42ms' },
  { path: '/api/prices', method: 'GET', status: 'ok', latency: '128ms' },
  { path: '/api/swap/ultra', method: 'POST', status: 'ok', latency: '350ms' },
  { path: '/api/orders/limit', method: 'GET', status: 'ok', latency: '55ms' },
  { path: '/api/health', method: 'GET', status: 'ok', latency: '5ms' },
];

const envVars = [
  { key: 'NODE_ENV', value: 'development', masked: false },
  { key: 'DATABASE_URL', value: 'file:./dev.db', masked: false },
  { key: 'JWT_SECRET', value: '••••••••••••••••', masked: true },
  { key: 'NEXT_PUBLIC_RPC_URL', value: 'https://api.mainnet-beta.solana.com', masked: false },
];

const sampleLogs = [
  { level: 'INFO', msg: 'Server started on port 3000', time: '07:00:01' },
  { level: 'INFO', msg: 'Prisma client connected', time: '07:00:01' },
  { level: 'GET', msg: '/api/health 200 5ms', time: '07:01:02' },
  { level: 'GET', msg: '/api/tokens 200 42ms', time: '07:01:05' },
  { level: 'WARN', msg: 'Rate limit approaching for key api_xxx', time: '07:02:10' },
  { level: 'POST', msg: '/api/swap/ultra 200 350ms', time: '07:02:15' },
];

export default function DeveloperPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const runHealthCheck = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch {
      setTestResult('Error: Could not reach /api/health');
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8" role="main">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <Code2 className="w-8 h-8 text-[var(--color-primary)]" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">
              <NeonText size="xl">Developer Dashboard</NeonText>
            </h1>
            <p className="text-[var(--color-text-secondary)]">API monitoring, logs, and deployment diagnostics.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Monitor */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--color-primary)]" />
              API Monitor
            </h2>
            <ul className="space-y-2" role="list">
              {apiEndpoints.map((ep) => (
                <li key={ep.path} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <div className="flex items-center gap-2">
                    {ep.status === 'ok'
                      ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    }
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded">
                      {ep.method}
                    </span>
                    <span className="text-sm font-mono text-[var(--color-text)]">{ep.path}</span>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">{ep.latency}</span>
                </li>
              ))}
            </ul>
          </GlowCard>

          {/* Logs Viewer */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[var(--color-primary)]" />
              Application Logs
            </h2>
            <div className="bg-black/40 rounded-lg p-3 font-mono text-xs overflow-auto max-h-48" role="log" aria-live="polite">
              {sampleLogs.map((log, i) => (
                <div key={i} className="flex gap-3 py-0.5">
                  <span className="text-[var(--color-text-secondary)] flex-shrink-0">{log.time}</span>
                  <span className={`flex-shrink-0 w-12 ${log.level === 'WARN' ? 'text-yellow-400' : log.level === 'INFO' ? 'text-blue-400' : 'text-green-400'}`}>
                    {log.level}
                  </span>
                  <span className="text-[var(--color-text)]">{log.msg}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Env Config */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-[var(--color-primary)]" />
              Environment Config
            </h2>
            <ul className="space-y-2" role="list">
              {envVars.map(({ key, value }) => (
                <li key={key} className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <span className="font-mono text-[var(--color-text-secondary)] text-xs">{key}</span>
                  <span className="font-mono text-xs text-[var(--color-text)] truncate max-w-[160px] text-right">{value}</span>
                </li>
              ))}
            </ul>
          </GlowCard>

          {/* Integration Console */}
          <GlowCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[var(--color-primary)]" />
              Integration Console
            </h2>
            <div className="space-y-3">
              <button
                onClick={runHealthCheck}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Run Health Check
              </button>
              {testResult && (
                <pre className="bg-black/40 rounded-lg p-3 font-mono text-xs text-green-400 overflow-auto max-h-32" role="status">
                  {testResult}
                </pre>
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </main>
  );
}
