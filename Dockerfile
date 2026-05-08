# Multi-stage build for a Vite + React app with a Node API server
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Runtime image runs a small Node server that serves the SPA and API routes
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY api ./api
COPY public ./public
COPY server.js ./server.js

EXPOSE 3000
CMD ["node", "server.js"]
