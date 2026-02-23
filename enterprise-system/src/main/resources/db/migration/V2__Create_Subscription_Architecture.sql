-- 1. Create the Membership Plans Catalog
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(50) UNIQUE NOT NULL, -- Bronze, Silver, Gold, Platinum
    tier_level INT NOT NULL UNIQUE, -- 1, 2, 3, 4 (Used to calculate valid upgrades)
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2) NOT NULL,
    class_limit_per_month INT NOT NULL,
    pt_sessions_per_month INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert Default Plans for the Gym
INSERT INTO
    membership_plans (
        name,
        tier_level,
        monthly_price,
        yearly_price,
        class_limit_per_month,
        pt_sessions_per_month
    )
VALUES (
        'Bronze',
        1,
        29.99,
        299.99,
        10,
        0
    ),
    (
        'Silver',
        2,
        49.99,
        499.99,
        20,
        1
    ),
    (
        'Gold',
        3,
        79.99,
        799.99,
        999,
        4
    ), -- 999 represents unlimited
    (
        'Platinum',
        4,
        149.99,
        1499.99,
        999,
        8
    );

-- 2. Create the Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan_id UUID REFERENCES membership_plans (id),
    billing_cycle VARCHAR(20), -- 'MONTHLY' or 'YEARLY'
    status VARCHAR(20) NOT NULL DEFAULT 'NONE',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the Invoices Table
CREATE TABLE invoices_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id),
    plan_id UUID NOT NULL REFERENCES membership_plans (id),
    amount DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- ADD THIS LINE HERE
    payment_status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED'
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. The PostgreSQL Trigger for Instant Activation
-- 4. The PostgreSQL Trigger for Instant Activation
CREATE OR REPLACE FUNCTION trg_process_successful_payment()
RETURNS TRIGGER AS $$
DECLARE
    new_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the status is SUCCESS and (if it's an update) that it wasn't already SUCCESS
    IF NEW.payment_status = 'SUCCESS' AND (TG_OP = 'INSERT' OR OLD.payment_status <> 'SUCCESS') THEN
        
        -- Calculate new end date based on cycle
        IF NEW.billing_cycle = 'YEARLY' THEN
            new_end_date := CURRENT_TIMESTAMP + INTERVAL '1 year';
        ELSE
            new_end_date := CURRENT_TIMESTAMP + INTERVAL '1 month';
        END IF;

        -- Update the user's subscription record
        UPDATE subscriptions 
        SET plan_id = NEW.plan_id,
            billing_cycle = NEW.billing_cycle,
            status = 'ACTIVE', 
            start_date = CURRENT_TIMESTAMP,
            end_date = new_end_date,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CHANGED: Now listens for INSERT OR UPDATE
CREATE TRIGGER activate_subscription_after_payment
AFTER INSERT OR UPDATE ON invoices_payments
FOR EACH ROW
EXECUTE FUNCTION trg_process_successful_payment();