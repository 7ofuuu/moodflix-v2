<p align="center">
  <h1 align="center">🎬 MoodFlix v2</h1>
  <p align="center">
    <strong>Mood-Driven Movie Recommendation Platform</strong>
  </p>
  <p align="center">
    Tell us how you feel — we'll find the perfect movie to match your vibe, every single time.
  </p>
  <p align="center">
    <a href="https://github.com/7ofuuu/moodflix-v2">
      <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" alt="Version" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Next.js-16.2.3-black?style=flat-square&logo=next.js" alt="Next.js" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react" alt="React" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    </a>
  </p>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Pages & Routes](#-pages--routes)
- [API Endpoints](#-api-endpoints)
- [Custom Hooks](#-custom-hooks)
- [UI Components](#-ui-components)
- [Mood System](#-mood-system)
- [Security](#-security)
- [Accessibility](#-accessibility)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MoodFlix v2** is a mood-driven movie recommendation web application that combines the power of the **TMDB API** with **Google Gemini AI** to deliver personalized movie suggestions based on the user's current emotional state. Built with **Next.js 16**, **React 19**, and **TypeScript**, the app features a cinematic dark-mode interface with rich animations, an interactive mood quiz, AI-powered chat recommendations, and advanced movie discovery with multi-dimensional filtering.

The core idea is simple: instead of endlessly scrolling through movie catalogs, the user selects their mood and how they want to feel — and MoodFlix curates a perfect watchlist in seconds.

---

## ✨ Key Features

### 🎭 Mood Quiz
A guided two-step quiz where users pick their current mood (e.g., Happy, Melancholic, Cozy, Romantic) and desired action (e.g., Stay in this mood, Distract, Improve, Explore). The app then fetches AI-curated recommendations via Gemini and enriches them with TMDB data.

### 🤖 AI Chat Assistant
A floating chat widget powered by **Gemini 2.5 Flash Lite** that understands natural-language descriptions of mood and intent. Users can conversationally describe how they feel and receive tailored movie picks — without needing to use the formal quiz.

### 🔍 Discover Movies
A full-featured movie discovery page with:
- **Search** — keyword search powered by TMDB
- **Genre filter** — all 19 TMDB genres
- **Mood filter** — maps moods to genre combinations
- **Era filter** — 2020s, 2010s, 2000s, 90s, 80s, 70s & Earlier
- **Streaming platform filter** — filter by watch providers (Netflix, Disney+, etc.)
- **Sort** — by popularity, rating, release date, or revenue
- **Pagination** — full paginated browsing

### 🎬 Now Playing
A curated section showcasing movies currently in theaters, fetched from the TMDB Now Playing endpoint.

### 💬 Movie Reviews
Aggregated reviews from trending movies, with sorting (newest first, rating, etc.) and pagination.

### 🎨 Last Mood Recommendations
A persistent section on the homepage that remembers the user's last mood (via `localStorage`) and displays a dynamic movie carousel powered by the saved preference.

### 🎯 Mood Picks Dropdown
An expandable dropdown on the homepage showing all available movie picks based on the user's stored mood preference.

### 🖥️ Cinematic UI/UX
- **Animated poster grid** hero background using OGL WebGL
- **Water-drop page transitions** with GSAP
- **Split-text reveal animations** on headings
- **Scroll-triggered reveal** (Intersection Observer)
- **Ambient glow orbs** with float drift animations
- **Film grain overlay** for cinematic texture
- **Card lift hover effects** with smooth spring easing
- **Scroll progress bar** at the top of the page
- **`prefers-reduced-motion` support** for accessibility

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16.2.3](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19.2.4](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + Custom CSS |
| **UI Components** | [shadcn/ui (Radix Nova)](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [GSAP 3.15](https://gsap.com/) + CSS Keyframes |
| **WebGL** | [OGL 1.0](https://oframe.github.io/ogl/) |
| **Font** | [Sora](https://fonts.google.com/specimen/Sora) (Google Fonts) |
| **Movie Data** | [TMDB API v3](https://developers.themoviedb.org/3) |
| **AI Engine** | [Google Gemini 2.5 Flash Lite](https://ai.google.dev/) |
| **Linting** | [ESLint 9](https://eslint.org/) + [eslint-config-next](https://www.npmjs.com/package/eslint-config-next) |
| **Build Tool** | [PostCSS](https://postcss.org/) + [@tailwindcss/postcss](https://tailwindcss.com/docs/installation/using-postcss) |

---

## 🏗️ Architecture

MoodFlix v2 follows a **feature-based architecture** using Next.js App Router with route groups:

```
┌────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                     │
│                                                            │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Homepage │  │Mood Quiz │  │Discover  │  │  Reviews   │  │
│  │ (page)  │  │ (quiz)   │  │(more-    │  │  (reviews) │  │
│  │         │  │          │  │ movies)  │  │            │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │            │             │               │         │
│  ┌────┴────────────┴─────────────┴───────────────┴──────┐  │
│  │              Custom React Hooks                      │  │
│  │  useDiscoverMovies · useQuizRecommendations          │  │
│  │  useMovieReviews · useWatchProviders · useDebounce   │  │
│  │  useScrollProgress                                   │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │  fetch()                         │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                    API ROUTES (Server)                      │
│                         │                                  │
│  ┌──────────────────────┴───────────────────────────────┐  │
│  │  /api/recommendations    → Gemini AI + TMDB hybrid   │  │
│  │  /api/chat               → Gemini conversational AI  │  │
│  │  /api/movies/discover    → TMDB Discover endpoint    │  │
│  │  /api/movies/now-playing → TMDB Now Playing          │  │
│  │  /api/movies/mood-feed   → TMDB mood-based genres    │  │
│  │  /api/movies/reviews     → TMDB popular reviews      │  │
│  │  /api/movies/watch-providers → TMDB watch providers  │  │
│  └──────────────────────────────────────────────────────┘  │
│               │                          │                 │
│     ┌─────────┴──────┐         ┌─────────┴──────┐         │
│     │  Google Gemini │         │   TMDB API v3  │         │
│     │  2.5 Flash Lite│         │                │         │
│     └────────────────┘         └────────────────┘         │
└────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **Server-side API routes** proxy TMDB & Gemini calls, keeping API keys secret and enabling `force-cache` fetch caching.
- **Hybrid AI recommendations** — Gemini selects the best movies from a TMDB-sourced candidate pool; if Gemini fails, TMDB popularity-based fallback kicks in.
- **Client-side mood persistence** via `localStorage` and custom events for cross-component sync.

---

## 📁 Project Structure

```
moodflix-v2/
├── public/                          # Static assets (SVGs, favicon)
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (font, providers, scroll bar)
│   │   ├── page.tsx                 # Homepage (Hero, Mood Grid, Now Playing, etc.)
│   │   ├── globals.css              # Global styles, design tokens, custom animations
│   │   ├── favicon.ico
│   │   ├── privacy/
│   │   │   └── page.tsx             # Privacy Policy page
│   │   ├── terms/
│   │   │   └── page.tsx             # Terms of Service page
│   │   ├── (features)/              # Route group for feature pages
│   │   │   ├── quiz/
│   │   │   │   └── page.tsx         # Mood Quiz page (step-by-step wizard)
│   │   │   ├── more-movies/
│   │   │   │   ├── page.tsx         # Discover Movies page (search + filters)
│   │   │   │   └── error.tsx        # Error boundary
│   │   │   └── reviews/
│   │   │       ├── page.tsx         # Movie Reviews page
│   │   │       └── error.tsx        # Error boundary
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts         # POST /api/chat — AI chat endpoint
│   │       ├── recommendations/
│   │       │   └── route.ts         # POST /api/recommendations — AI recs
│   │       └── movies/
│   │           ├── discover/
│   │           │   └── route.ts     # GET /api/movies/discover
│   │           ├── now-playing/
│   │           │   └── route.ts     # GET /api/movies/now-playing
│   │           ├── mood-feed/
│   │           │   └── route.ts     # GET /api/movies/mood-feed
│   │           ├── reviews/
│   │           │   └── route.ts     # GET /api/movies/reviews
│   │           └── watch-providers/
│   │               └── route.ts     # GET /api/movies/watch-providers
│   ├── components/
│   │   ├── ui/                      # Shared UI components
│   │   │   ├── ai-chat.tsx          # Floating AI chat widget
│   │   │   ├── navbar.tsx           # Navigation bar
│   │   │   ├── footer.tsx           # Footer
│   │   │   ├── movie-card.tsx       # Movie card with poster & info
│   │   │   ├── button.tsx           # shadcn Button
│   │   │   ├── card.tsx             # shadcn Card
│   │   │   ├── select.tsx           # shadcn Select
│   │   │   ├── pagination.tsx       # shadcn Pagination
│   │   │   ├── now-playing.tsx      # Now Playing carousel
│   │   │   ├── last-mood-recommendations.tsx  # Mood-based recs
│   │   │   ├── mood-picks-dropdown.tsx        # Expandable mood picks
│   │   │   ├── circular-gallery.tsx  # Circular image gallery
│   │   │   ├── grid-motion.tsx       # Animated poster grid (OGL)
│   │   │   ├── cursor-emoji-hero.tsx # Cursor-following emoji
│   │   │   ├── water-drop-transition.tsx # Page transition effect
│   │   │   ├── split-text.tsx        # Word-by-word text reveal
│   │   │   ├── reveal.tsx            # Scroll-triggered reveal
│   │   │   ├── scroll-progress.tsx   # Top scroll progress bar
│   │   │   └── theme-controller.tsx  # Theme management
│   │   └── features/                # Feature-specific components
│   │       ├── quiz/
│   │       │   ├── MoodSelector.tsx       # Step 1: Mood selection
│   │       │   ├── ActionSelector.tsx     # Step 2: Action selection
│   │       │   └── MovieRecommendations.tsx # Step 3: Results
│   │       ├── more-movies/
│   │       │   ├── MoreMoviesFilters.tsx   # Filter bar
│   │       │   └── SearchInput.tsx        # Search input
│   │       ├── reviews/
│   │       │   ├── ReviewCard.tsx         # Review display card
│   │       │   └── ReviewsSort.tsx        # Sort dropdown
│   │       └── popular/
│   │           └── PopularPagination.tsx  # Pagination controls
│   ├── hooks/                        # Custom React hooks
│   │   ├── useDebounce.ts            # Input debouncing
│   │   ├── useDiscoverMovies.ts      # Movie discovery with filters
│   │   ├── useMovieReviews.ts        # Reviews fetching
│   │   ├── useQuizRecommendations.ts # AI quiz recommendations
│   │   ├── useScrollProgress.ts      # Scroll position tracking
│   │   └── useWatchProviders.ts      # Watch providers list
│   ├── lib/                          # Utility functions
│   │   ├── constants.ts              # Genres, eras, sort options
│   │   ├── mood.ts                   # Mood mapping & validation
│   │   ├── tmdb.ts                   # TMDB API client
│   │   ├── sanitize.ts              # Input sanitization
│   │   └── utils.ts                  # General utilities (cn)
│   └── types/
│       └── movie.ts                  # TypeScript interfaces
├── .env                              # Environment variables (gitignored)
├── .gitignore
├── components.json                   # shadcn/ui configuration
├── eslint.config.mjs                 # ESLint configuration
├── next.config.ts                    # Next.js configuration
├── package.json
├── postcss.config.mjs                # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm / yarn)
- **TMDB API Account** — [Sign up here](https://www.themoviedb.org/signup)
- **Google Gemini API Key** — [Get it here](https://aistudio.google.com/app/apikey) (optional, for AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/7ofuuu/moodflix-v2.git
cd moodflix-v2

# 2. Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root (or copy from `.env.example` if available):

```env
# TMDB Configuration
NEXT_PUBLIC_TMDB_API_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_API_TOKEN=your_tmdb_bearer_token_here

# Google Gemini AI (optional — AI features will be disabled without it)
GEMINI_API_KEY=your_gemini_api_key_here
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_TMDB_API_BASE_URL` | ✅ Yes | TMDB API v3 base URL |
| `NEXT_PUBLIC_TMDB_API_TOKEN` | ✅ Yes | TMDB Bearer token (Read Access Token, **not** API key) |
| `GEMINI_API_KEY` | ❌ Optional | Google Gemini API key for AI-powered recommendations and chat |

> **Note:** Without a `GEMINI_API_KEY`, the Mood Quiz will fall back to TMDB-based popularity recommendations, and the AI Chat feature will return a `503 Service Unavailable`.

### Running the App

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint check
npm run lint
```

The app will be available at **http://localhost:3000**.

---

## 📄 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Homepage | Hero section, mood categories grid, last mood recommendations, now playing, AI chat |
| `/quiz` | Mood Quiz | Step-by-step wizard: Mood → Action → AI-curated recommendations |
| `/quiz?mood=happy` | Mood Quiz (pre-selected) | Directly jumps to the action step with a pre-selected mood |
| `/more-movies` | Discover Movies | Full search & filter movie browsing experience |
| `/reviews` | Movie Reviews | Aggregated reviews from trending movies |
| `/privacy` | Privacy Policy | Static privacy policy page |
| `/terms` | Terms of Service | Static terms of service page |

---

## 🔌 API Endpoints

All API routes are server-side Next.js Route Handlers located under `src/app/api/`.

### `POST /api/recommendations`

AI-powered movie recommendations using a Gemini + TMDB hybrid approach.

**Request Body:**
```json
{
  "mood": "happy",
  "action": "stay"
}
```

**Response:**
```json
{
  "movies": [
    {
      "id": 550,
      "title": "Movie Title",
      "poster_path": "/path.jpg",
      "release_date": "2024-01-01",
      "vote_average": 8.5,
      "overview": "...",
      "genre_names": ["Comedy", "Drama"],
      "recommendation_reason": "Picked to match your current vibe..."
    }
  ],
  "mood": "happy",
  "action": "stay",
  "source": "gemini-hybrid"
}
```

| Field | Type | Description |
|---|---|---|
| `mood` | `string` | One of: `happy`, `sad`, `excited`, `cozy`, `nostalgic`, `scattered`, `romantic`, `adventurous` |
| `action` | `string` | One of: `stay`, `distract`, `improve`, `explore` |
| `source` | `string` | `"gemini-hybrid"` or `"tmdb-fallback"` |

---

### `POST /api/chat`

Conversational AI chat endpoint powered by Gemini.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "I'm feeling really cozy tonight" }
  ]
}
```

**Response:**
```json
{
  "reply": "Sounds like a perfect night for a warm movie! ...",
  "mood": "cozy",
  "action": null,
  "ready": false,
  "movies": []
}
```

When `ready` is `true`, the `movies` array will contain up to 8 movie recommendations.

---

### `GET /api/movies/discover`

Proxy to TMDB Discover endpoint with sanitized parameters.

**Query Parameters:** `page`, `sort_by`, `with_genres`, `query`, `primary_release_date.gte`, `primary_release_date.lte`, `with_watch_providers`

---

### `GET /api/movies/now-playing`

Returns movies currently playing in theaters.

---

### `GET /api/movies/mood-feed`

Returns movies filtered by mood-based genre mapping.

**Query Parameters:** `mood`, `page`

---

### `GET /api/movies/reviews`

Returns reviews from trending movies.

**Query Parameters:** `page`, `sort_by`

---

### `GET /api/movies/watch-providers`

Returns available streaming/watch providers from TMDB.

---

## 🪝 Custom Hooks

| Hook | Description |
|---|---|
| `useDiscoverMovies` | Fetches movies with search, genre, mood, era, provider filters and pagination |
| `useQuizRecommendations` | Manages the mood quiz flow and fetches AI-powered recommendations |
| `useMovieReviews` | Fetches paginated movie reviews with sort support |
| `useWatchProviders` | Fetches the list of available watch/streaming providers |
| `useDebounce` | Debounces input values to prevent excessive API calls |
| `useScrollProgress` | Tracks the vertical scroll progress as a 0–1 fraction |

---

## 🧩 UI Components

### Shared UI (`src/components/ui/`)

| Component | Description |
|---|---|
| `AiChat` | Floating AI chatbot widget with message history and movie cards |
| `Navbar` | Responsive navigation bar with links to Quiz, Discover, Reviews |
| `Footer` | Site footer with links to Privacy & Terms |
| `MovieCard` | Movie poster card with rating badge, title, year, and hover effects |
| `NowPlaying` | Horizontally scrollable Now Playing movie section |
| `LastMoodRecommendations` | Dynamic recommendations carousel based on stored mood |
| `MoodPicksDropdown` | Expandable dropdown showing all mood-filtered movies |
| `CircularGallery` | WebGL-powered circular image gallery |
| `GridMotion` | Animated poster grid background on the hero section (OGL) |
| `CursorEmojiHero` | Cursor-following emoji effect |
| `WaterDropTransition` | Full-page water-drop transition effect (GSAP) |
| `SplitText` | Word-by-word animated text reveal |
| `Reveal` | Scroll-triggered fade-in animation (Intersection Observer) |
| `ScrollProgress` | Horizontal scroll progress bar at page top |
| `ThemeController` | Dark/light theme management |
| `Button`, `Card`, `Select`, `Pagination` | shadcn/ui primitives |

### Feature Components (`src/components/features/`)

| Component | Description |
|---|---|
| `MoodSelector` | Quiz Step 1: 8-mood grid with icons and vibe descriptions |
| `ActionSelector` | Quiz Step 2: 4-action cards (Stay, Distract, Improve, Explore) |
| `MovieRecommendations` | Quiz Step 3: AI-curated results with reason badges |
| `MoreMoviesFilters` | Filter bar with genre, mood, era, provider, and sort selects |
| `SearchInput` | Debounced search input with clear button |
| `ReviewCard` | Review card with author, rating, content preview |
| `ReviewsSort` | Sort dropdown for reviews (newest, rating, etc.) |
| `PopularPagination` | Reusable pagination controls |

---

## 🎭 Mood System

MoodFlix maps 8 moods to TMDB genre IDs for movie discovery:

| Mood | Display Label | TMDB Genres | Vibe |
|---|---|---|---|
| `happy` | Happy | Comedy, Family, Music | Bright and playful |
| `sad` | Melancholic | Drama, Romance | Quiet and reflective |
| `excited` | Thrilled | Action, Adventure, Thriller | Fast and energetic |
| `cozy` | Cozy | Family, Animation, Comedy | Warm and calm |
| `nostalgic` | Nostalgic | Drama, Romance, History | Classic and dreamy |
| `scattered` | Scattered | Animation, Comedy, Adventure | Grounded and refocused |
| `romantic` | Romantic | Romance, Comedy, Drama | Tender and intimate |
| `adventurous` | Adventurous | Adventure, Action, Sci-Fi | Bold and exploratory |

### Actions

After selecting a mood, the user chooses an **action** that influences the recommendation strategy:

| Action | Description | Sort Strategy |
|---|---|---|
| `stay` | Match the current mood perfectly | Popularity descending |
| `distract` | Take the mind off things | Popularity descending |
| `improve` | Lift the spirits | Popularity descending |
| `explore` | Try something different | Rating descending |

---

## 🔒 Security

MoodFlix implements several security measures:

- **Input sanitization** — All user inputs are stripped of HTML tags and control characters (`src/lib/sanitize.ts`)
- **API key protection** — TMDB Bearer tokens are proxied through server-side API routes; `GEMINI_API_KEY` is server-only
- **Security headers** — Configured in `next.config.ts`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-DNS-Prefetch-Control: on`
- **Integer parameter validation** — Numeric query params are validated with bounds checking
- **Search length limit** — Max 200 characters for search queries

---

## ♿ Accessibility

- **Semantic HTML** — Proper use of `<section>`, `<nav>`, `<main>`, `<footer>`, `aria-label`, `aria-labelledby`, `aria-hidden`, `role`
- **`prefers-reduced-motion`** — All animations are disabled for users who prefer reduced motion
- **Keyboard navigation** — Interactive elements are focusable and keyboard accessible
- **Alt text** — Images include descriptive alt attributes
- **ARIA attributes** — Expandable sections use `aria-expanded` and `aria-controls`

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'feat: add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please follow [Conventional Commits](https://www.conventionalcommits.org/) convention for commit messages.

---

## 📜 License

This project is for educational purposes as part of the **DevOps** course at the **Software Engineering** program (Semester 6).

---

<p align="center">
  Built with ❤️
</p>
