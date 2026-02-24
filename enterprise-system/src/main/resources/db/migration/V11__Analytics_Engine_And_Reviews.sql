-- 1. Create the missing Trainer Reviews table
CREATE TABLE IF NOT EXISTS trainer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    trainer_id UUID REFERENCES users (id),
    rating NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert dummy data to populate the Peak Hours Chart and Success Rates
-- (Assuming some check_ins and invoices already exist, but let's add a few guaranteed ones)
INSERT INTO
    check_ins (user_id, check_in_time)
VALUES (
        (
            SELECT id
            FROM users
            LIMIT 1
        ),
        CURRENT_DATE + interval '17 hours'
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
        ),
        CURRENT_DATE + interval '17 hours'
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
        ),
        CURRENT_DATE + interval '18 hours'
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
        ),
        CURRENT_DATE + interval '08 hours'
    );

-- 3. THE MASTER PL/pgSQL FUNCTION
-- Calculates everything directly at the database level for maximum performance.
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
    mrr_val NUMERIC; active_subs BIGINT; success_rate NUMERIC; churn_rate NUMERIC;
    top_trainers JSON; peak_hours JSON;
BEGIN
    -- MRR & Active Subs: Joins your subscriptions with membership_plans to get monthly_price
    SELECT COALESCE(SUM(mp.monthly_price), 0), COUNT(s.id) 
    INTO mrr_val, active_subs 
    FROM subscriptions s
    JOIN membership_plans mp ON s.plan_id = mp.id
    WHERE s.status = 'ACTIVE';
    
    -- Payment Success Rate: Uses your invoices_payments table and payment_status column
    SELECT COALESCE((COUNT(CASE WHEN payment_status = 'SUCCESS' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 0) 
    INTO success_rate 
    FROM invoices_payments;
    
    -- Churn Rate: Calculates based on your subscriptions table status
    SELECT COALESCE((COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 0) 
    INTO churn_rate 
    FROM subscriptions;

    -- Top 5 Trainers: Joins the new reviews table with your users table
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO top_trainers FROM (
        SELECT u.first_name, u.last_name, ROUND(AVG(r.rating), 1) as rating 
        FROM trainer_reviews r JOIN users u ON r.trainer_id = u.id 
        GROUP BY u.id ORDER BY rating DESC LIMIT 5
    ) t;

    -- Peak Hours: Groups your check_ins table by the hour
    SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) INTO peak_hours FROM (
        SELECT EXTRACT(hour FROM check_in_time) as hour, COUNT(*) as count 
        FROM check_ins GROUP BY hour ORDER BY hour
    ) p;

    RETURN json_build_object(
        'mrr', mrr_val, 'activeMembers', active_subs, 
        'successRate', ROUND(success_rate, 1), 'churnRate', ROUND(churn_rate, 1),
        'topTrainers', top_trainers, 'peakHours', peak_hours
    );
END;
$$ LANGUAGE plpgsql;