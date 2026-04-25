import { supabase } from '@/lib/auth-client';
import { logger } from '@/lib/logger';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const { full_name, bio, user_id } = await request.json();

    if (!user_id || typeof full_name !== 'string') {
      return Response.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Verify token dan get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== user_id) {
      logger.error('Auth error:', authError);
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update user profile di users table
    const { data, error } = await supabase
      .from('users')
      .update({ 
        full_name, 
        bio: bio || null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', user_id)
      .select();

    if (error) {
      logger.error('Error updating user profile:', error);
      return Response.json(
        { error: error.message || 'Failed to update profile' },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data });
  } catch (error) {
    logger.error('Profile update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Verify token dan get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.error('Auth error:', authError);
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      logger.error('Error fetching user profile:', error);
      return Response.json(
        { error: error.message || 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data: profile });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
