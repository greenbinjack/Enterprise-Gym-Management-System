-- ==========================================================
-- V5 High Performance Query Pack
-- Adds optimized SQL functions and indexes for scheduling, analytics, and finance.
-- ==========================================================

-- 1) Targeted indexes for overlap checks and analytics scans
CREATE INDEX IF NOT EXISTS idx_class_sessions_room_time ON class_sessions (room_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_class_sessions_trainer_time ON class_sessions (
    trainer_id,
    start_time,
    end_time
);

CREATE INDEX IF NOT EXISTS idx_class_sessions_start_time ON class_sessions (start_time);

CREATE INDEX IF NOT EXISTS idx_class_bookings_session_status ON class_bookings (class_session_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_window ON subscriptions (
    user_id,
    status,
    start_date,
    end_date
);

CREATE INDEX IF NOT EXISTS idx_check_ins_user_time ON check_ins (
    user_id,
    check_in_time,
    check_out_time
);

CREATE INDEX IF NOT EXISTS idx_invoices_status_user_date ON invoices_payments (
    payment_status,
    user_id,
    transaction_date
);

-- 2) getUsedCapacityForRoomAtTime
CREATE OR REPLACE FUNCTION get_used_capacity_for_room_at_time(
    p_room_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
DECLARE
    v_used_capacity INTEGER;
BEGIN
    SELECT COALESCE(SUM(cs.max_capacity), 0)
    INTO v_used_capacity
    FROM class_sessions cs
    WHERE cs.room_id = p_room_id
      AND cs.start_time < p_end_time
      AND cs.end_time > p_start_time;

    RETURN v_used_capacity;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3) countOverlappingTrainerClasses
CREATE OR REPLACE FUNCTION count_overlapping_trainer_classes(
    p_trainer_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_session_id UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_overlap_count BIGINT;
BEGIN
    SELECT COUNT(*)
    INTO v_overlap_count
    FROM class_sessions cs
    WHERE cs.trainer_id = p_trainer_id
      AND cs.start_time < p_end_time
      AND cs.end_time > p_start_time
      AND (p_exclude_session_id IS NULL OR cs.id <> p_exclude_session_id);

    RETURN v_overlap_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4) getMemberAvailableClasses
-- Returns upcoming classes that fall inside at least one ACTIVE subscription window.
-- 5) peak_hours_analysis using GROUPING SETS
CREATE OR REPLACE FUNCTION peak_hours_analysis()
RETURNS TABLE (
    day_label TEXT,
    hour_label INTEGER,
    checkins_count BIGINT,
    grouping_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN GROUPING(day_name) = 1 THEN 'ALL_DAYS'
            ELSE day_name
        END AS day_label,
        CASE
            WHEN GROUPING(hour_val) = 1 THEN NULL
            ELSE hour_val
        END AS hour_label,
        COUNT(*)::BIGINT AS checkins_count,
        CASE
            WHEN GROUPING(day_name) = 0 AND GROUPING(hour_val) = 0 THEN 'DAY_HOUR'
            WHEN GROUPING(day_name) = 0 AND GROUPING(hour_val) = 1 THEN 'DAY_TOTAL'
            WHEN GROUPING(day_name) = 1 AND GROUPING(hour_val) = 0 THEN 'HOUR_TOTAL'
            ELSE 'GRAND_TOTAL'
        END AS grouping_level
    FROM (
        SELECT
            TO_CHAR(ci.check_in_time, 'Dy') AS day_name,
            EXTRACT(HOUR FROM ci.check_in_time)::INT AS hour_val
        FROM check_ins ci
    ) attendance
    GROUP BY GROUPING SETS (
        (day_name, hour_val),
        (day_name),
        (hour_val),
        ()
    )
    ORDER BY
        CASE
            WHEN GROUPING(day_name) = 1 THEN 1
            ELSE 0
        END,
        day_label,
        hour_label;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6) top_trainers_ranking using DENSE_RANK by student retention
CREATE OR REPLACE FUNCTION top_trainers_ranking()
RETURNS TABLE (
    trainer_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    attended_count BIGINT,
    attendance_events BIGINT,
    retention_rate NUMERIC,
    rank_position BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH trainer_attendance AS (
        SELECT
            cs.trainer_id,
            SUM(CASE WHEN cb.status = 'PRESENT' THEN 1 ELSE 0 END)::BIGINT AS attended_count,
            SUM(CASE WHEN cb.status IN ('PRESENT', 'ABSENT') THEN 1 ELSE 0 END)::BIGINT AS attendance_events
        FROM class_sessions cs
        LEFT JOIN class_bookings cb ON cb.class_session_id = cs.id
        GROUP BY cs.trainer_id
    ), trainer_scores AS (
        SELECT
            ta.trainer_id,
            ta.attended_count,
            ta.attendance_events,
            COALESCE(
                ROUND((ta.attended_count * 100.0) / NULLIF(ta.attendance_events, 0), 2),
                0
            ) AS retention_rate
        FROM trainer_attendance ta
    )
    SELECT
        u.id AS trainer_id,
        u.first_name,
        u.last_name,
        ts.attended_count,
        ts.attendance_events,
        ts.retention_rate,
        DENSE_RANK() OVER (ORDER BY ts.retention_rate DESC, ts.attendance_events DESC) AS rank_position
    FROM trainer_scores ts
    JOIN users u ON u.id = ts.trainer_id
    WHERE u.role = 'TRAINER'
    ORDER BY rank_position, u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7) debtor_list_active
