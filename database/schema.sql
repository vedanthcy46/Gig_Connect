-- GigConnect Database Schema
-- PostgreSQL with PostGIS extension for location-based queries

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (both clients and freelancers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'freelancer', 'both')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for lat/lng
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Freelancer profiles
CREATE TABLE freelancer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    availability VARCHAR(50) DEFAULT 'available',
    experience_years INTEGER DEFAULT 0,
    portfolio_url VARCHAR(500),
    resume_url VARCHAR(500),
    total_earnings DECIMAL(12,2) DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    response_time INTEGER DEFAULT 24, -- hours
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Freelancer skills junction table
CREATE TABLE freelancer_skills (
    freelancer_id INTEGER REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate',
    PRIMARY KEY (freelancer_id, skill_id)
);

-- Gigs/Jobs
CREATE TABLE gigs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    budget_type VARCHAR(20) DEFAULT 'fixed', -- fixed, hourly
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    urgency VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, completed, cancelled
    deadline DATE,
    required_skills TEXT[], -- Array of skill names
    attachments TEXT[], -- Array of file URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gig applications
CREATE TABLE gig_applications (
    id SERIAL PRIMARY KEY,
    gig_id INTEGER REFERENCES gigs(id) ON DELETE CASCADE,
    freelancer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    proposed_rate DECIMAL(10,2),
    estimated_duration VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, withdrawn
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gig_id, freelancer_id)
);

-- Contracts (accepted gigs)
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    gig_id INTEGER REFERENCES gigs(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agreed_rate DECIMAL(10,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled, disputed
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and ratings
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type VARCHAR(20) NOT NULL, -- client_to_freelancer, freelancer_to_client
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages for real-time chat
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    participant_1 INTEGER REFERENCES users(id) ON DELETE CASCADE,
    participant_2 INTEGER REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_1, participant_2)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    payer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    payee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    payment_gateway VARCHAR(50), -- razorpay, stripe
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    transaction_type VARCHAR(20) DEFAULT 'payment', -- payment, refund, withdrawal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- gig_application, message, payment, review
    reference_id INTEGER, -- ID of related entity
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_gigs_location ON gigs USING GIST (location);
CREATE INDEX idx_gigs_status ON gigs (status);
CREATE INDEX idx_gigs_category ON gigs (category);
CREATE INDEX idx_freelancer_skills_skill ON freelancer_skills (skill_id);
CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read);