/**
 * Chat and messaging related types
 */

import type { MovieDetails } from './movie';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  movies?: MovieDetails[];
}
