# Multi-stage Dockerfile for the Vite React webapp
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
ENV CI=true

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
