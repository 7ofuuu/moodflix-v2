import {
  DEFAULT_MOOD,
  MOOD_GENRE_MAP,
  MOOD_LABELS,
  VALID_ACTIONS,
  LAST_MOOD_STORAGE_KEY,
  LAST_ACTION_STORAGE_KEY,
  isMoodKey,
  normalizeMood,
} from '@/lib/mood';

describe('mood constants', () => {
  it('DEFAULT_MOOD is cozy', () => {
    expect(DEFAULT_MOOD).toBe('cozy');
  });

  it('MOOD_GENRE_MAP contains all expected mood keys', () => {
    const expectedMoods = ['happy', 'sad', 'excited', 'cozy', 'nostalgic', 'scattered', 'romantic', 'adventurous'];
    expectedMoods.forEach(mood => {
      expect(MOOD_GENRE_MAP).toHaveProperty(mood);
    });
  });

  it('MOOD_GENRE_MAP values are non-empty arrays of numbers', () => {
    Object.values(MOOD_GENRE_MAP).forEach(genres => {
      expect(Array.isArray(genres)).toBe(true);
      expect(genres.length).toBeGreaterThan(0);
      genres.forEach(id => expect(typeof id).toBe('number'));
    });
  });

  it('MOOD_LABELS has a label for every key in MOOD_GENRE_MAP', () => {
    Object.keys(MOOD_GENRE_MAP).forEach(key => {
      expect(MOOD_LABELS).toHaveProperty(key);
      expect(typeof MOOD_LABELS[key]).toBe('string');
    });
  });

  it('VALID_ACTIONS contains stay, distract, improve, explore', () => {
    expect(VALID_ACTIONS).toContain('stay');
    expect(VALID_ACTIONS).toContain('distract');
    expect(VALID_ACTIONS).toContain('improve');
    expect(VALID_ACTIONS).toContain('explore');
    expect(VALID_ACTIONS).toHaveLength(4);
  });

  it('storage keys are properly namespaced strings', () => {
    expect(LAST_MOOD_STORAGE_KEY).toBe('moodflix:lastMood');
    expect(LAST_ACTION_STORAGE_KEY).toBe('moodflix:lastAction');
  });
});

describe('isMoodKey', () => {
  it('returns true for valid mood keys', () => {
    expect(isMoodKey('happy')).toBe(true);
    expect(isMoodKey('sad')).toBe(true);
    expect(isMoodKey('cozy')).toBe(true);
    expect(isMoodKey('adventurous')).toBe(true);
  });

  it('returns false for invalid mood keys', () => {
    expect(isMoodKey('angry')).toBe(false);
    expect(isMoodKey('unknown')).toBe(false);
    expect(isMoodKey('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isMoodKey(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isMoodKey(undefined)).toBe(false);
  });

  it('is case-sensitive — uppercase keys are invalid', () => {
    expect(isMoodKey('Happy')).toBe(false);
    expect(isMoodKey('COZY')).toBe(false);
  });
});

describe('normalizeMood', () => {
  it('returns the mood as-is when it is a valid key', () => {
    expect(normalizeMood('happy')).toBe('happy');
    expect(normalizeMood('romantic')).toBe('romantic');
  });

  it('lowercases the input before checking', () => {
    expect(normalizeMood('HAPPY')).toBe('happy');
    expect(normalizeMood('Cozy')).toBe('cozy');
  });

  it('falls back to DEFAULT_MOOD for unknown values', () => {
    expect(normalizeMood('angry')).toBe(DEFAULT_MOOD);
    expect(normalizeMood('xyz')).toBe(DEFAULT_MOOD);
  });

  it('falls back to DEFAULT_MOOD for null', () => {
    expect(normalizeMood(null)).toBe(DEFAULT_MOOD);
  });

  it('falls back to DEFAULT_MOOD for undefined', () => {
    expect(normalizeMood(undefined)).toBe(DEFAULT_MOOD);
  });

  it('falls back to DEFAULT_MOOD for an empty string', () => {
    expect(normalizeMood('')).toBe(DEFAULT_MOOD);
  });
});
