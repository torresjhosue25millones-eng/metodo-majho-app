# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
RUN chmod +x node_modules/.bin/vite
COPY frontend/ ./
RUN node_modules/.bin/vite build

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Copy compiled frontend into Express's public folder
COPY --from=frontend-build /frontend/dist ./public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/index.js"]
