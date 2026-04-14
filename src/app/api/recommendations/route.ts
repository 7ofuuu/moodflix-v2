import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_BASE = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL;
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_TOKEN;
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

async function fetchMoviesByIds(movieIds: number[]): Promise<TmdbMovie[]> {
  try {
    const movies = [];

    for (const id of movieIds) {
      const response = await fetch(`${TMDB_API_BASE}/movie/${id}`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${TMDB_API_TOKEN}`,
        },
      });

      if (response.ok) {
        const movie = await response.json();
        movies.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          overview: movie.overview,
        });
      }
    }

    return movies;
  } catch (error) {
    console.error('Error fetching movies from TMDB:', error);
    return [];
  }
}

async function getMovieRecommendationsFromGemini(mood: string, action: string) {
  try {
    const prompt = `You are a movie recommendation expert. Based on the user's current mood and their preference, recommend 5 popular movies that would be perfect for them.

User's Mood: ${mood}
User's Preference: ${action}

Mood Context:
- happy: User is feeling joyful and positive
- sad: User is feeling down or melancholic
- excited: User is feeling energetic and thrilled
- cozy: User is feeling comfortable and relaxed
- nostalgic: User is feeling nostalgic
- scattered: User is feeling confused or unfocused
- romantic: User is feeling romantic
- adventurous: User is feeling adventurous

Action Context:
- stay: Find movies that match the current mood perfectly
- distract: Find movies to take their mind off things
- improve: Find movies to lift their spirits
- explore: Find movies outside their usual preferences

Please respond with a JSON array of exactly 5 TMDB movie IDs (numeric IDs only, no titles). Format: [id1, id2, id3, id4, id5]

Important: Only respond with the JSON array, nothing else.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse the JSON array from the response
    const jsonMatch = responseText.match(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/);
    if (!jsonMatch) {
      console.error('Gemini response text:', responseText);
      throw new Error('Could not parse movie IDs from Gemini response');
    }

    const movieIds = JSON.parse(jsonMatch[0]);
    return movieIds;
  } catch (error) {
    console.error('Error getting recommendations from Gemini:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { mood, action } = await request.json();

    if (!mood || !action) {
      return NextResponse.json(
        { error: 'Missing mood or action' },
        { status: 400 }
      );
    }

    console.log('Getting recommendations for:', { mood, action });

    // Get movie IDs from Gemini
    const movieIds = await getMovieRecommendationsFromGemini(mood, action);
    console.log('Gemini returned movie IDs:', movieIds);

    // Fetch movie details from TMDB
    const movies = await fetchMoviesByIds(movieIds);
    console.log('Fetched movies from TMDB:', movies.length);

    return NextResponse.json({
      movies,
      mood,
      action,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API error:', errorMessage, error);
    return NextResponse.json(
      { error: 'Failed to get recommendations', details: errorMessage },
      { status: 500 }
    );
  }
}
