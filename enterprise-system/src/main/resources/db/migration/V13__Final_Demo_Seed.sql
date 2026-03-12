-- ==========================================================
-- V13 Final Demo Seed
-- Populates the database with minimal, effective data for a robust demo.
-- ==========================================================

DO $$
DECLARE
    v_admin_id UUID := gen_random_uuid();
    v_trainer_id UUID := gen_random_uuid();
    v_staff_id UUID := gen_random_uuid();
    v_member_id UUID := gen_random_uuid();
    v_room_pulse_id UUID := gen_random_uuid();
    v_room_iron_id UUID := gen_random_uuid();
    v_plan_id UUID := gen_random_uuid();
    v_session_past_id UUID := gen_random_uuid();
    v_session_now_id UUID := gen_random_uuid();
    v_pass_hash TEXT := '[BCRYPT_HASH_SIMULATION]_password123';
BEGIN

    -- 1. USERS
    INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active, phone, address, profile_photo_path)
    VALUES 
        (v_admin_id, 'Chief', 'Admin', 'admin@vortex.gym', v_pass_hash, 'ADMIN', TRUE, '+880-1700-000001', 'Vortex HQ, Dhaka', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),
        (v_trainer_id, 'Alex', 'Trainer', 'trainer@vortex.gym', v_pass_hash, 'TRAINER', TRUE, '+880-1700-000002', 'Vortex Training Grounds', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),
        (v_staff_id, 'Sarah', 'Staff', 'staff@vortex.gym', v_pass_hash, 'STAFF', TRUE, '+880-1700-000003', 'Front Desk', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
        (v_member_id, 'Jordan', 'Member', 'member@vortex.gym', v_pass_hash, 'MEMBER', TRUE, '+880-1700-000004', 'Sector 10, Uttara', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan')
    ON CONFLICT (email) DO NOTHING;

    -- Re-fetch IDs in case they already existed
    SELECT id INTO v_admin_id FROM users WHERE email = 'admin@vortex.gym';
    SELECT id INTO v_trainer_id FROM users WHERE email = 'trainer@vortex.gym';
    SELECT id INTO v_staff_id FROM users WHERE email = 'staff@vortex.gym';
    SELECT id INTO v_member_id FROM users WHERE email = 'member@vortex.gym';

    -- 2. ROOMS
    INSERT INTO rooms (id, name, total_capacity)
    VALUES 
        (v_room_pulse_id, 'Vortex Pulse Studio', 25),
        (v_room_iron_id, 'Vortex Iron Basement', 15)
    ON CONFLICT (id) DO NOTHING;

    -- 3. MEMBERSHIP PLAN
    INSERT INTO membership_plans (id, name, monthly_price, discount_level, is_active, category, recurring_day_of_week, recurring_start_time, duration_minutes, allocated_room_id, allocated_seats)
    VALUES (v_plan_id, 'Vortex Legend', 99.99, 0, TRUE, 'HIIT', 'MON,WED,FRI', '10:00:00', 60, v_room_pulse_id, 20)
    ON CONFLICT (id) DO NOTHING;

    -- 4. LINK TRAINER TO PLAN
    INSERT INTO membership_plan_trainers (plan_id, trainer_id)
    VALUES (v_plan_id, v_trainer_id)
    ON CONFLICT (plan_id, trainer_id) DO NOTHING;

    -- 5. ACTIVE SUBSCRIPTION
    INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, billing_cycle)
    VALUES (v_member_id, v_plan_id, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '15 days', 'MONTHLY');

    -- 6. CLASS SESSIONS (One past, one current)
    INSERT INTO class_sessions (id, name, room_id, trainer_id, start_time, end_time, max_capacity)
    VALUES 
        (v_session_past_id, 'Morning Core Blast', v_room_pulse_id, v_trainer_id, CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '1 hour', 20),
        (v_session_now_id, 'Elite CrossFit', v_room_iron_id, v_trainer_id, CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP + INTERVAL '30 minutes', 10)
    ON CONFLICT (id) DO NOTHING;

    -- 7. CLASS BOOKINGS (For past and current sessions)
    INSERT INTO class_bookings (class_session_id, user_id, status)
    VALUES 
        (v_session_past_id, v_member_id, 'PRESENT'),
        (v_session_now_id, v_member_id, 'ENROLLED')
    ON CONFLICT (class_session_id, user_id) DO NOTHING;

    -- 8. INVOICES / PAYMENTS (For MRR and Debtors List)
    INSERT INTO invoices_payments (user_id, plan_id, amount, billing_cycle, payment_method, payment_status, transaction_date, transaction_id)
    VALUES 
        (v_member_id, v_plan_id, 99.99, 'MONTHLY', 'CREDIT_CARD', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '15 days', 'TXN_SUCCESS_123'),
        (v_member_id, v_plan_id, 99.99, 'MONTHLY', 'CREDIT_CARD', 'OVERDUE', CURRENT_TIMESTAMP - INTERVAL '1 day', 'TXN_OVERDUE_456')
    ON CONFLICT (transaction_id) DO NOTHING;

    -- 9. LIVE CHECK-IN (For Staff/Admin Live Roster)
    INSERT INTO check_ins (user_id, check_in_time, check_out_time)
    VALUES (v_member_id, CURRENT_TIMESTAMP - INTERVAL '45 minutes', NULL);

    -- 10. HISTORICAL CHECK-INS (For Peak Hour Chart)
    -- Creating a realistic daily peak distribution:
    -- Morning Peak (6-9 AM), Mid-day Low, Evening Peak (5-8 PM)
    
    -- Morning Peak (6, 7, 8 AM)
    INSERT INTO check_ins (user_id, check_in_time, check_out_time)
    SELECT v_member_id, CURRENT_DATE + (h || ' hours')::INTERVAL, CURRENT_DATE + ((h + 1) || ' hours')::INTERVAL
    FROM (SELECT generate_series(6, 8) as h) s, generate_series(1, 10);
    
    -- Mid-day (11 AM - 2 PM) - Lower traffic
    INSERT INTO check_ins (user_id, check_in_time, check_out_time)
    SELECT v_member_id, CURRENT_DATE + (h || ' hours')::INTERVAL, CURRENT_DATE + ((h + 1) || ' hours')::INTERVAL
    FROM (SELECT generate_series(11, 14) as h) s, generate_series(1, 3);
    
    -- Evening Peak (5, 6, 7 PM)
    INSERT INTO check_ins (user_id, check_in_time, check_out_time)
    SELECT v_member_id, CURRENT_DATE + (h || ' hours')::INTERVAL, CURRENT_DATE + ((h + 1) || ' hours')::INTERVAL
    FROM (SELECT generate_series(17, 19) as h) s, generate_series(1, 15);

    -- 11. EQUIPMENT ALERTS
    INSERT INTO equipment (name, category, status, last_maintained_date)
    VALUES 
        ('Technogym Skillrun T1', 'Cardio', 'NEEDS_MAINTENANCE', CURRENT_TIMESTAMP - INTERVAL '6 months'),
        ('Rogue Monster Rack', 'Strength', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '1 month')
    ON CONFLICT DO NOTHING;

    -- 12. TRAINER REVIEW (For Leaderboard)
    INSERT INTO trainer_reviews (trainer_id, rating, created_at)
    VALUES (v_trainer_id, 4.9, CURRENT_TIMESTAMP - INTERVAL '2 days');

END $$;
