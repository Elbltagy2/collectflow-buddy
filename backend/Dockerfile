FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (prisma generate runs in postinstall)
RUN npm ci

# Copy rest of source
COPY . .

# Build TypeScript
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/receipts uploads/invoices

EXPOSE 3001

CMD ["node", "dist/index.js"]
