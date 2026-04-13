# MoodFlix 🎬

> Temukan film yang sesuai dengan mood Anda! Dapatkan rekomendasi film yang dipersonalisasi berdasarkan emosi dan preferensi Anda saat ini.

## 🎯 Fitur Utama

### 1. **Mood-Based Recommendations**
   - Quiz interaktif untuk mendeteksi mood pengguna (Happy, Sad, Excited, Cozy, Nostalgic)
   - Sistem rekomendasi dua langkah: pilih mood → pilih preferensi aksi (Action/Adventure, Romance, Drama, Comedy)
   - Dapatkan rekomendasi film yang dipersonalisasi berdasarkan kombinasi mood dan preferensi

### 2. **Multiple Browsing Options**
   - **Now Playing**: Menampilkan film-film yang sedang tayang di bioskop
   - **Popular Movies**: Daftar film populer dengan filter dan pagination
   - **Top Rated Movies**: Film dengan rating tertinggi dengan browsing interaktif

### 3. **Modern UI/UX**
   - Responsive design yang beradaptasi dengan desktop, tablet, dan mobile
   - Navigasi yang intuitif dengan sticky navbar
   - Movie cards yang menampilkan poster, rating, dan informasi dasar
   - Loading states dan error handling yang proper

### 4. **Filter dan Sorting**
   - Filter film berdasarkan genre (18+ genre berbeda)
   - Pagination untuk navigasi melalui daftar film
   - Sorting dan filtering di halaman Popular dan Top Rated

