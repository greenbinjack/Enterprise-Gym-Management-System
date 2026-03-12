-- ==========================================================
-- V7 Bulk Dummy Data Seeder
-- Ensures at least 5 rows in each application table for testing.
-- Safe to run once via Flyway in normal migration order.
-- ==========================================================

-- 1) users
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM users;

    IF missing_count > 0 THEN
        INSERT INTO users (
            id,
            first_name,
            last_name,
            email,
            password_hash,
            role,
            is_active,
            phone,
            address
        )
        SELECT
            gen_random_uuid(),
            'Dummy',
            'User ' || gs,
            'dummy.user.' || gs || '@gym.test',
            '[BCRYPT_HASH_SIMULATION]_dummy123',
            CASE
                WHEN gs % 3 = 0 THEN 'TRAINER'
                WHEN gs % 11 = 0 THEN 'STAFF'
                ELSE 'MEMBER'
            END,
            TRUE,
            '+1-555-100-' || LPAD(gs::TEXT, 4, '0'),
            'Auto-generated address #' || gs
        FROM generate_series(1, missing_count) AS gs
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- 2) rooms
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM rooms;

    IF missing_count > 0 THEN
        INSERT INTO rooms (id, name, total_capacity)
        SELECT
            gen_random_uuid(),
            'Auto Room ' || gs,
            12 + (gs % 30)
        FROM generate_series(1, missing_count) AS gs;
    END IF;
END $$;

-- 7) trainer_applications
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM trainer_applications;

    IF missing_count > 0 THEN
        INSERT INTO trainer_applications (
            id,
            first_name,
            last_name,
            email,
            phone,
            specialties,
            cv_url,
            status,
            created_at
        )
        SELECT
            gen_random_uuid(),
            'Applicant',
            'No ' || gs,
            'trainer.applicant.' || gs || '@gym.test',
            '+1-555-200-' || LPAD(gs::TEXT, 4, '0'),
            (ARRAY['HIIT, Strength','Yoga, Mobility','Pilates, Rehab','CrossFit, Conditioning'])[(gs % 4) + 1],
            'https://example.test/cv/' || gs || '.pdf',
            (ARRAY['PENDING','APPROVED','REJECTED'])[(gs % 3) + 1],
            CURRENT_TIMESTAMP - ((gs % 60) || ' days')::INTERVAL
        FROM generate_series(1, missing_count) AS gs
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- 8) notifications
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM notifications;

    IF missing_count > 0 THEN
        INSERT INTO notifications (id, user_id, message, is_read, created_at)
        SELECT
            gen_random_uuid(),
            c.user_id,
            'Automated notification #' || c.rn,
            (c.rn % 3 = 0),
            CURRENT_TIMESTAMP - ((c.rn % 20) || ' days')::INTERVAL
        FROM (
            SELECT id AS user_id, ROW_NUMBER() OVER (ORDER BY email) AS rn
            FROM users
        ) c
        ORDER BY c.rn
        LIMIT missing_count;
    END IF;
END $$;

-- 10) equipment
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM equipment;

    IF missing_count > 0 THEN
        INSERT INTO equipment (id, name, category, status, last_maintained_date)
        SELECT
            gen_random_uuid(),
            'Auto Equipment ' || gs,
            (ARRAY['Cardio','Strength','Flexibility','Recovery'])[(gs % 4) + 1],
            (ARRAY['AVAILABLE','NEEDS_MAINTENANCE','RETIRED'])[(gs % 3) + 1],
            CURRENT_TIMESTAMP - ((gs % 180) || ' days')::INTERVAL
        FROM generate_series(1, missing_count) AS gs;
    END IF;
END $$;

