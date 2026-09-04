# syntax=docker/dockerfile:1
# Build context: ./api

# ---------- base ----------
FROM node:24-alpine AS base
WORKDIR /app
# libc6-compat: prebuilt binaries; ffmpeg: media jobs (transcoding, subtitles)
RUN apk add --no-cache libc6-compat ffmpeg
ENV NODE_ENV=development
EXPOSE 3001

# ---------- dev (used by docker-compose) ----------
# Source is bind-mounted; node_modules lives in a named volume.
FROM base AS dev
CMD ["sh", "-c", "npm install && npm run start:dev"]

# ---------- build ----------
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build && npm prune --omit=dev

# ---------- prod ----------
FROM node:24-alpine AS prod
WORKDIR /app
RUN apk add --no-cache ffmpeg
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts /app/package.json ./
USER node
EXPOSE 3001
# Worker: override with `node dist/worker.js`
CMD ["node", "dist/main.js"]
