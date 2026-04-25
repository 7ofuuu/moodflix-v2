'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/auth-client';
import { logger } from '@/lib/logger';
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get user profile from users table
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
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
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, userProfile, isLoading };
}
