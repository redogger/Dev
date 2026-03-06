# ─────────────────────────────────────────────────────────────
#  Dev-Cloud Pro v3 — Production Dockerfile
#  Multi-stage build: Dependencies → Builder → Runner
# ─────────────────────────────────────────────────────────────

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
RUN npm install --frozen-lockfile

# Stage 2: Build the Next.js app
FROM node:18-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Optional: Judge0 endpoint (set to public CE or your self-hosted instance)
ARG NEXT_PUBLIC_JUDGE0_URL=https://ce.judge0.com
ENV NEXT_PUBLIC_JUDGE0_URL=$NEXT_PUBLIC_JUDGE0_URL

RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
