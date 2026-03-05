-- ==========================================================
-- V3 Seed Dummy Data
-- Populates the application with sample configuration data.
-- Consolidates old scripts' data insertion logic.
-- ==========================================================

-- 1. Insert a default Admin user
INSERT INTO
    users (
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role
    )
VALUES (
        gen_random_uuid (),
        'System',
        'Admin',
        'admin@gym.com',
        '[BCRYPT_HASH_SIMULATION]_admin123', -- Simulates the backend hashing logic
        'ADMIN'
    )
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Dummy Trainers (From V16)
INSERT INTO
    users (
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role
    )
VALUES (
        gen_random_uuid (),
        'John',
        'Trainer',
        'john.trainer@gym.com',
        '[BCRYPT_HASH_SIMULATION]_trainer123',
        'TRAINER'
    ),
    (
        gen_random_uuid (),
        'Sarah',
        'Fitness',
        'sarah.trainer@gym.com',
        '[BCRYPT_HASH_SIMULATION]_trainer123',
        'TRAINER'
    )
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Default Rooms
INSERT INTO
    rooms (name, total_capacity)
VALUES (
        'Studio A (Main Group Fitness)',
        35
    ),
    (
        'Studio B (Yoga & Pilates)',
        20
    ),
    ('Spin Cycle Studio', 25),
    (
        'Functional Training Zone',
        15
    ),
    ('Private PT Room 1', 3);

-- 4. Insert Default Plans for the Gym
INSERT INTO
    membership_plans (
        name,
        monthly_price,
        discount_level,
        is_active,
        category
    )
VALUES (
        'Normal',
        29.99,
        10,
        TRUE,
        'BASE_MEMBERSHIP'
    ),
    (
        'Premium',
        49.99,
        15,
        TRUE,
        'BASE_MEMBERSHIP'
    );

-- 5. Insert a Dummy Membership Plan (Class Package type for scheduling from V16)
INSERT INTO
    membership_plans (
        id,
        name,
        monthly_price,
        is_active,
        category,
        description,
        discount_level,
        recurring_day_of_week,
        recurring_start_time,
        duration_minutes,
        allocated_room_id,
        allocated_seats
    )
SELECT
    gen_random_uuid (),
    'Morning Bootcamp',
    99.99,
    TRUE,
    'CLASS_PACKAGE',
    'High intensity morning bootcamp led by our expert trainers.',
    0,
    'MONDAY',
    '07:00',
    60,
    (
        SELECT id
        FROM rooms
        WHERE
            name = 'Functional Training Zone'
        LIMIT 1
    ),
    10
WHERE
    NOT EXISTS (
        SELECT 1
        FROM membership_plans
        WHERE
            name = 'Morning Bootcamp'
    );

-- 6. Link Trainers to the Plan
INSERT INTO
    membership_plan_trainers (plan_id, trainer_id)
SELECT p.id, u.id
FROM membership_plans p
    CROSS JOIN users u
WHERE
    p.name = 'Morning Bootcamp'
    AND u.email IN (
        'john.trainer@gym.com',
        'sarah.trainer@gym.com'
    )
ON CONFLICT (plan_id, trainer_id) DO NOTHING;

-- 7. Seed Dummy Equipment Inventory
INSERT INTO
    equipment (name, category, status)
VALUES (
        'Treadmill Matrix T50',
        'Cardio',
        'AVAILABLE'
    ),
    (
        'Concept2 Rower',
        'Cardio',
        'NEEDS_MAINTENANCE'
    ),
    (
        'Squat Rack Alpha',
        'Strength',
        'AVAILABLE'
    ),
    (
        'Cable Crossover Pro',
        'Strength',
        'AVAILABLE'
    );