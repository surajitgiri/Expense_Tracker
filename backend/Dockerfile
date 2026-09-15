# ----------------------------------------------------------------------
# Stage 1: Install production dependencies & generate Prisma client
# ----------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma client for production runtime
RUN npx prisma generate

# ----------------------------------------------------------------------
# Stage 2: Build the TypeScript source code
# ----------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for tsc
RUN npm ci

# Generate Prisma client for typechecking
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to dist/
RUN npm run build

# ----------------------------------------------------------------------
# Stage 3: Production runtime image
# ----------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy production node_modules (with generated Prisma client) from deps stage
COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=expressjs:nodejs /app/prisma ./prisma

# Copy compiled JavaScript output from builder stage
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json

USER expressjs

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the compiled Express server
CMD ["node", "dist/index.js"]
