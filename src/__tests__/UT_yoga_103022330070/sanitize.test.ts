import { sanitizeSearchQuery, sanitizeIntParam } from '@/lib/sanitize';

describe('sanitizeSearchQuery', () => {
  it('returns empty string for null input', () => {
    expect(sanitizeSearchQuery(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(sanitizeSearchQuery(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(sanitizeSearchQuery('')).toBe('');
  });

  it('strips HTML tags', () => {
    expect(sanitizeSearchQuery('<b>Inception</b>')).toBe('Inception');
  });

  it('strips script tags (only the tags, inner text is kept)', () => {
    // The regex strips <tag> markers only — inner text like bad() remains
    expect(sanitizeSearchQuery('<script>bad()</script>clean')).toBe('bad()clean');
  });

  it('strips control characters', () => {
    expect(sanitizeSearchQuery('hello\x00world')).toBe('helloworld');
  });

  it('trims whitespace', () => {
    expect(sanitizeSearchQuery('  Interstellar  ')).toBe('Interstellar');
  });

  it('truncates string longer than 200 characters', () => {
    const long = 'x'.repeat(300);
    expect(sanitizeSearchQuery(long).length).toBe(200);
  });

  it('returns normal search string unchanged', () => {
    expect(sanitizeSearchQuery('The Dark Knight')).toBe('The Dark Knight');
  });

  it('strips multiple nested HTML tags', () => {
    expect(sanitizeSearchQuery('<div><p>Movie</p></div>')).toBe('Movie');
  });
});

describe('sanitizeIntParam', () => {
  it('returns fallback for null value', () => {
    expect(sanitizeIntParam(null, 1, 500, 1)).toBe(1);
  });

  it('returns fallback for undefined value', () => {
    expect(sanitizeIntParam(undefined, 1, 500, 1)).toBe(1);
  });

  it('returns fallback for empty string', () => {
    expect(sanitizeIntParam('', 1, 500, 1)).toBe(1);
  });

  it('returns fallback for non-numeric string', () => {
    expect(sanitizeIntParam('page', 1, 500, 1)).toBe(1);
  });

  it('returns fallback when value is below minimum', () => {
    expect(sanitizeIntParam('0', 1, 500, 1)).toBe(1);
  });

  it('returns fallback when value exceeds maximum', () => {
    expect(sanitizeIntParam('501', 1, 500, 1)).toBe(1);
  });

  it('returns parsed integer for valid in-range value', () => {
    expect(sanitizeIntParam('10', 1, 500, 1)).toBe(10);
  });

  it('accepts the minimum boundary value', () => {
    expect(sanitizeIntParam('1', 1, 500, 99)).toBe(1);
  });

  it('accepts the maximum boundary value', () => {
    expect(sanitizeIntParam('500', 1, 500, 99)).toBe(500);
  });

  it('floors float values (e.g. 3.9 → 3)', () => {
    expect(sanitizeIntParam('3.9', 1, 500, 1)).toBe(3);
  });

  it('returns fallback for Infinity', () => {
    expect(sanitizeIntParam('Infinity', 1, 500, 1)).toBe(1);
  });
});
