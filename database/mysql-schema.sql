-- GigConnect MySQL Database Schema
CREATE DATABASE IF NOT EXISTS gigconnect;
USE gigconnect;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'freelancer', 'both') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Freelancer profiles
CREATE TABLE freelancer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200),
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    availability ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    experience_years INT DEFAULT 0,
    portfolio_url VARCHAR(500),
    resume_url VARCHAR(500),
    total_earnings DECIMAL(12,2) DEFAULT 0,
    total_jobs INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    response_time INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Freelancer skills junction table
CREATE TABLE freelancer_skills (
    freelancer_id INT,
    skill_id INT,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    PRIMARY KEY (freelancer_id, skill_id),
    FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Gigs/Jobs
CREATE TABLE gigs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    budget_type ENUM('fixed', 'hourly') DEFAULT 'fixed',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    deadline DATE,
    required_skills JSON,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (latitude, longitude),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Gig applications
CREATE TABLE gig_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gig_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    cover_letter TEXT,
    proposed_rate DECIMAL(10,2),
    estimated_duration VARCHAR(100),
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (gig_id, freelancer_id)
);

-- Contracts
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gig_id INT NOT NULL,
    client_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    agreed_rate DECIMAL(10,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'completed', 'cancelled', 'disputed') DEFAULT 'active',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type ENUM('client_to_freelancer', 'freelancer_to_client') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_unread (receiver_id, is_read)
);

-- Sample skills data
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('React', 'Frontend'),
('Node.js', 'Backend'),
('MySQL', 'Database'),
('Graphic Design', 'Design'),
('Content Writing', 'Writing'),
('Digital Marketing', 'Marketing'),
('Photography', 'Creative'),
('Video Editing', 'Creative'),
('Data Entry', 'Administrative');