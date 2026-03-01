-- ==========================================================
-- V2 Database Functions and Triggers
-- Combines analytical functions and subscription activation triggers.
-- ==========================================================

-- 1. The PostgreSQL Trigger for Instant Activation
CREATE OR REPLACE FUNCTION trg_process_successful_payment()
RETURNS TRIGGER AS $$
DECLARE
    new_end_date TIMESTAMP WITH TIME ZONE;
    existing_sub_id UUID;
BEGIN
    IF NEW.payment_status = 'SUCCESS' AND (TG_OP = 'INSERT' OR OLD.payment_status <> 'SUCCESS') THEN
        IF NEW.billing_cycle = 'YEARLY' THEN
            new_end_date := CURRENT_TIMESTAMP + INTERVAL '1 year';
        ELSE
            new_end_date := CURRENT_TIMESTAMP + INTERVAL '1 month';
        END IF;

        SELECT id INTO existing_sub_id 
        FROM subscriptions 
        WHERE user_id = NEW.user_id AND plan_id = NEW.plan_id
        LIMIT 1;

        IF existing_sub_id IS NOT NULL THEN
            UPDATE subscriptions 
            SET billing_cycle = NEW.billing_cycle,
                status = 'ACTIVE', 
                start_date = CURRENT_TIMESTAMP,
                end_date = new_end_date,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = existing_sub_id;
        ELSE
            INSERT INTO subscriptions (user_id, plan_id, billing_cycle, status, start_date, end_date)
            VALUES (NEW.user_id, NEW.plan_id, NEW.billing_cycle, 'ACTIVE', CURRENT_TIMESTAMP, new_end_date);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activate_subscription_after_payment
AFTER INSERT OR UPDATE ON invoices_payments
FOR EACH ROW
EXECUTE FUNCTION trg_process_successful_payment();

-- 2. Function to strictly enforce class capacity and auto-assign Waitlist status
CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_enrolled INT;
    class_max INT;
BEGIN
    IF NEW.status = 'ENROLLED' THEN
        SELECT COUNT(*) INTO current_enrolled 
        FROM class_bookings 
        WHERE class_session_id = NEW.class_session_id AND status = 'ENROLLED';
        
        SELECT max_capacity INTO class_max 
        FROM class_sessions 
        WHERE id = NEW.class_session_id;

        IF current_enrolled >= class_max THEN
            NEW.status := 'WAITLISTED';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_class_capacity
BEFORE INSERT OR UPDATE ON class_bookings
FOR EACH ROW
EXECUTE FUNCTION check_class_capacity();

-- 3. THE MASTER PL/pgSQL FUNCTION for Analytics
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
    mrr_val NUMERIC; active_subs BIGINT; success_rate NUMERIC; churn_rate NUMERIC;
    top_trainers JSON; peak_hours JSON;
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

    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO top_trainers FROM (
        SELECT u.first_name, u.last_name, ROUND(AVG(r.rating), 1) as rating 
        FROM trainer_reviews r JOIN users u ON r.trainer_id = u.id 
        GROUP BY u.id ORDER BY rating DESC LIMIT 5
    ) t;

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