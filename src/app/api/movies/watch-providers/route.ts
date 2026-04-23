import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { fetchTmdb, validateTmdbEnv } from '@/lib/tmdb';

interface TmdbProviderResponse {
  results: Array<{
    provider_id: number;
    provider_name: string;
    logo_path: string;
    display_priorities: Record<string, number>;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    validateTmdbEnv();

    const url = new URL(request.url);
    const watchRegion = url.searchParams.get('watch_region') ?? 'US';

    const data = await fetchTmdb<TmdbProviderResponse>('/watch/providers/movie', {
      watch_region: watchRegion,
      language: 'en-US',
    });

    const providers = (data.results ?? []).map(p => ({
      provider_id: p.provider_id,
      provider_name: p.provider_name,
      logo_path: p.logo_path,
    }));

    return NextResponse.json({ providers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Watch providers API error:', message);
    return NextResponse.json({ error: 'Failed to fetch watch providers' }, { status: 500 });
  }
}
