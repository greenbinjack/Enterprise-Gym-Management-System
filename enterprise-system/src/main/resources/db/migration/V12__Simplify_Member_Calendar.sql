-- ==========================================================
-- V12 Simplify Member Calendar
-- 1. Disable the validate_trainer_shift trigger that blocks session inserts
-- 2. Replace get_member_available_classes to show sessions within
--    the member's active subscription date window (no booking needed)
-- ==========================================================

-- Disable the triggers that block session creation
ALTER TABLE class_sessions DISABLE TRIGGER validate_trainer_shift;
ALTER TABLE class_sessions DISABLE TRIGGER validate_trainer_shift_on_update;

-- Drop and recreate the member calendar function with simple subscription-date logic
CREATE OR REPLACE FUNCTION get_member_available_classes(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    name VARCHAR,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    max_capacity INT,
    room_id UUID,
    room_name VARCHAR,
    trainer_id UUID,
    trainer_first_name VARCHAR,
    trainer_last_name VARCHAR,
    remaining_capacity BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cs.id AS session_id,
        cs.name,
        cs.start_time,
        cs.end_time,
        cs.max_capacity,
        rm.id AS room_id,
        rm.name AS room_name,
        tr.id AS trainer_id,
        tr.first_name AS trainer_first_name,
        tr.last_name AS trainer_last_name,
        cs.max_capacity::BIGINT AS remaining_capacity
    FROM class_sessions cs
    JOIN rooms rm ON rm.id = cs.room_id
    JOIN users tr ON tr.id = cs.trainer_id
    WHERE cs.start_time > CURRENT_TIMESTAMP
      AND EXISTS (
          SELECT 1
          FROM subscriptions s
          WHERE s.user_id = p_user_id
            AND s.status = 'ACTIVE'
            AND (
                -- Session falls within the subscription period
                cs.start_time BETWEEN COALESCE(s.start_date, CURRENT_TIMESTAMP - INTERVAL '1 day')
                                  AND COALESCE(s.end_date, CURRENT_TIMESTAMP + INTERVAL '5 years')
            )
      )
    ORDER BY cs.start_time ASC;
END;
$$ LANGUAGE plpgsql STABLE;
