'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  Home,
  LayoutDashboard,
  Users,
  Shield,
  Code2,
  Settings,
  BookOpen,
} from 'lucide-react';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/admin', label: 'Admin', icon: Shield },
  { href: '/developer', label: 'Developer', icon: Code2 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/docs', label: 'Docs', icon: BookOpen },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none" role="tablist">
          {tabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <li key={href} role="none">
                <Link
                  href={href}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                    isActive
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden sr-only">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
