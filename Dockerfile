# ══════════════════════════════════════════════════════════════
#  GReg IDE Enterprise — Production Dockerfile
#  Multi-stage: deps → builder → minimal runner
# ══════════════════════════════════════════════════════════════
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ARG NEXT_PUBLIC_JUDGE0_URL=https://ce.judge0.com
ARG NEXT_PUBLIC_ADMIN_SECRET=greg-admin-2024
ENV NEXT_PUBLIC_JUDGE0_URL=$NEXT_PUBLIC_JUDGE0_URL
ENV NEXT_PUBLIC_ADMIN_SECRET=$NEXT_PUBLIC_ADMIN_SECRET
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
