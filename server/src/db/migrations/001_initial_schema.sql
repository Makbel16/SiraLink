-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('WORKER', 'CLIENT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_category AS ENUM (
        'PLUMBING',
        'ELECTRICAL',
        'CARPENTRY',
        'PAINTING',
        'CLEANING',
        'MECHANIC',
        'CONSTRUCTION',
        'MOVING',
        'GARDENING',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'CLIENT',
    language_preference VARCHAR(10) NOT NULL DEFAULT 'am',
    profile_audio_url TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Worker Profiles Table
CREATE TABLE IF NOT EXISTS worker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    skill_category job_category NOT NULL,
    skill_description TEXT,
    experience_years INTEGER NOT NULL DEFAULT 1,
    hourly_rate_etb NUMERIC(10,2),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    current_location GEOGRAPHY(POINT, 4326),
    location_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_worker_location
ON worker_profiles
USING GIST(current_location);

CREATE INDEX IF NOT EXISTS idx_worker_available
ON worker_profiles(is_available);

CREATE INDEX IF NOT EXISTS idx_worker_category
ON worker_profiles(skill_category);

-- Job Requests Table
CREATE TABLE IF NOT EXISTS job_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    worker_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,
    category job_category NOT NULL DEFAULT 'OTHER',
    title VARCHAR(150),
    audio_description_url TEXT,
    text_description TEXT,
    status job_status NOT NULL DEFAULT 'OPEN',
    offered_price_etb NUMERIC(10,2),
    job_location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_location
ON job_requests
USING GIST(job_location);

CREATE INDEX IF NOT EXISTS idx_job_status
ON job_requests(status);

CREATE INDEX IF NOT EXISTS idx_job_client
ON job_requests(client_id);

CREATE INDEX IF NOT EXISTS idx_job_worker
ON job_requests(worker_id);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL
        REFERENCES job_requests(id)
        ON DELETE CASCADE,
    client_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    worker_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_worker
ON ratings(worker_id);

-- Device Tokens Table
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user
ON device_tokens(user_id);

-- OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone
ON otp_verifications(phone_number);
