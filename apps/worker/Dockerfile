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

CMD ["npm", "start"]