-- Members currently checked in (open session) and with overdue invoices.
CREATE OR REPLACE FUNCTION debtor_list_active()
RETURNS TABLE (
    user_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    latest_check_in TIMESTAMP WITH TIME ZONE,
    overdue_invoices BIGINT,
    overdue_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH active_checkins AS (
        SELECT
            ci.user_id,
            MAX(ci.check_in_time) AS latest_check_in
        FROM check_ins ci
        WHERE ci.check_out_time IS NULL
        GROUP BY ci.user_id
    ), overdue AS (
        SELECT
            ip.user_id,
            COUNT(*)::BIGINT AS overdue_invoices,
            COALESCE(SUM(ip.amount), 0) AS overdue_amount
        FROM invoices_payments ip
        WHERE ip.payment_status = 'OVERDUE'
        GROUP BY ip.user_id
    )
    SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        ac.latest_check_in,
        od.overdue_invoices,
        od.overdue_amount
    FROM active_checkins ac
    JOIN overdue od ON od.user_id = ac.user_id
    JOIN users u ON u.id = ac.user_id
    ORDER BY ac.latest_check_in DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8) monthly_revenue_rollup using ROLLUP
CREATE OR REPLACE FUNCTION monthly_revenue_rollup()
RETURNS TABLE (
    revenue_month DATE,
    plan_type TEXT,
    total_income NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('month', ip.transaction_date)::DATE AS revenue_month,
        COALESCE(mp.category, 'ALL_PLAN_TYPES')::TEXT AS plan_type,
        COALESCE(SUM(ip.amount), 0) AS total_income
    FROM invoices_payments ip
    JOIN membership_plans mp ON mp.id = ip.plan_id
    WHERE ip.payment_status = 'SUCCESS'
    GROUP BY DATE_TRUNC('month', ip.transaction_date), ROLLUP(mp.category)
    ORDER BY revenue_month DESC, plan_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9) Refresh dashboard function to expose new high-performance analytics payloads
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
    mrr_val NUMERIC;
    active_subs BIGINT;
    success_rate NUMERIC;
    churn_rate NUMERIC;
    top_trainers JSON;
    peak_hours JSON;
    debtors JSON;
    revenue_rollup JSON;
BEGIN
    SELECT COALESCE(SUM(mp.monthly_price), 0), COUNT(s.id)
    INTO mrr_val, active_subs
    FROM subscriptions s
    JOIN membership_plans mp ON s.plan_id = mp.id
    WHERE s.status = 'ACTIVE';

    SELECT COALESCE((COUNT(CASE WHEN payment_status = 'SUCCESS' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 0)
    INTO success_rate
    FROM invoices_payments;

    SELECT COALESCE((COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 0)
    INTO churn_rate
    FROM subscriptions;

    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    INTO top_trainers
    FROM (
        SELECT
            trainer_id,
            first_name,
            last_name,
            attended_count,
            attendance_events,
            retention_rate,
            rank_position
        FROM top_trainers_ranking()
        ORDER BY rank_position, first_name, last_name
        LIMIT 10
    ) t;

    SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
    INTO peak_hours
    FROM (
        SELECT
            day_label,
            hour_label AS hour,
            checkins_count AS count,
            grouping_level
        FROM peak_hours_analysis()
        WHERE grouping_level = 'HOUR_TOTAL'
        ORDER BY hour
    ) p;

    SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
    INTO debtors
    FROM (
        SELECT * FROM debtor_list_active()
    ) d;

    SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
    INTO revenue_rollup
    FROM (
        SELECT * FROM monthly_revenue_rollup()
    ) r;

    RETURN json_build_object(
        'mrr', mrr_val,
        'activeMembers', active_subs,
        'successRate', ROUND(success_rate, 1),
        'churnRate', ROUND(churn_rate, 1),
        'topTrainers', top_trainers,
        'peakHours', peak_hours,
        'debtorListActive', debtors,
        'monthlyRevenueRollup', revenue_rollup
    );
END;
$$ LANGUAGE plpgsql;