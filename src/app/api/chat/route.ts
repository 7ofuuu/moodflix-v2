import { NextRequest, NextResponse } from 'next/server';
import { MOOD_GENRE_MAP, VALID_ACTIONS, isMoodKey } from '@/lib/mood';
import { fetchTmdb } from '@/lib/tmdb';
import type { ActionType } from '@/lib/mood';
import type { PaginatedResponse, MovieDetails } from '@/types/movie';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_RESULTS = 8;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MOOD_ALIASES: Record<string, string> = {
  melancholic: 'sad',
  thrilled: 'excited',
};

const ACTION_ALIASES: Record<string, ActionType> = {
  distraction: 'distract',
  'stay in this mood': 'stay',
  'feel better': 'improve',
  'explore something different': 'explore',
};

function normalizeDetectedMood(mood: string | null | undefined): string | null {
  if (!mood) {
    return null;
  }

  const candidate = mood.toLowerCase().trim();
  const mapped = MOOD_ALIASES[candidate] ?? candidate;
  return isMoodKey(mapped) ? mapped : null;
}

function normalizeDetectedAction(action: string | null | undefined): ActionType | null {
  if (!action) {
    return null;
  }

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

async function fetchMoviesByMoodAction(mood: string, action: ActionType): Promise<MovieDetails[]> {
  try {
    const sortBy = action === 'explore' ? 'vote_average.desc' : 'popularity.desc';
    const genreIds = MOOD_GENRE_MAP[mood] ?? MOOD_GENRE_MAP.cozy;

    const data = await fetchTmdb<PaginatedResponse<MovieDetails>>('/discover/movie', {
      language: 'en-US',
      page: '1',
      sort_by: sortBy,
      'vote_count.gte': '150',
      with_genres: genreIds.join(','),
    });

    return (data.results ?? []).slice(0, MAX_RESULTS);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI chat not configured' }, { status: 503 });
    }

    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // Build conversation history for Gemini
    const conversationHistory = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are MoodFlix AI, a friendly movie recommendation assistant. You help users find perfect movies based on their emotional state and preferences.

Given the conversation below, respond in a warm, conversational tone and extract the user's mood and intent.

Available moods: happy, sad (melancholic), excited (thrilled), cozy, nostalgic, scattered, romantic, adventurous
Available actions: stay (match mood), distract (take mind off things), improve (feel better), explore (try something different)

Conversation:
${conversationHistory}

Respond with a JSON object (no markdown):
{
  "reply": "Your conversational response here (1-2 sentences, warm tone)",
  "mood": "detected_mood_key or null",
  "action": "detected_action_key or null",
  "ready": true/false
}

Set ready=true only when you have enough info to recommend movies (both mood and action identified).
If still gathering info, ask a follow-up question in reply.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
    });

    if (!geminiRes.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 503 });
    }

    const geminiData = await geminiRes.json();
    const responseText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const jsonStr = extractFirstJsonObject(responseText);
    if (!jsonStr) {
      return NextResponse.json({
        reply: "I'm here to help you find the perfect movie! What kind of mood are you in tonight?",
        movies: [],
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
    const normalizedAction = normalizeDetectedAction(parsed.action);
    const ready = Boolean(parsed.ready && normalizedMood && normalizedAction);

    let movies: MovieDetails[] = [];

    if (ready && normalizedMood && normalizedAction) {
      movies = await fetchMoviesByMoodAction(normalizedMood, normalizedAction);
    }

    return NextResponse.json({
      reply: parsed.reply || "Tell me how you're feeling and I'll find the perfect movie!",
      mood: normalizedMood,
      action: normalizedAction,
      ready,
      movies,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
