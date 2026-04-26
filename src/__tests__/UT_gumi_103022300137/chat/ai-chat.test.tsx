import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AiChat } from '@/components/ui/ai-chat';
import {
  LAST_ACTION_STORAGE_KEY,
  LAST_MOOD_STORAGE_KEY,
  LAST_MOOD_UPDATED_KEY,
} from '@/lib/mood';
import { saveLastRecommendations } from '@/lib/last-recommendations';

jest.mock('next/image', () => {
  const MockImage = ({
    src,
    alt,
    fill,
    sizes,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    [key: string]: unknown;
  }) => {
    void fill;
    void sizes;
    return <span data-src={src} data-alt={alt} {...rest} />;
  };

  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('@/lib/last-recommendations', () => ({
  saveLastRecommendations: jest.fn(),
}));

const mockedSaveLastRecommendations =
  saveLastRecommendations as jest.MockedFunction<typeof saveLastRecommendations>;

function makeMovies(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: 600 + index,
    title: `Movie ${index + 1}`,
    poster_path: `/poster-${index + 1}.jpg`,
    backdrop_path: `/backdrop-${index + 1}.jpg`,
    release_date: '2024-01-01',
    vote_average: 7.5,
    overview: `Overview ${index + 1}`,
  }));
}

const MANY_MOVIES_RESPONSE = makeMovies(50);
const MOVIES_RESPONSE = makeMovies(1);

function openChatAndSend(message: string) {
  fireEvent.click(screen.getByLabelText('Open AI movie chat'));

  const input = screen.getByLabelText('Chat message input');
  fireEvent.change(input, { target: { value: message } });
  fireEvent.click(screen.getByLabelText('Send message'));
}

describe('AiChat', () => {
  beforeEach(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: jest.fn(),
    });

    global.fetch = jest.fn();
    mockedSaveLastRecommendations.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves latest recommendations to shared storage when chat returns movies', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: 'Perfect picks for tonight.',
        movies: MANY_MOVIES_RESPONSE,
        mood: 'happy',
        action: 'stay',
        ready: true,
      }),
    });

    render(<AiChat />);
    openChatAndSend('I feel happy tonight');

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      expect(mockedSaveLastRecommendations).toHaveBeenCalledTimes(1);
    });

    const payload = mockedSaveLastRecommendations.mock.calls[0][0];
    expect(payload.mood).toBe('happy');
    expect(payload.action).toBe('stay');
    expect(payload.source).toBe('ai-chat');
    expect(payload.movies).toHaveLength(50);
  });

  it('falls back to mood/action localStorage update when movies are empty', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: 'Noted your vibe.',
        movies: [],
        mood: 'happy',
        action: 'stay',
        ready: true,
      }),
    });

    render(<AiChat />);
    openChatAndSend('Please suggest something');

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(mockedSaveLastRecommendations).not.toHaveBeenCalled();
    expect(setItemSpy).toHaveBeenCalledWith(LAST_MOOD_STORAGE_KEY, 'happy');
    expect(setItemSpy).toHaveBeenCalledWith(LAST_ACTION_STORAGE_KEY, 'stay');
    expect(setItemSpy).toHaveBeenCalledWith(LAST_MOOD_UPDATED_KEY, expect.any(String));
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'moodflix:lastMoodUpdated' })
    );
  });

  it('normalizes mood and action aliases before saving shared recommendations', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reply: 'Got it.',
        movies: MOVIES_RESPONSE,
        mood: 'melancholic',
        action: 'distraction',
        ready: true,
      }),
    });

    render(<AiChat />);
    openChatAndSend('I am feeling melancholic');

    await waitFor(() => {
      expect(mockedSaveLastRecommendations).toHaveBeenCalledWith({
        mood: 'sad',
        action: 'distract',
        movies: MOVIES_RESPONSE,
        source: 'ai-chat',
      });
    });
  });
});
