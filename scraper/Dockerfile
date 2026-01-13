# Dockerfile for scraper service
# Uses Debian slim and installs common Chromium dependencies so Puppeteer can run
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /app

# Allow puppeteer to download Chromium during npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV NODE_ENV=production

# Install OS-level dependencies required by Chromium / Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  wget \
  fonts-liberation \
  libfontconfig1 \
  libgconf-2-4 \
  libasound2 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  xdg-utils \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
# Use npm ci to ensure deterministic install; change if you prefer yarn
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY . .

# Expose a volume for persistent data (data.json etc.)
VOLUME ["/app/data"]

# Default command: run the scraper
CMD ["node", "server.js"]
