# syntax=docker/dockerfile:1

# ---- Stage 1: deps + build ----
FROM node:20-alpine AS builder

# Next.js (sharp) butuh libc6-compat di Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build args untuk var client-side (NEXT_PUBLIC_*) - di-bake saat build
ARG NEXT_PUBLIC_TMDB_API_BASE_URL
ARG NEXT_PUBLIC_TMDB_API_TOKEN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_TMDB_API_BASE_URL=$NEXT_PUBLIC_TMDB_API_BASE_URL
ENV NEXT_PUBLIC_TMDB_API_TOKEN=$NEXT_PUBLIC_TMDB_API_TOKEN
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies (pakai lockfile untuk reproducible build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source & build (menghasilkan .next/standalone)
COPY . .
RUN npm run build

# ---- Stage 2: runner (image final, ringan) ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Jalankan sebagai non-root demi keamanan
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Ambil hanya hasil build yang diperlukan dari stage builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
