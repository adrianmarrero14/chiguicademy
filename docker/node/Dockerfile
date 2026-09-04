FROM node:22-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Variables for reliable hot-reload in Linux container development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Development port
EXPOSE 3000

# Default command
CMD ["sh", "-c", "npm install && npm run dev"]
