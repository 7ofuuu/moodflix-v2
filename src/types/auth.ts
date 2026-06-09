/**
 * Authentication and user profile related types
 */

import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}
