ALTER TABLE membership_plans
ADD COLUMN category VARCHAR(50) DEFAULT 'BASE_MEMBERSHIP';

ALTER TABLE membership_plans ADD COLUMN recurring_group_id UUID;

-- Optional: If you want to insert a dummy Class Package to test the new tab
INSERT INTO
    membership_plans (
        name,
        tier_level,
        monthly_price,
        yearly_price,
        class_limit_per_month,
        pt_sessions_per_month,
        category
    )
VALUES (
        'Yoga Masters Bundle',
        5,
        50.00,
        500.00,
        12,
        0,
        'CLASS_PACKAGE'
    );