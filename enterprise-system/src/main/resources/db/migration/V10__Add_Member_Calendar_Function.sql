-- ==========================================================
-- V10 Add Member Calendar Function
-- ==========================================================

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
    WITH active_subs AS (
        SELECT mp.name AS plan_name
        FROM subscriptions s
        JOIN membership_plans mp ON mp.id = s.plan_id
        WHERE s.user_id = p_user_id
          AND s.status = 'ACTIVE'
    )
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
        (cs.max_capacity - COALESCE(
            (SELECT COUNT(*)
             FROM class_bookings cb
             WHERE cb.class_session_id = cs.id
               AND cb.status NOT IN ('CANCELLED'))
        , 0))::BIGINT AS remaining_capacity
    FROM class_sessions cs
    JOIN rooms rm ON rm.id = cs.room_id
    JOIN users tr ON tr.id = cs.trainer_id
    JOIN active_subs s ON cs.name = s.plan_name
    WHERE cs.start_time > CURRENT_TIMESTAMP
    ORDER BY cs.start_time ASC;
END;
$$ LANGUAGE plpgsql STABLE;
