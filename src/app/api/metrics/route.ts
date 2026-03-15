import { NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET() {
  const uptimeMs = Date.now() - startTime;

  return NextResponse.json({
    uptime_ms: uptimeMs,
    uptime_human: formatUptime(uptimeMs),
    memory: process.memoryUsage(),
    node_version: process.version,
    timestamp: new Date().toISOString(),
  });
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
