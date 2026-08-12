# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy full source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build project
RUN npm run build

# Expose port
EXPOSE 3307

# Run migrations and start application
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]