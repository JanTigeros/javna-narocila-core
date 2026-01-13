# Multi-stage Dockerfile for the Vite React webapp
# Use Debian-based Node for the build stage to avoid Alpine musl/native binary issues
FROM node:18-bullseye-slim AS build
WORKDIR /app
ENV CI=true

# Install minimal build dependencies (if any native modules need them)
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage: serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# (optional) copy custom nginx config if you want to enable SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
