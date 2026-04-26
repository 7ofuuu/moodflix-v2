import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { MOOD_GENRE_MAP, VALID_ACTIONS, isMoodKey } from '@/lib/mood';
import { fetchTmdb } from '@/lib/tmdb';
import type { ActionType } from '@/lib/mood';
import type { PaginatedResponse, MovieDetails } from '@/types/movie';

const GEMINI_CHAT_MODEL = 'gemini-2.5-flash-lite';
const MAX_RESULTS = 50;
const DISCOVER_PAGE_POOL = 8;
const DISCOVER_SAMPLE_PAGES = 5;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MOOD_ALIASES: Record<string, string> = {
  // English aliases
  melancholic: 'sad',
  thrilled: 'excited',
  action: 'excited',
  thriller: 'excited',
  horror: 'excited',
  comedy: 'happy',
  drama: 'sad',
  romance: 'romantic',
  adventure: 'adventurous',
  'sci-fi': 'adventurous',
  'science fiction': 'adventurous',
  animation: 'cozy',
  family: 'cozy',
  mystery: 'scattered',
  documentary: 'nostalgic',
  classic: 'nostalgic',
  // Indonesian aliases
  sedih: 'sad',
  melankolis: 'sad',
  galau: 'sad',
  menangis: 'sad',
  bahagia: 'happy',
  senang: 'happy',
  gembira: 'happy',
  lucu: 'happy',
  seru: 'excited',
  menegangkan: 'excited',
  santai: 'cozy',
  nyaman: 'cozy',
  hangat: 'cozy',
  romantis: 'romantic',
  cinta: 'romantic',
  bucin: 'romantic',
  petualangan: 'adventurous',
  epik: 'adventurous',
  nostalgia: 'nostalgic',
  kenangan: 'nostalgic',
  jadul: 'nostalgic',
  bingung: 'scattered',
  random: 'scattered',
};

const ACTION_ALIASES: Record<string, ActionType> = {
  // English
  distraction: 'distract',
  'stay in this mood': 'stay',
  'feel better': 'improve',
  'explore something different': 'explore',
  'cheer me up': 'improve',
  'surprise me': 'explore',
  'something different': 'explore',
  // Indonesian
  'sesuai mood': 'stay',
  'sama mood': 'stay',
  tetap: 'stay',
  lupain: 'distract',
  alihkan: 'distract',
  distraksi: 'distract',
  'bikin semangat': 'improve',
  'mau happy': 'improve',
  'lebih baik': 'improve',
  'coba yang beda': 'explore',
  'coba lain': 'explore',
  berbeda: 'explore',
};

function normalizeDetectedMood(mood: string | null | undefined): string | null {
  if (!mood) return null;
  const candidate = mood.toLowerCase().trim();
  const mapped = MOOD_ALIASES[candidate] ?? candidate;
  return isMoodKey(mapped) ? mapped : null;
}

