# SiraLink (ስራLink)

> **Voice-First, Location-Based Marketplace for Ethiopia**  
> Connecting households and small businesses with verified local workers (plumbers, electricians, carpenters, painters, cleaners, mechanics, etc.) in **Amharic (አማርኛ)**, **Afaan Oromoo**, and **English**.

---

## 1. Product Overview

In Ethiopia, traditional text-heavy gig marketplaces fail users who prefer voice communication, have limited technical literacy, or speak local languages like Amharic or Afaan Oromoo. 

**SiraLink** solves this with a **Voice + Location + Local Language** approach:
1. **Client Speaks**: Describes the problem by voice (e.g., *"ቤቴ ውስጥ የውሃ ቧንቧ ተበላሽቷል። በፍጥነት የሚመጣ ሰው እፈልጋለሁ።"*).
2. **AI Categorization**: OpenAI Whisper (or offline dev classifier) transcribes speech and detects the skill category (`PLUMBING`).
3. **PostGIS Proximity Search**: Calculates precise geographic distances with PostGIS `ST_DWithin` and `ST_Distance` on `GEOGRAPHY(Point, 4326)`.
4. **Interactive Map & List**: Displays nearby verified workers with real-time distance in kilometers, ratings, and rates in Ethiopian Birr (ETB).
5. **Job Lifecycle**: Tracks requests through `OPEN` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` with mutual ratings.

---

## 2. Architecture

```text
                 ┌────────────────────────────────┐
                 │       SiraLink Mobile App      │
                 │   React Native Expo / Router   │
                 │  Audio, Location, i18n, Query  │
                 └───────────────┬────────────────┘
                                 │ HTTPS / Multipart
                                 ▼
                 ┌────────────────────────────────┐
                 │       Render Web Service       │
                 │     SiraLink Fastify API       │
                 │   Node.js 24 + Strict TS + Zod │
                 └───┬───────────┬────────────┬───┘
                     │           │            │
      ┌──────────────┴─────┐  ┌──┴─────────┐  └──┬───────────────┐
      ▼                    ▼  ▼            ▼     ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │  │  S3 / R2 /   │  │    OpenAI    │   │  Expo Push   │
│   + PostGIS  │  │ Local Storage│  │ Whisper STT  │   │Notifications │
│ Spatial ST_* │  │ (Audio/Media)│  │ (Am/Om/En)   │   │              │
└──────────────┘  └──────────────┘  └──────────────┘   └──────────────┘
```

---

## 3. Technology Stack

### Mobile (`/mobile`)
- **Framework**: React Native with **Expo SDK 52** and **Expo Router**
- **State & Caching**: TanStack React Query + Zustand
- **Hardware & Native**: Expo Location, Expo AV (Recording & Playback), Expo SecureStore, Expo Notifications
- **Localization**: Tri-lingual engine (`am.json`, `om.json`, `en.json`) supporting Amharic, Afaan Oromoo, and English

### Backend (`/server`)
- **Runtime**: Node.js 24 + Fastify + Strict TypeScript
- **Database**: PostgreSQL 16+ with **PostGIS** spatial extension (`postgis/postgis:16-3.4`)
- **Spatial Engine**: Raw PostGIS queries using `ST_DWithin`, `ST_Distance`, and `GIST` indexes
- **Validation & Auth**: Zod schemas, JWT authentication, and phone OTP verification
- **Speech-to-Text**: Abstracted `SpeechToTextService` with OpenAI Whisper & dev mock fallback
- **File Storage**: Abstracted `StorageService` supporting local disk and S3/Cloudflare R2/Backblaze B2

---

## 4. Repository Structure

```text
SiraLink/
├── server/                    # Backend API Service
│   ├── src/
│   │   ├── app.ts             # Fastify instance builder
│   │   ├── server.ts          # Server entry point & graceful shutdown
│   │   ├── config/env.ts      # Validated environment variables (Zod)
│   │   ├── db/                # Connection pool, migrations, and seed
│   │   │   ├── index.ts       # Resilient PostgreSQL pool
│   │   │   ├── migrate.ts     # Migration runner
│   │   │   ├── seed.ts        # Addis Ababa workers seed script
│   │   │   └── migrations/    # 001_initial_schema.sql (PostGIS)
│   │   ├── services/          # Spatial, Voice, Storage, Auth, Notification
│   │   ├── controllers/       # Fastify route controllers
│   │   ├── routes/            # REST API endpoints
│   │   ├── middleware/        # JWT auth, role authorization, error handler
│   │   └── utils/             # Structured logger & standardized responses
│   └── tests/                 # Vitest automated test suite
├── mobile/                    # React Native Expo Mobile App
│   ├── app/                   # Expo Router file-based pages
│   │   ├── (tabs)/            # Client Home, Jobs, Messages, Profile
│   │   ├── job/               # Job creation & detail tracker
│   │   └── worker/            # Worker dashboard & request management
│   ├── components/            # VoiceRecorder, VoicePlayer, WorkerCard, MapView, etc.
│   ├── context/               # AuthContext & LocationContext
│   ├── locales/               # am.json, om.json, en.json
│   └── services/api.ts        # Typed HTTP client
├── docs/api.md                # Comprehensive API specification
├── docker-compose.yml         # Local PostgreSQL + PostGIS container
├── render.yaml                # Render.com Web Service blueprint
└── README.md
```

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js 20+ (Node.js 24 recommended)
- Docker Desktop (or local PostgreSQL with PostGIS installed)

### 1. Start Local Database
```bash
# Start PostgreSQL 16 with PostGIS
docker compose up -d
```

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations (enables PostGIS & creates schema)
npm run db:migrate

# Seed database with sample Ethiopian workers across Addis Ababa
npm run db:seed

# Run automated tests
npm test

# Start backend dev server (port 3000)
npm run dev
```

