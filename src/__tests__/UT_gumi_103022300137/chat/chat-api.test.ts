/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

jest.mock('@/lib/tmdb', () => ({
  fetchTmdb: jest.fn().mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  validateTmdbEnv: jest.fn(),
}));

process.env.GEMINI_API_KEY = 'test-gemini-key';

import { POST } from '@/app/api/chat/route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockGemini(responseText: string, ok = true) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: responseText }] } }],
    }),
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/chat', () => {
  it('returns 400 when messages is empty array', async () => {
    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 400 when messages key is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 200 with reply, mood, action, ready, movies on valid request', async () => {
    mockGemini(JSON.stringify({ reply: 'Great!', mood: 'happy', action: 'stay', ready: true }));
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'I feel happy' }] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('reply');
    expect(body).toHaveProperty('mood');
    expect(body).toHaveProperty('action');
    expect(body).toHaveProperty('ready');
    expect(body).toHaveProperty('movies');
  });

  it('normalizes mood alias melancholic → sad', async () => {
    mockGemini(JSON.stringify({ reply: 'I see', mood: 'melancholic', action: 'stay', ready: true }));
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'I feel melancholic' }] }));
    const body = await res.json();
    expect(body.mood).toBe('sad');
  });

  it('returns fallback reply when Gemini returns non-JSON text', async () => {
    mockGemini('Sorry, I cannot understand.');
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'hello' }] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ready).toBe(false);
  });

  it('returns 503 when Gemini API call fails', async () => {
    mockGemini('', false);
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'hello' }] }));
    expect(res.status).toBe(503);
  });
});
