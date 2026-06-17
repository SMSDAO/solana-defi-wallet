import { NextRequest, NextResponse } from 'next/server';
import { requireRole, ForbiddenError, UnauthorizedError } from '@/middleware/auth';

const startTime = Date.now();

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['Admin', 'Developer']);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    throw error;
  }

  const uptimeMs = Date.now() - startTime;
  const { rss, heapUsed, heapTotal, external } = process.memoryUsage();

  return NextResponse.json({
    uptimeMs,
    uptimeHuman: formatUptime(uptimeMs),
    memory: { rss, heapUsed, heapTotal, external },
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
