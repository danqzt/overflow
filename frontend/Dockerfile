FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS builder
WORKDIR /app

# 1. Copy config files. We use the wildcard * so the build
# won't fail if the .npmrc is missing, though it's required for your setup.
COPY package.json pnpm-lock.yaml .npmrc* ./

# 2. Install dependencies within the same stage to keep symlinks valid
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 3. Copy source and build
COPY . .
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tanstack

# TanStack Start / Nitro typically outputs to .output
COPY --from=builder --chown=tanstack:nodejs /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

USER tanstack

EXPOSE 13000

ENV PORT=13000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]