---

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | [Next.js 16.2.3](https://nextjs.org) |
| **UI Framework** | [React 19.2.4](https://react.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Type Safety** | [TypeScript 5](https://www.typescriptlang.org) |
| **Component Library** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| **Icons** | [Lucide React 1.7.0](https://lucide.dev) |
| **Linting** | [ESLint 9](https://eslint.org) |
| **API Data** | [The Movie Database (TMDB)](https://www.themoviedb.org) |

---

## 📦 Persyaratan Sistem

- **Node.js**: 18.0 atau lebih tinggi
- **npm**: 9.0 atau lebih tinggi (atau yarn/pnpm)
- **API Key TMDB**: Daftar di [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

---

## ⚙️ Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd moodflix-v2
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables
Buat file `.env.local` di root project:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 4. Jalankan Development Server
```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

---

## 📖 Cara Menggunakan

### Halaman Utama (Landing Page)
1. Kunjungi `http://localhost:3000`
2. Lihat hero section dengan call-to-action "Take the Mood Quiz"
3. Scroll down untuk melihat berbagai mood yang tersedia
4. Atau gunakan navbar untuk navigasi ke halaman lain

### Mood Quiz
1. Klik tombol "Take the Mood Quiz" atau navigasi ke `/quiz`
2. **Langkah 1**: Pilih mood Anda saat ini (Happy, Sad, Excited, Cozy, Nostalgic)
3. **Langkah 2**: Pilih preferensi genre/aksi sesuai dengan mood
4. **Langkah 3**: Lihat rekomendasi film yang dipersonalisasi
5. Klik film untuk membuka detail atau retry untuk hasil berbeda

### Popular Movies
1. Navigasi ke halaman Popular (`/popular`)
2. Browse daftar film populer
3. Gunakan filter untuk menyaring berdasarkan genre
4. Gunakan pagination untuk navigasi antar halaman

### Top Rated Movies
1. Navigasi ke halaman Top Rated (`/top-rated`)
2. Browse film-film dengan rating tertinggi
3. Lihat rating dan overview film

---

## 📂 Struktur Proyek

```
moodflix-v2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── (features)/               # Feature routes group
│   │   │   ├── popular/page.tsx      # Popular movies page
│   │   │   ├── quiz/page.tsx         # Mood quiz page
│   │   │   └── top-rated/page.tsx    # Top rated movies page
│   │   └── api/
│   │       └── recommendations/      # API endpoint untuk rekomendasi
│   │
│   ├── components/                   # React Components
│   │   ├── common/                   # Common/shared components
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── movies/               # Movie-related components
│   │   │   ├── popular/              # Popular page components
│   │   │   │   ├── PopularFilters.tsx
│   │   │   │   └── PopularPagination.tsx
│   │   │   └── quiz/                 # Quiz components
│   │   │       ├── ActionSelector.tsx
│   │   │       ├── MoodSelector.tsx
│   │   │       └── MovieRecommendations.tsx
│   │   └── ui/                       # UI components (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── footer.tsx
│   │       ├── movie-card.tsx
│   │       ├── navbar.tsx
│   │       ├── now-playing.tsx
│   │       ├── pagination.tsx
│   │       └── select.tsx
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── usePopularMovies.ts       # Hook untuk data popular movies
│   │   ├── useQuizRecommendations.ts # Hook untuk rekomendasi quiz
│   │   └── useTopRatedMovies.ts      # Hook untuk data top-rated movies
│   │
│   ├── lib/                          # Utility functions dan constants
│   │   ├── constants.ts              # Genre dan konstant lainnya
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── services/                     # API services (untuk fase berikutnya)
│   │
│   └── types/                        # TypeScript type definitions
│       └── movie.ts                  # Movie interface definitions
│
├── public/                           # Static files
├── components.json                   # shadcn/ui configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── next.config.ts                    # Next.js configuration
├── eslint.config.mjs                 # ESLint configuration
└── package.json                      # Project dependencies dan scripts
```

---

## 🔌 API dan Integrasi

### The Movie Database (TMDB) API

Proyek ini mengintegrasikan API dari [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api) untuk mendapatkan data film.

**Endpoint yang Digunakan:**
- `/movie/now_playing` - Film yang sedang tayang
- `/movie/popular` - Film populer
- `/movie/top_rated` - Film rating tertinggi
- `/discover/movie` - Discover film dengan filter

**Autentikasi:**
Gunakan API Key yang didapatkan dari TMDB dashboard dan masukkan ke dalam `.env.local`:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_key_here
```

**Rate Limiting:**
TMDB API memiliki rate limit. Untuk development gratis, limit adalah 40 request per 10 detik.

---

## 🧭 Halaman dan Rute

| Rute | Deskripsi | Component |
|------|-----------|-----------|
| `/` | Landing page utama | `app/page.tsx` |
| `/quiz` | Mood-based recommendation quiz | `app/(features)/quiz/page.tsx` |
| `/popular` | Popular movies browsing | `app/(features)/popular/page.tsx` |
| `/top-rated` | Top rated movies browsing | `app/(features)/top-rated/page.tsx` |
| `/api/recommendations` | API endpoint untuk rekomendasi | `app/api/recommendations/route.ts` |

## 🌍 Environment Variables

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# The Movie Database API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3

# Optional: untuk development dengan mock data
# NEXT_PUBLIC_USE_MOCK_DATA=true
```

**Catatan:**
- `NEXT_PUBLIC_` prefix berarti variabel ini akan expose ke client-side
- Dapatkan `TMDB_API_KEY` dari https://www.themoviedb.org/settings/api

---

## 💻 Development

### Scripts yang Tersedia

```bash
# Jalankan development server dengan hot reload
npm run dev

# Build aplikasi untuk production
npm run build

# Jalankan aplikasi production (setelah build)
npm start

# Jalankan ESLint untuk code quality check
npm run lint
```

### Development Tips

1. **Hot Reload**: Next.js otomatis me-reload file yang berubah
2. **Type Checking**: TypeScript akan otomatis check types
3. **Browser DevTools**: Gunakan React DevTools untuk debugging
4. **Network Tab**: Manitor API calls di browser DevTools Network tab

---

## 🚀 Build dan Deployment

### Production Build

```bash
npm run build
npm start
```

### Deploy ke Vercel (Recommended)

Vercel adalah platform yang dibuat oleh creator Next.js dan optimal untuk Next.js projects.

1. Push kode ke GitHub
2. Kunjungi [vercel.com](https://vercel.com)
3. Import project dari GitHub
4. Setup environment variables di dashboard Vercel
5. Deploy

**Deployment Lainnya:**
- Docker
- AWS Amplify
- Netlify (dengan konfigurasi khusus)
- Self-hosted (VPS/Dedicated Server)

---

## 📋 TODO / Roadmap

- [ ] Integrasi dengan user authentication (NextAuth.js)
- [ ] Wishlist/Favorites untuk menggimpan film favorit
- [ ] Advanced recommendation algorithm
- [ ] User preferences dan viewing history
- [ ] Social features (share recommendations)
- [ ] Dark mode toggle
- [ ] PWA support untuk offline browsing
- [ ] Multilingual support (EN, ID, etc)
- [ ] Movie detail page dengan trailer
- [ ] Search functionality

---

## 🤝 Kontribusi

Kami menerima kontribusi! Untuk berkontribusi:

1. Fork repository ini
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📝 License

Project ini menggunakan data dari [The Movie Database (TMDB)](https://www.themoviedb.org/). Pastikan untuk mengikuti terms and conditions TMDB API.

---

## 📚 Resources & Dokumentasi

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TMDB API Documentation](https://developer.themoviedb.org/docs)

## 🏆 Features Highlight

✨ **Modern Tech Stack** - Next.js 16, React 19, TypeScript, Tailwind CSS
🎨 **Beautiful UI** - shadcn/ui components dengan custom styling
⚡ **Performance** - Optimized image loading, code splitting
📱 **Responsive** - Mobile-first design
🔍 **Type Safe** - Full TypeScript support
🎯 **Mood-Based** - Unik recommendation system berdasarkan emosi

---

**Dibuat dengan ❤️ untuk movie lovers yang ingin menemukan film sesuai mood mereka.**
