# Use a newer Node.js version to satisfy pdfjs-dist requirements (>=20.16.0)
FROM node:20.18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@12.4.1

ENV NEXT_TELEMETRY_DISABLED=1

# --- Dependencies stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and manifest first (layer cached until these change)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install with cache mount for faster rebuilds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm i --frozen-lockfile

# --- Builder stage ---
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package.json and Prisma schema for prisma generate
# The lockfile and workspace file are required here too: pnpm verifies
# node_modules against them before running the command. Without them pnpm
# re-resolves and re-installs deps (drifting from the lockfile) and, missing
# the allowBuilds policy in pnpm-workspace.yaml, fails with ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy the rest of the application source
COPY . .

# Build the application
RUN pnpm run build

# --- Production stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl

# Prisma CLI (pinned to the version in package.json) so pending database
# migrations can be applied at container start (see docker-entrypoint.sh)
RUN npm install -g prisma@6.19.3
ENV PRISMA_HIDE_UPDATE_MESSAGE=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Entrypoint applies pending DB migrations before booting the app
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Remove build cache (not needed at runtime)
RUN rm -rf .next/cache

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