-- 11) trainer_shifts (must come before class_sessions due trigger validation)
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM trainer_shifts;

    IF missing_count > 0 THEN
        INSERT INTO trainer_shifts (
            id,
            trainer_id,
            shift_name,
            day_of_week,
            start_time,
            end_time,
            created_at,
            updated_at
        )
        SELECT
            gen_random_uuid(),
            c.trainer_id,
            'Auto Shift ' || c.rn,
            c.day_of_week,
            c.start_time,
            c.end_time,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM (
            SELECT
                t.id AS trainer_id,
                d.day_of_week,
                (TIME '06:00' + ((ROW_NUMBER() OVER (ORDER BY t.email, d.day_of_week) % 3) * INTERVAL '1 hour'))::TIME AS start_time,
                (TIME '14:00' + ((ROW_NUMBER() OVER (ORDER BY t.email, d.day_of_week) % 3) * INTERVAL '1 hour'))::TIME AS end_time,
                ROW_NUMBER() OVER (ORDER BY t.email, d.day_of_week) AS rn
            FROM users t
            CROSS JOIN (
                VALUES
                    ('MONDAY'),
                    ('TUESDAY'),
                    ('WEDNESDAY'),
                    ('THURSDAY'),
                    ('FRIDAY'),
                    ('SATURDAY'),
                    ('SUNDAY')
            ) AS d(day_of_week)
            WHERE t.role = 'TRAINER' AND t.is_active = TRUE
        ) c
        ON CONFLICT (trainer_id, day_of_week, start_time) DO NOTHING;
    END IF;
END $$;

-- 14) check_ins
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM check_ins;

    IF missing_count > 0 THEN
        INSERT INTO check_ins (
            id,
            user_id,
            check_in_time,
            check_out_time
        )
        SELECT
            gen_random_uuid(),
            c.user_id,
            CURRENT_TIMESTAMP - ((c.rn % 15) || ' hours')::INTERVAL,
            CASE
                WHEN c.rn % 4 = 0 THEN NULL
                ELSE CURRENT_TIMESTAMP - (((c.rn % 15) - 2) || ' hours')::INTERVAL
            END
        FROM (
            SELECT id AS user_id, ROW_NUMBER() OVER (ORDER BY email) AS rn
            FROM users
            WHERE role = 'MEMBER'
        ) c
        ORDER BY c.rn
        LIMIT missing_count;
    END IF;
END $$;

-- 15) trainer_reviews
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM trainer_reviews;

    IF missing_count > 0 THEN
        INSERT INTO trainer_reviews (id, trainer_id, rating, created_at)
        SELECT
            gen_random_uuid(),
            c.trainer_id,
            (3 + (c.rn % 3) + ((c.rn % 10)::NUMERIC / 10))::NUMERIC,
            CURRENT_TIMESTAMP - ((c.rn % 90) || ' days')::INTERVAL
        FROM (
            SELECT id AS trainer_id, ROW_NUMBER() OVER (ORDER BY email) AS rn
            FROM users
            WHERE role = 'TRAINER'
        ) c
        ORDER BY c.rn
        LIMIT missing_count;
    END IF;
END $$;

-- 16) trainer_commissions
DO $$
DECLARE
    target_count INT := 5;
    missing_count INT;
BEGIN
    SELECT GREATEST(target_count - COUNT(*), 0) INTO missing_count FROM trainer_commissions;

    IF missing_count > 0 THEN
        INSERT INTO trainer_commissions (
            id,
            trainer_id,
            session_id,
            hours_worked,
            rate_per_hour,
            commission_amount,
            calculated_at
        )
        SELECT
            gen_random_uuid(),
            cs.trainer_id,
            cs.id,
            ROUND(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))::NUMERIC / 3600, 2),
            15.00,
            ROUND((EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))::NUMERIC / 3600) * 15.00, 2),
            CURRENT_TIMESTAMP
        FROM class_sessions cs
        LEFT JOIN trainer_commissions tc ON tc.session_id = cs.id
        WHERE tc.id IS NULL
        ORDER BY cs.start_time
        LIMIT missing_count;
    END IF;
END $$;