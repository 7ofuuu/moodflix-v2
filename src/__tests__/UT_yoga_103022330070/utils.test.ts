import { cn } from '@/lib/utils';

describe('cn (className utility)', () => {
  it('returns a single class name unchanged', () => {
    expect(cn('text-white')).toBe('text-white');
  });

  it('merges two class names with a space', () => {
    expect(cn('flex', 'gap-4')).toBe('flex gap-4');
  });

  it('includes class when condition is truthy', () => {
    expect(cn('base', true && 'extra')).toBe('base extra');
  });

  it('excludes class when condition is falsy', () => {
    expect(cn('base', false && 'extra')).toBe('base');
  });

  it('resolves conflicting Tailwind classes — last one wins', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('resolves conflicting bg- Tailwind classes', () => {
    expect(cn('bg-slate-800', 'bg-amber-500')).toBe('bg-amber-500');
  });

  it('handles object syntax from clsx (truthy values included)', () => {
    expect(cn({ 'font-bold': true, 'italic': false })).toBe('font-bold');
  });

  it('handles array syntax from clsx', () => {
    expect(cn(['rounded-xl', 'p-4'])).toBe('rounded-xl p-4');
  });

  it('returns empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('ignores undefined values gracefully', () => {
    expect(() => cn('foo', undefined)).not.toThrow();
    expect(cn('foo', undefined)).toBe('foo');
  });
});