function normalizeDetectedAction(action: string | null | undefined): ActionType | null {
  if (!action) return null;
  const candidate = action.toLowerCase().trim();
  const mapped = ACTION_ALIASES[candidate] ?? candidate;
  return VALID_ACTIONS.includes(mapped as ActionType) ? (mapped as ActionType) : null;
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;

  if (globalThis.crypto?.getRandomValues !== undefined) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

async function fetchMoviesByMoodAction(mood: string, action: ActionType): Promise<MovieDetails[]> {
  try {
    const sortBy = action === 'explore' ? 'vote_average.desc' : 'popularity.desc';
    const genreIds = MOOD_GENRE_MAP[mood] ?? MOOD_GENRE_MAP.cozy;
    const startPage = randomInt(DISCOVER_PAGE_POOL) + 1;
    const pages = Array.from(
      { length: DISCOVER_SAMPLE_PAGES },
      (_, index) => String(((startPage + index - 1) % DISCOVER_PAGE_POOL) + 1)
    );

    const pageResults = await Promise.all(
      pages.map(async page => {
        try {
          const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/discover/movie', {
            language: 'en-US',
            page,
            sort_by: sortBy,
            'vote_count.gte': '150',
            with_genres: genreIds.join(','),
          });

          return data.results ?? [];
        } catch {
          return [];
        }
      })
    );

    const deduped = new Map<number, MovieDetails>();
    for (const movie of pageResults.flat()) {
      deduped.set(movie.id, movie);
    }

    const arr = Array.from(deduped.values());
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.slice(0, MAX_RESULTS);
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT_TEMPLATE = (conversationHistory: string) => `You are MoodFlix AI, a smart and friendly movie recommendation assistant inside a mood-based cinema app.

CRITICAL LANGUAGE RULE: You MUST reply in the exact same language the user is writing in. If the user writes in Indonesian (Bahasa Indonesia), you MUST reply in Indonesian. If they write in English, reply in English. Never switch languages unless the user switches first.

MOOD KEYS — map user input to one of these exact strings:
- "happy"       → comedies, feel-good, cheerful, fun | ID: bahagia, senang, gembira, lucu, ceria
- "sad"         → dramas, tearjerkers, emotional, melancholic | ID: sedih, galau, melankolis, menangis, drama
- "excited"     → action, thriller, horror, adrenaline, intense | ID: seru, action, menegangkan, deg-degan, horor
- "cozy"        → animation, family, slice-of-life, light | ID: santai, nyaman, hangat, cozy, ringan
- "nostalgic"   → classics, period films, retro | ID: nostalgia, kenangan, jadul, klasik
- "scattered"   → unfocused, indecisive, anything goes | ID: bingung, gatau, random, gabisa milih, terserah
- "romantic"    → romance, love stories, date-night | ID: romantis, cinta, sendu, bucin
- "adventurous" → adventure, sci-fi, epic, exploration | ID: petualangan, epik, luar angkasa, action petualangan

ACTION KEYS — infer from context, use "stay" as default:
- "stay"     → films that match the mood (DEFAULT when unclear)
- "distract" → take mind off something | ID: alihkan pikiran, lupain, distraksi
- "improve"  → want to feel better / uplift | ID: bikin semangat, cheering up, mau happy
- "explore"  → want something surprising / unexpected | ID: surprise, coba yang beda, random banget

WHEN TO SET ready=true — be generous and fast:
✅ User mentions ANY mood, genre, feeling, or movie type in their message
✅ User asks for new/different recommendations ("berikan lagi", "coba yang lain", "more movies")
✅ User references a genre ("action", "horror", "drama", "sedih", "seru") — map it to mood key
✅ User describes a situation that implies a mood ("habis putus", "lagi bete", "mau ketawa")
✅ If mood is clear but action is unspecified → still ready=true, output action as "stay"

WHEN TO SET ready=false — only if:
❌ User is purely greeting with no movie intent (just "halo", "hi", "what can you do")
❌ Request is completely unintelligible

STYLE RULES:
- Keep reply to 1-2 sentences maximum
- Be warm, casual, and direct — skip unnecessary follow-up questions
- If you have enough info, just confirm and go (don't ask "are you sure?")
- Sound like a knowledgeable film-loving friend, not a form to fill out

Conversation history:
${conversationHistory}

Respond ONLY with valid JSON — no markdown, no code blocks, no extra text:
{"reply":"your response in user's language","mood":"mood_key or null","action":"action_key or null","ready":true or false}`;

export async function POST(request: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI chat not configured' }, { status: 503 });
    }

    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const conversationHistory = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT_TEMPLATE(conversationHistory) }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 400 },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      logger.error('Gemini error', { status: geminiRes.status, body: errBody });
      return NextResponse.json({ error: 'AI service error' }, { status: 503 });
    }

    const geminiData = await geminiRes.json();
    const responseText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const jsonStr = extractFirstJsonObject(responseText);
    if (!jsonStr) {
      return NextResponse.json({
        reply: "Cerita dong lagi pengen nonton apa, atau gimana perasaan kamu sekarang?",
        movies: [],
        mood: null,
        action: null,
        ready: false,
      });
    }

    const parsed = JSON.parse(jsonStr) as {
      reply: string;
      mood: string | null;
      action: string | null;
      ready: boolean;
    };

    const normalizedMood = normalizeDetectedMood(parsed.mood);
    const normalizedAction = normalizeDetectedAction(parsed.action) ?? (normalizedMood ? 'stay' : null);
    const ready = Boolean(parsed.ready && normalizedMood);

    let movies: MovieDetails[] = [];
    if (ready && normalizedMood && normalizedAction) {
      movies = await fetchMoviesByMoodAction(normalizedMood, normalizedAction);
    }

    return NextResponse.json({
      reply: parsed.reply || "Cerita dong, lagi pengen nonton film apa?",
      mood: normalizedMood,
      action: normalizedAction,
      ready,
      movies,
    });
  } catch (error) {
    logger.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
