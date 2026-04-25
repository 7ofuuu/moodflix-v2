'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/auth-client';
import { logger } from '@/lib/logger';
import { fetchLastMood } from '@/lib/mood-history';
import { setSessionExpiry, clearMoodCache } from '@/lib/movie-cache';
import { LAST_MOOD_EVENT, LAST_MOOD_STORAGE_KEY } from '@/lib/mood';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setUserProfile(data);
        }
      } catch (error) {
        logger.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUserProfile(data);
        } else {
          setUserProfile(null);
        }

        if (event === 'SIGNED_IN' && session?.user) {
          if (session.expires_at) {
            setSessionExpiry(session.expires_at);
          }
          const mood = await fetchLastMood(supabase, session.user.id);
          if (mood !== null && typeof window !== 'undefined') {
            window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, mood);
            window.dispatchEvent(new CustomEvent(LAST_MOOD_EVENT, { detail: { mood } }));
          }
        }

        if (event === 'SIGNED_OUT') {
          clearMoodCache();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, userProfile, isLoading };
}
