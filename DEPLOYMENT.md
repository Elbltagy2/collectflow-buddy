# Deployment Guide

## Option 1: VPS Deployment (DigitalOcean, Linode, etc.)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE USER collectflow WITH PASSWORD 'your_secure_password';
CREATE DATABASE collectflow OWNER collectflow;
GRANT ALL PRIVILEGES ON DATABASE collectflow TO collectflow;
\q
```

### 3. Clone and Setup Project

```bash
# Clone your repo
git clone <your-repo-url> /var/www/collectflow
cd /var/www/collectflow

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with production values
```

### 4. Backend .env (Production)

```env
PORT=3001
NODE_ENV=production

# Use your PostgreSQL credentials
DATABASE_URL="postgresql://collectflow:your_secure_password@localhost:5432/collectflow?schema=public"

# Generate secure secrets (use: openssl rand -base64 32)
JWT_SECRET=your-very-long-secure-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-very-long-secure-random-string
JWT_REFRESH_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 5. Initialize Database

```bash
cd /var/www/collectflow/backend
npx prisma migrate deploy
npx prisma db seed
```

### 6. Build Frontend

```bash
cd /var/www/collectflow

# Update API URL in frontend
# Edit src/lib/api.ts - change API_BASE_URL to your domain
# const API_BASE_URL = 'https://api.yourdomain.com/api';

npm install
npm run build
```

### 7. Start Backend with PM2

```bash
cd /var/www/collectflow/backend
npm run build  # If using TypeScript build
pm2 start dist/index.js --name collectflow-api
pm2 save
pm2 startup
```

### 8. Nginx Configuration

```nginx
# /etc/nginx/sites-available/collectflow

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/collectflow/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /uploads {
        alias /var/www/collectflow/backend/uploads;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/collectflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## Option 2: Railway (Easiest)

### Backend Deployment

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add PostgreSQL database from Railway
4. Set environment variables in Railway dashboard
5. Railway auto-detects Node.js and deploys

### Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set root directory to `.` (frontend is at root)
4. Add environment variable: `VITE_API_URL=https://your-railway-backend.up.railway.app/api`
5. Deploy

---

## Option 3: Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: collectflow
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: collectflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://collectflow:your_secure_password@postgres:5432/collectflow
      JWT_SECRET: your-secure-jwt-secret
      JWT_REFRESH_SECRET: your-secure-refresh-secret
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile

```dockerfile
# Dockerfile (root)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Quick Checklist

- [ ] Update `src/lib/api.ts` with production API URL
- [ ] Generate secure JWT secrets
- [ ] Set up PostgreSQL database
- [ ] Run database migrations
- [ ] Build frontend
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates
- [ ] Configure firewall
- [ ] Set up backups for database
