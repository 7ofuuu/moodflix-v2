'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MessageCircle, X, Send, Film, Sparkles } from 'lucide-react';
import { MovieDetails } from '@/types/movie';
import {
  LAST_ACTION_STORAGE_KEY,
  LAST_MOOD_EVENT,
  LAST_MOOD_STORAGE_KEY,
  LAST_MOOD_UPDATED_KEY,
  VALID_ACTIONS,
  isMoodKey,
} from '@/lib/mood';
import { saveLastRecommendations } from '@/lib/last-recommendations';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  movies?: MovieDetails[];
}

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

const CHAT_MOOD_ALIASES: Record<string, string> = {
  melancholic: 'sad',
  thrilled: 'excited',
};

const CHAT_ACTION_ALIASES: Record<string, string> = {
  distraction: 'distract',
  'stay in this mood': 'stay',
  'feel better': 'improve',
  'explore something different': 'explore',
};

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm MoodFlix AI. Tell me how you're feeling tonight and I'll find the perfect movie for you.",
};

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const applyDetectedPreferences = useCallback((
    mood: string | null,
    action: string | null,
    movies: MovieDetails[] = []
  ) => {
    if (typeof window === 'undefined') {
      return;
    }

    const moodCandidate = mood?.toLowerCase().trim();
    const mappedMood = moodCandidate ? (CHAT_MOOD_ALIASES[moodCandidate] ?? moodCandidate) : null;
    const normalizedMood = mappedMood && isMoodKey(mappedMood) ? mappedMood : null;

    const actionCandidate = action?.toLowerCase().trim();
    const mappedAction = actionCandidate ? (CHAT_ACTION_ALIASES[actionCandidate] ?? actionCandidate) : null;
    const normalizedAction =
      mappedAction && VALID_ACTIONS.includes(mappedAction as (typeof VALID_ACTIONS)[number])
        ? mappedAction
        : null;

    if (!normalizedMood && !normalizedAction) {
      return;
    }

    const nextMood = normalizedMood ?? window.localStorage.getItem(LAST_MOOD_STORAGE_KEY) ?? null;
    const nextAction = normalizedAction ?? window.localStorage.getItem(LAST_ACTION_STORAGE_KEY) ?? null;

    if (normalizedMood && movies.length > 0) {
      saveLastRecommendations({
        mood: normalizedMood,
        action: nextAction,
        movies,
        source: 'ai-chat',
      });
      return;
    }

    if (normalizedMood) {
      window.localStorage.setItem(LAST_MOOD_STORAGE_KEY, normalizedMood);
    }
    if (normalizedAction) {
      window.localStorage.setItem(LAST_ACTION_STORAGE_KEY, normalizedAction);
    }

    window.localStorage.setItem(LAST_MOOD_UPDATED_KEY, new Date().toISOString());
    window.dispatchEvent(
      new CustomEvent(LAST_MOOD_EVENT, {
        detail: {
          mood: nextMood,
          action: nextAction,
          source: 'ai-chat',
        },
      })
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter(m => m.role !== 'assistant' || m === INITIAL_MESSAGE || m.content !== INITIAL_MESSAGE.content)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const data = await res.json() as {
        reply: string;
        movies: MovieDetails[];
        mood: string | null;
        action: string | null;
        ready: boolean;
      };

      applyDetectedPreferences(data.mood, data.action, data.movies ?? []);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          movies: data.movies?.length ? data.movies : undefined,
        },
      ]);
    } catch (error) {
      console.error('AI chat request failed', error);
    } finally {
      setIsLoading(false);
    }
  }, [applyDetectedPreferences, input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isOpen
            ? 'bg-white/10 backdrop-blur-md border border-white/15 text-white rotate-0'
            : 'bg-amber-400 text-black hover:bg-amber-300 hover:scale-105'
        }`}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI movie chat'}
      >
        {isOpen ? (
          <X className='h-5 w-5' />
        ) : (
          <MessageCircle className='h-6 w-6' />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] transition-all duration-400 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        role='dialog'
        aria-label='AI Movie Recommendations Chat'
        aria-hidden={!isOpen}
      >
        <div className='flex flex-col rounded-2xl border border-white/12 bg-black/92 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] overflow-hidden' style={{ height: '520px' }}>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/4 shrink-0'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/15 border border-amber-400/30'>
                <Sparkles className='h-4 w-4 text-amber-400' />
              </div>
              <div>
                <span className='text-sm font-bold text-white'>MoodFlix AI</span>
                <div className='flex items-center gap-1'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]' />
                  <span className='text-[10px] text-white/40 font-medium'>Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className='text-xs text-white/30 hover:text-white/60 transition-colors'
            >
              New chat
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]'>
            {messages.map((message, i) => (
              <div key={i} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/30 mt-1'>
                    <Film className='h-3 w-3 text-amber-400' />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-amber-400/20 border border-amber-400/25 text-white rounded-tr-sm'
                        : 'bg-white/6 border border-white/8 text-white/85 rounded-tl-sm'
                    }`}
                  >
                    {message.content}
                  </div>

                  {/* Movie results */}
                  {message.movies && message.movies.length > 0 && (
                    <div className='w-full'>
                      <p className='text-[11px] text-white/40 mb-2 font-medium uppercase tracking-wide'>Recommendations</p>
                      <div className='flex gap-2 overflow-x-auto [scrollbar-width:none] pb-1'>
                        {message.movies.map(movie => (
                          <div key={movie.id} className='flex-shrink-0 w-16 group'>
                            <div className='relative h-24 w-16 overflow-hidden rounded-lg bg-white/5'>
                              {movie.poster_path ? (
                                <Image
                                  src={`${TMDB_POSTER_BASE}${movie.poster_path}`}
                                  alt={movie.title}
                                  fill
                                  sizes='64px'
                                  className='object-cover transition-transform duration-200 group-hover:scale-105'
                                />
                              ) : (
                                <div className='flex h-full items-center justify-center'>
                                  <Film className='h-5 w-5 text-white/20' />
                                </div>
                              )}
                            </div>
                            <p className='mt-1 text-[10px] text-white/50 line-clamp-2 leading-tight'>{movie.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className='border-t border-white/10 px-3 py-3 bg-white/3 shrink-0'>
            <div className='flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 focus-within:border-amber-400/40 transition-colors'>
              <input
                ref={inputRef}
                type='text'
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How are you feeling tonight?"
                className='flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none'
                disabled={isLoading}
                aria-label='Chat message input'
              />
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isLoading}
                className='flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black transition-all hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed'
                aria-label='Send message'
              >
                <Send className='h-3.5 w-3.5' />
              </button>
            </div>
            <p className='mt-1.5 text-center text-[10px] text-white/20'>Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    </>
  );
}
