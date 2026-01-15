# A/B Testing Platform - NestJS Backend

A comprehensive A/B testing and feature flags platform built with NestJS, Prisma, PostgreSQL, Redis, and BullMQ.

## 🚀 Features

- **Authentication**: JWT-based auth with refresh tokens
- **Feature Flags**: Boolean, percentage rollout, and variant-based flags
- **Experiments**: A/B testing with variant distribution and metrics tracking
- **Decision API**: Client-facing API for flag evaluation with caching
- **Events Tracking**: Exposure and conversion event ingestion
- **Analytics**: Real-time and aggregated analytics with statistical significance
- **Background Jobs**: Nightly aggregation with BullMQ
- **Caching**: Redis-based caching for high performance

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd nest-ab-testing

# Start all services
docker-compose up -d

# The API will be available at http://localhost:3000
# Swagger docs at http://localhost:3000/docs
```

### Manual Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed

# Start the application
npm run start:dev
```

## 🔧 Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ab_testing"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# BullMQ
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
```

## 📚 API Documentation

Swagger documentation is available at `/docs` when the server is running.

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token

#### Feature Flags
- `GET /api/flags` - List all flags
- `POST /api/flags` - Create flag
- `GET /api/flags/:id` - Get flag by ID
- `PATCH /api/flags/:id` - Update flag
- `DELETE /api/flags/:id` - Delete flag
- `PATCH /api/flags/:id/toggle` - Toggle flag status

#### Variants
- `GET /api/flags/:flagId/variants` - List variants
- `POST /api/flags/:flagId/variants` - Create variant
- `PATCH /api/flags/:flagId/variants/weights` - Update weights

#### Experiments
- `GET /api/experiments` - List experiments
- `POST /api/experiments` - Create experiment
- `POST /api/experiments/:id/start` - Start experiment
- `POST /api/experiments/:id/stop` - Stop experiment
- `GET /api/experiments/:id/results` - Get results

#### Decision API (Client SDK)
- `POST /client/decide` - Get flag decisions
- `GET /client/decide` - Get all flag decisions

#### Events
- `POST /events/exposure` - Track exposure
- `POST /events/conversion` - Track conversion
- `POST /events/exposure/batch` - Batch exposures
- `POST /events/conversion/batch` - Batch conversions

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/flags/:id/summary` - Flag summary
- `GET /api/analytics/experiments/:id` - Experiment analytics

## 📊 Decision Logic

### Boolean Flags
```json
{
  "dark_mode": {
    "enabled": true,
    "reason": "boolean_flag"
  }
}
```

### Percentage Rollout
```javascript
// bucket = hash(clientId + flagKey) % 100
// enabled = bucket < percentage
{
  "new_checkout": {
    "enabled": true,
    "reason": "percentage_rollout_included"
  }
}
```

### Variant Selection
```javascript
// Weighted distribution using cumulative sums
// weights = [50, 25, 25] -> cumulative = [50, 75, 100]
{
  "button_color": {
    "enabled": true,
    "variant": "variant_blue",
    "reason": "variant_selected"
  }
}
```

### Constraints
```json
{
  "rules": [
    { "field": "country", "operator": "in", "value": ["ID", "SG"] },
    { "field": "plan", "operator": "in", "value": ["pro", "enterprise"] },
    { "field": "appVersion", "operator": "gte", "value": "2.3.0" }
  ],
  "operator": "AND"
}
```

Supported operators: `eq`, `neq`, `in`, `nin`, `gt`, `gte`, `lt`, `lte`, `contains`, `regex`

## 🔄 Worker System

The worker runs nightly aggregation jobs:

```bash
# Start worker separately
npm run start:worker
```

Job schedule:
- Daily at 2:00 AM: Aggregate exposures and conversions
- Cleanup: Remove events older than 90 days

## 🗄️ Database Schema

```
users
├── id (uuid, PK)
├── email (unique)
├── password_hash
├── role (ADMIN, USER, VIEWER)
└── timestamps

feature_flags
├── id (uuid, PK)
├── key (unique)
├── name
├── description
├── type (BOOLEAN, PERCENTAGE, VARIANT)
├── enabled
├── created_by (FK -> users)
└── timestamps

flag_variants
├── id (uuid, PK)
├── flag_id (FK)
├── key
└── weight

experiments
├── id (uuid, PK)
├── name
├── flag_id (FK)
├── metrics (jsonb)
├── status (DRAFT, RUNNING, PAUSED, COMPLETED)
├── start_at
├── end_at
└── timestamps

exposures
├── id (uuid, PK)
├── user_id (nullable)
├── flag_id (FK)
├── variant_key
├── timestamp
└── metadata (jsonb)

conversions
├── id (uuid, PK)
├── exposure_id (FK, nullable)
├── experiment_id (FK)
├── metric_key
├── value
└── timestamp

aggregates
├── date
├── flag_id (FK)
├── variant_key
├── impressions
└── conversions
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 📦 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── health.controller.ts    # Health check endpoint
├── modules/
│   ├── auth/              # Authentication module
│   ├── flags/             # Feature flags CRUD
│   ├── experiments/       # Experiments CRUD
│   ├── decision/          # Decision API for clients
│   ├── events/            # Telemetry events
│   ├── analytics/         # Analytics endpoints
│   ├── worker/            # BullMQ worker
│   ├── prisma/            # Database service
│   └── redis/             # Cache service
└── worker/
    ├── main.ts            # Worker entry point
    └── worker-app.module.ts
```

## 🔐 Security

- JWT-based authentication with short-lived access tokens
- Refresh token rotation
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation with class-validator

## 📈 Performance

- Redis caching for flag configurations
- Consistent hashing for bucket assignment
- Batch event processing
- Connection pooling (Prisma)
- Background job processing (BullMQ)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.


