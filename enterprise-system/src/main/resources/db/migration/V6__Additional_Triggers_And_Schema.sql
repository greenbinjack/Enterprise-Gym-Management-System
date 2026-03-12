-- ==========================================================
-- V6 Additional Triggers and Schema Enhancements
-- Implements sync_member_status and validate_trainer_shift triggers
-- Adds supporting schema for trainer shift management
-- ==========================================================

-- 1. Add denormalized current_status column to users table (for sync_member_status trigger)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_status VARCHAR(20) DEFAULT 'INACTIVE';

-- 2. Create Trainer Shifts table (for validate_trainer_shift trigger)
CREATE TABLE IF NOT EXISTS trainer_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    trainer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    shift_name VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (
        trainer_id,
        day_of_week,
        start_time
    )
);

-- Add index for faster lookups during class validation
CREATE INDEX IF NOT EXISTS idx_trainer_shifts_trainer_id ON trainer_shifts (trainer_id);

CREATE INDEX IF NOT EXISTS idx_trainer_shifts_day ON trainer_shifts (day_of_week);

-- 3. TRIGGER: sync_member_status
-- Syncs the denormalized current_status column in users table when subscription status changes
CREATE OR REPLACE FUNCTION sync_member_status()
RETURNS TRIGGER AS $$
DECLARE
    member_status VARCHAR(20);
BEGIN
    -- Get the latest/primary subscription status for this user
    SELECT status INTO member_status
    FROM subscriptions
    WHERE user_id = NEW.user_id
    ORDER BY updated_at DESC
    LIMIT 1;

    -- If no active subscription found, default to INACTIVE
    member_status := COALESCE(member_status, 'INACTIVE');

    -- Update the denormalized column in users table
    UPDATE users
    SET current_status = member_status
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_member_status
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_member_status();

-- 4. TRIGGER: validate_trainer_shift
-- Validates that a class is not scheduled outside the trainer's defined shift hours
-- BEFORE INSERT on class_sessions to prevent invalid bookings
CREATE OR REPLACE FUNCTION validate_trainer_shift()
RETURNS TRIGGER AS $$
DECLARE
    shift_exists BOOLEAN;
    day_name VARCHAR(20);
    class_start_time TIME;
    class_end_time TIME;
BEGIN
    -- Extract day of week from class start_time and convert to name
    day_name := CASE TO_CHAR(NEW.start_time, 'D')::INT
        WHEN 1 THEN 'SUNDAY'
        WHEN 2 THEN 'MONDAY'
        WHEN 3 THEN 'TUESDAY'
        WHEN 4 THEN 'WEDNESDAY'
        WHEN 5 THEN 'THURSDAY'
        WHEN 6 THEN 'FRIDAY'
        WHEN 7 THEN 'SATURDAY'
    END;

    -- Extract time portions for comparison
    class_start_time := NEW.start_time::TIME;
    class_end_time := NEW.end_time::TIME;

    -- Check if trainer has a shift for this day of week
    SELECT EXISTS(
        SELECT 1 FROM trainer_shifts
        WHERE trainer_id = NEW.trainer_id
        AND day_of_week = day_name
        AND start_time <= class_start_time
        AND end_time >= class_end_time
    ) INTO shift_exists;

    -- Raise exception if class is outside trainer's shift
    IF NOT shift_exists THEN
        RAISE EXCEPTION 'Class scheduled outside trainer''s defined shift hours. Trainer: %, Day: %, Class Time: % to %',
            NEW.trainer_id, day_name, class_start_time, class_end_time;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_trainer_shift
BEFORE INSERT ON class_sessions
FOR EACH ROW
EXECUTE FUNCTION validate_trainer_shift();

-- 5. TRIGGER: validate_trainer_shift_on_update
-- Also validates if class_sessions are updated
CREATE OR REPLACE FUNCTION validate_trainer_shift_on_update()
RETURNS TRIGGER AS $$
DECLARE
    shift_exists BOOLEAN;
    day_name VARCHAR(20);
    class_start_time TIME;
    class_end_time TIME;
BEGIN
    -- Only validate if trainer_id or times changed
    IF (NEW.trainer_id <> OLD.trainer_id OR NEW.start_time <> OLD.start_time OR NEW.end_time <> OLD.end_time) THEN
        day_name := CASE TO_CHAR(NEW.start_time, 'D')::INT
            WHEN 1 THEN 'SUNDAY'
            WHEN 2 THEN 'MONDAY'
            WHEN 3 THEN 'TUESDAY'
            WHEN 4 THEN 'WEDNESDAY'
            WHEN 5 THEN 'THURSDAY'
            WHEN 6 THEN 'FRIDAY'
            WHEN 7 THEN 'SATURDAY'
        END;

        class_start_time := NEW.start_time::TIME;
        class_end_time := NEW.end_time::TIME;

        SELECT EXISTS(
            SELECT 1 FROM trainer_shifts
            WHERE trainer_id = NEW.trainer_id
            AND day_of_week = day_name
            AND start_time <= class_start_time
            AND end_time >= class_end_time
        ) INTO shift_exists;

        IF NOT shift_exists THEN
            RAISE EXCEPTION 'Class scheduled outside trainer''s defined shift hours. Trainer: %, Day: %, Class Time: % to %',
                NEW.trainer_id, day_name, class_start_time, class_end_time;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_trainer_shift_on_update
BEFORE UPDATE ON class_sessions
FOR EACH ROW
EXECUTE FUNCTION validate_trainer_shift_on_update();

-- 6. Populate current_status for existing users based on their subscriptions
UPDATE users u
SET
    current_status = COALESCE(
        (
            SELECT status
            FROM subscriptions
            WHERE
                user_id = u.id
            ORDER BY updated_at DESC
            LIMIT 1
        ),
        'INACTIVE'
    )
WHERE
    current_status IS NULL
    OR current_status = 'INACTIVE';

-- 7. OPTIONAL: Sample trainer shifts for testing
-- Remove this section in production or adjust to match your actual trainers
INSERT INTO
    trainer_shifts (
        trainer_id,
        shift_name,
        day_of_week,
        start_time,
        end_time
    )
SELECT
    u.id,
    'Morning Shift' as shift_name,
    'MONDAY' as day_of_week,
    '06:00:00'::TIME as start_time,
    '12:00:00'::TIME as end_time
FROM users u
WHERE
    u.role = 'TRAINER'
    AND NOT EXISTS (
        SELECT 1
        FROM trainer_shifts
        WHERE
            trainer_id = u.id
    )
LIMIT 1;