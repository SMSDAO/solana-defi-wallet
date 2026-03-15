import { cn } from '@/utils/cn';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('deduplicates tailwind classes', () => {
    // tailwind-merge should resolve conflicts
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null as unknown as string, 'bar')).toBe('foo bar');
  });
});
