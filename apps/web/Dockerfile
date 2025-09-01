FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
