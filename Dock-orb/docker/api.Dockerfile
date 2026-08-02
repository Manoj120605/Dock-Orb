FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json* ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY package.json package-lock.json* ./
RUN npm ci --workspace=apps/api

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY apps/api/ ./apps/api/
COPY packages/shared-types/ ./packages/shared-types/
COPY package.json turbo.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build NestJS
RUN cd apps/api && npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

USER nestjs
EXPOSE 3001

CMD ["node", "dist/main.js"]
