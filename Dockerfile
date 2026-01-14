# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (need devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the Slack bot server
CMD ["node", "dist/slack-bot.js"]
