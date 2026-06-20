# Shrinkly — Full-Stack SaaS URL Shortener with Analytics

A production-grade URL shortener handling **1000+ redirects/sec** with a React dashboard, JWT authentication, geo-IP click analytics, Redis caching for **sub-5ms redirects**, sliding-window rate limiting, and automated CI/CD deployment to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│                    Static files + API routing                     │
└─────────────┬───────────────────────────────────┬───────────────┘
              │                                   │
              ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────────┐
│   React SPA (Vite)      │         │   Express API Server        │
│   - Dashboard           │         │   - JWT Auth                │
│   - Analytics Charts    │         │   - URL CRUD                │
│   - URL Management      │         │   - Click Tracking          │
│   - TailwindCSS         │         │   - Rate Limiting           │
└─────────────────────────┘         └──────┬──────────┬───────────┘
                                           │          │
                                           ▼          ▼
                                    ┌──────────┐ ┌──────────┐
                                    │  Redis   │ │PostgreSQL│
                                    │  Cache   │ │   DB     │
                                    │(sub-5ms) │ │ (Prisma) │
                                    └──────────┘ └──────────┘
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18, Vite, TailwindCSS | Fast dev experience, utility-first styling |
| Charts | Recharts | Composable React chart library |
| Backend | Node.js, Express | Non-blocking I/O for high-throughput redirects |
| ORM | Prisma | Type-safe queries, migrations, schema-first |
| Database | PostgreSQL 15 | ACID compliance, complex analytics queries |
| Cache | Redis 7 | In-memory store for sub-5ms URL lookups |
| Auth | JWT + bcrypt | Stateless auth, secure password hashing |
| Analytics | geoip-lite, ua-parser-js | IP geolocation, device/browser detection |
| Infra | Docker, nginx, GitHub Actions | Containerized deployment, CI/CD |
| Cloud | AWS ECS/ECR | Scalable container orchestration |

## Features

- **URL Shortening** — Generate 7-char nanoid codes or custom aliases
- **Sub-5ms Redirects** — Redis-first lookup with DB fallback
- **Click Analytics** — Country, city, device, browser, OS, referrer tracking
- **Batch Click Processing** — In-memory buffer flushes every 5s or 100 clicks
- **Sliding-Window Rate Limiting** — Redis-backed: 100 req/min general, 1000/sec redirects
- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **Dashboard** — Real-time stats cards, URL management, quick shorten form
- **Analytics Charts** — Line, bar, pie charts with Recharts
- **Dark Theme UI** — Glass-morphism cards, gradient accents, responsive design
- **Docker Compose** — One-command local development setup
- **CI/CD Pipeline** — GitHub Actions → Docker → AWS ECS

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local dev without Docker)

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/arvind-04/shrinkly.git
cd shrinkly

# Copy environment file
cp server/.env.example server/.env

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec server npx prisma migrate deploy
```

The app will be available at `http://localhost` (nginx) or:
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

### Local Development

```bash
# Start database services
docker-compose -f docker-compose.dev.yml up -d

# Backend
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### URLs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/urls` | Create short URL |
| GET | `/api/urls` | List user's URLs (paginated) |
| GET | `/api/urls/:id/stats` | Get URL analytics |
| DELETE | `/api/urls/:id` | Delete (soft) a URL |
| GET | `/:shortCode` | Redirect to original URL |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard summary stats |
| GET | `/api/analytics/clicks?period=30d` | Clicks over time |
| GET | `/api/analytics/countries` | Top countries |
| GET | `/api/analytics/devices` | Device breakdown |
| GET | `/api/analytics/browsers` | Browser breakdown |
| GET | `/api/analytics/referrers` | Top referrers |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `REDIS_URL` | redis://localhost:6379 | Redis connection string |
| `JWT_SECRET` | - | JWT signing secret |
| `JWT_EXPIRES_IN` | 7d | Token expiry |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |

## Performance

- **Redirect Latency**: <5ms (Redis cache hit), <20ms (DB fallback + cache populate)
- **Throughput**: 1000+ redirects/sec per instance
- **Click Tracking**: Non-blocking, batched writes (100 clicks or 5s interval)
- **Rate Limiting**: Redis-backed sliding window, no memory leaks

## Project Structure

```
shrinkly/
├── server/
│   ├── prisma/           # Schema + migrations
│   └── src/
│       ├── config/       # App config, Redis, Prisma
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, rate limiting, errors
│       ├── routes/       # Express routers
│       └── services/     # Cache, click tracker
├── client/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context
│       ├── hooks/        # Custom hooks
│       ├── pages/        # Route pages
│       └── services/     # API client
├── docker/               # Dockerfiles
├── nginx/                # Nginx config
└── .github/workflows/    # CI/CD pipelines
```

## License

MIT
