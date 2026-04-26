import { saveMoodHistory, fetchLastMood } from '@/lib/mood-history';
import type { SupabaseClient } from '@supabase/supabase-js';

function makeSupabase(overrides: Partial<{
  insertError: object | null;
  selectData: { mood: string } | null;
  selectError: object | null;
}> = {}) {
  const { insertError = null, selectData = null, selectError = null } = overrides;
  return {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: insertError }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: selectData, error: selectError }),
            }),
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe('saveMoodHistory', () => {
  it('inserts with correct user_id and mood', async () => {
    const sb = makeSupabase();
    await saveMoodHistory(sb, 'user-1', 'happy');
    expect(sb.from).toHaveBeenCalledWith('user_mood_history');
    const fromResult = (sb.from as jest.Mock).mock.results[0].value;
    expect(fromResult.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', mood: 'happy' })
    );
  });

  it('does not throw when Supabase returns an error', async () => {
    const sb = makeSupabase({ insertError: { message: 'db error' } });
    await expect(saveMoodHistory(sb, 'user-1', 'sad')).resolves.toBeUndefined();
  });
});

describe('fetchLastMood', () => {
  it('returns mood string from the first row', async () => {
    const sb = makeSupabase({ selectData: { mood: 'cozy' } });
    const result = await fetchLastMood(sb, 'user-1');
    expect(result).toBe('cozy');
  });

  it('returns null when no rows exist', async () => {
    const sb = makeSupabase({ selectError: { code: 'PGRST116' } });
    const result = await fetchLastMood(sb, 'user-1');
    expect(result).toBeNull();
  });

  it('returns null when data is null', async () => {
    const sb = makeSupabase({ selectData: null });
    const result = await fetchLastMood(sb, 'user-1');
    expect(result).toBeNull();
  });
});
