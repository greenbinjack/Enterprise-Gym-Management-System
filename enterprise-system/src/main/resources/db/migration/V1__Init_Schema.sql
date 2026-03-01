-- ==========================================================
-- V1 Initial Complete Schema Setup
-- Combines original V1 through V15 Table Creations
-- ==========================================================

-- 1. Create Core Users Table (Includes Profile + Active Flags from V9, V12)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(20),
    address TEXT,
    profile_photo_path VARCHAR(500)
);

-- 2. Create Rooms (Spaces for classes)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL
);

-- 3. Create the Membership Plans Catalog (Includes Plan Category/Recurring attributes from V13, V15)
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(50) UNIQUE NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(50) DEFAULT 'BASE_MEMBERSHIP',
    description VARCHAR(1000),
    discount_level INT,
    recurring_group_id UUID,
    recurring_day_of_week VARCHAR(20),
    recurring_start_time VARCHAR(20),
    duration_minutes INT,
    allocated_room_id UUID,
    allocated_seats INT
);

-- 4. Create the Linking Table for Assigning Trainers to a Membership Plan (From V14)
CREATE TABLE membership_plan_trainers (
    plan_id UUID NOT NULL,
    trainer_id UUID NOT NULL,
    PRIMARY KEY (plan_id, trainer_id),
    CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (id) ON DELETE CASCADE,
    CONSTRAINT fk_trainer FOREIGN KEY (trainer_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. Create Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan_id UUID REFERENCES membership_plans (id),
    billing_cycle VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'NONE',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Invoices/Payments (Includes Transaction ID from V3)
CREATE TABLE invoices_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id),
    plan_id UUID NOT NULL REFERENCES membership_plans (id),
    amount DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_id VARCHAR(100) UNIQUE
);

-- 7. Create Trainer Applications (From V4)
CREATE TABLE trainer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialties VARCHAR(255) NOT NULL,
    cv_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Notifications (From V6)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Password Reset Tokens (From V7)
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Class Sessions (From V8)
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    room_id UUID NOT NULL REFERENCES rooms (id),
    trainer_id UUID NOT NULL REFERENCES users (id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_capacity INT NOT NULL,
    recurring_group_id UUID
);

-- 11. Class Bookings (From V8)
CREATE TABLE class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    class_session_id UUID NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_session_id, user_id)
);

-- 12. Check-Ins (From V8)
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE
);

-- 13. Equipment (From V10)
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    last_maintained_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Trainer Reviews (From V11)
CREATE TABLE IF NOT EXISTS trainer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    trainer_id UUID REFERENCES users (id),
    rating NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);