### 3. Mobile App Setup
```bash
cd ../mobile
npm install

# Start Expo development server
npx expo start
```

---

## 6. Environment Variables

### Backend (`server/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Server listening port | `3000` (Local) / `10000` (Render) |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://siralink:siralink_secret@localhost:5432/siralink_db` |
| `JWT_SECRET` | Secret key for signing tokens | (random string ≥ 16 chars) |
| `OPENAI_API_KEY` | OpenAI API key for Whisper | *(Optional in dev, mock provider active if blank)* |
| `UPLOAD_PROVIDER` | Storage provider (`local` or `s3`) | `local` (dev) / `s3` (production) |
| `UPLOAD_BUCKET` | S3 / R2 bucket name | `siralink-media` |
| `UPLOAD_ACCESS_KEY` | Object storage access key | *(S3 credentials)* |
| `UPLOAD_SECRET_KEY` | Object storage secret key | *(S3 credentials)* |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

---

## 7. Render.com Deployment (Production)

The backend is fully configured for zero-downtime deployment on Render.com using `render.yaml`.

1. Push this repository to GitHub.
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint** and select your repository.
4. Render automatically detects `render.yaml` and deploys:
   - **Service Name**: `siralink-api`
   - **Runtime**: Node.js
   - **Health Check Path**: `/health`
5. Connect your production **PostgreSQL + PostGIS** database by providing `DATABASE_URL` in the environment settings.
6. Run migrations once on your production database:
   ```bash
   npm run db:migrate
   ```

---

## 8. Automated Testing

Run the full Vitest suite in `server`:
```bash
cd server
npm test
```
Includes:
- **Multilingual classification**: Tests keyword category matching for Amharic, Afaan Oromoo, and English.
- **Phone number normalization**: Validates Ethiopian mobile formats (`09...`, `07...`, `+2519...`).
- **JWT authorization & validation**: Verifies token creation, signing, and tampering rejection.
- **Health & API injection tests**: Tests Fastify server startup and public endpoints.

---

## 9. Security & Production Principles

- **No Committed Secrets**: All credentials and API keys are loaded via environment variables.
- **Structured Redaction**: Logging masks JWTs, authorization headers, passwords, and OTPs.
- **Strict TypeScript**: `noImplicitAny` and strict null checks across the codebase.
- **Production Ephemeral Storage Safe**: Render ephemeral filesystems are not used for media storage; production uses S3/R2 storage abstraction.
- **Graceful Shutdown**: Fastify and PostgreSQL connection pool close cleanly on `SIGTERM` / `SIGINT`.
