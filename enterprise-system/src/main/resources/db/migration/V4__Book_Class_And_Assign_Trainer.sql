-- ==========================================================
-- V4 Book Class Slot & Assign Trainer Functions
-- Adds atomic booking validation and trainer commission tracking.
-- ==========================================================

-- 1. Trainer Commissions Table
-- Stores one commission record per session (updated on trainer reassignment)
CREATE TABLE trainer_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    trainer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    hours_worked NUMERIC(5, 2) NOT NULL,
    rate_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    commission_amount NUMERIC(10, 2) NOT NULL,
    calculated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (session_id) -- one active commission record per session
);

-- 2. book_class_slot: Performs three checks then inserts the booking atomically.
--    Check 1: Duplicate booking guard
--    Check 2: Schedule conflict (user already enrolled in an overlapping class)
--    Check 3: Capacity — status resolves to ENROLLED or WAITLISTED
--    The existing check_class_capacity() BEFORE trigger fires on INSERT and
--    independently enforces the capacity rule; both agree on the final status.
CREATE OR REPLACE FUNCTION book_class_slot(p_user_id UUID, p_session_id UUID)
RETURNS JSON AS $$
DECLARE
    v_conflict_count  INT;
    v_current_enrolled INT;
    v_class_max       INT;
    v_booking_status  VARCHAR(20);
    v_new_booking_id  UUID;
    v_session_start   TIMESTAMP WITH TIME ZONE;
    v_session_end     TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 1. Duplicate booking guard
    IF EXISTS (
        SELECT 1 FROM class_bookings
        WHERE class_session_id = p_session_id AND user_id = p_user_id
    ) THEN
        RETURN json_build_object('success', false, 'error', 'You are already booked for this class.');
    END IF;

    -- 2. Load session time window
    SELECT start_time, end_time
    INTO   v_session_start, v_session_end
    FROM   class_sessions
    WHERE  id = p_session_id;

    IF v_session_start IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Class session not found.');
    END IF;

    -- 3. Schedule conflict check (any other enrolled/waitlisted class overlapping)
    SELECT COUNT(*) INTO v_conflict_count
    FROM   class_bookings cb
    JOIN   class_sessions  cs ON cb.class_session_id = cs.id
    WHERE  cb.user_id = p_user_id
      AND  cb.status IN ('ENROLLED', 'WAITLISTED')
      AND  cs.id    != p_session_id
      AND  cs.start_time < v_session_end
      AND  cs.end_time   > v_session_start;

    IF v_conflict_count > 0 THEN
        RETURN json_build_object('success', false, 'error',
            'This class overlaps with another class you are already enrolled in.');
    END IF;

    -- 4. Determine initial booking status
    SELECT COUNT(*) INTO v_current_enrolled
    FROM   class_bookings
    WHERE  class_session_id = p_session_id AND status = 'ENROLLED';

    SELECT max_capacity INTO v_class_max
    FROM   class_sessions WHERE id = p_session_id;

    v_booking_status := CASE
        WHEN v_current_enrolled >= v_class_max THEN 'WAITLISTED'
        ELSE 'ENROLLED'
    END;

    -- 5. Insert; RETURNING captures trigger-adjusted status from check_class_capacity()
    INSERT INTO class_bookings (class_session_id, user_id, status)
    VALUES (p_session_id, p_user_id, v_booking_status)
    RETURNING id, status INTO v_new_booking_id, v_booking_status;

    RETURN json_build_object(
        'success',   true,
        'bookingId', v_new_booking_id,
        'status',    v_booking_status
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 3. assign_trainer: Reassigns a trainer to an existing session and upserts
--    a commission record based on session duration × hourly rate.
CREATE OR REPLACE FUNCTION assign_trainer(
    p_session_id     UUID,
    p_trainer_id     UUID,
    p_rate_per_hour  NUMERIC DEFAULT 15.00
)
RETURNS JSON AS $$
DECLARE
    v_hours_worked      NUMERIC;
    v_commission_amount NUMERIC;
BEGIN
    -- 1. Validate trainer is active
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_trainer_id AND role = 'TRAINER' AND is_active = TRUE
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Trainer not found or is inactive.');
    END IF;

    -- 2. Compute session hours
    SELECT EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0
    INTO   v_hours_worked
    FROM   class_sessions
    WHERE  id = p_session_id;

    IF v_hours_worked IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Class session not found.');
    END IF;

    v_commission_amount := ROUND(v_hours_worked * p_rate_per_hour, 2);

    -- 3. Reassign trainer on the session
    UPDATE class_sessions
    SET    trainer_id = p_trainer_id
    WHERE  id = p_session_id;

    -- 4. Upsert commission (ON CONFLICT on session_id — one record per session)
    INSERT INTO trainer_commissions
        (trainer_id, session_id, hours_worked, rate_per_hour, commission_amount)
    VALUES
        (p_trainer_id, p_session_id, v_hours_worked, p_rate_per_hour, v_commission_amount)
    ON CONFLICT (session_id) DO UPDATE
        SET trainer_id        = EXCLUDED.trainer_id,
            hours_worked      = EXCLUDED.hours_worked,
            rate_per_hour     = EXCLUDED.rate_per_hour,
            commission_amount = EXCLUDED.commission_amount,
            calculated_at     = CURRENT_TIMESTAMP;

    RETURN json_build_object(
        'success',          true,
        'sessionId',        p_session_id,
        'newTrainerId',     p_trainer_id,
        'hoursWorked',      ROUND(v_hours_worked, 2),
        'commissionAmount', v_commission_amount
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;