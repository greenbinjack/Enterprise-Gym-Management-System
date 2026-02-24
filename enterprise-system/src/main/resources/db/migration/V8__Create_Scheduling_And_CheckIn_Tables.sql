-- 1. Rooms (Physical Spaces)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL -- The physical max of the room
);

-- 2. Class Sessions (The actual events)
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    room_id UUID NOT NULL REFERENCES rooms (id),
    trainer_id UUID NOT NULL REFERENCES users (id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_capacity INT NOT NULL, -- Admin sets this per class (can be lower than room capacity)
    recurring_group_id UUID -- If Admin selects "Weekly", all those classes share this ID
);

-- 3. The Bookings & Waitlist
CREATE TABLE class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    class_session_id UUID NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED', -- 'ENROLLED', 'WAITLISTED', 'CANCELLED', 'PRESENT', 'ABSENT'
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_session_id, user_id) -- A user cannot book the same class twice
);

-- 4. Check-Ins (The Digital Bouncer / Fraud Prevention)
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE
);

-- Function to strictly enforce class capacity and auto-assign Waitlist status
CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_enrolled INT;
    class_max INT;
BEGIN
    -- Only check capacity if they are trying to ENROLL
    IF NEW.status = 'ENROLLED' THEN
        -- Get current enrolled count
        SELECT COUNT(*) INTO current_enrolled 
        FROM class_bookings 
        WHERE class_session_id = NEW.class_session_id AND status = 'ENROLLED';
        
        -- Get the max capacity for this specific class
        SELECT max_capacity INTO class_max 
        FROM class_sessions 
        WHERE id = NEW.class_session_id;

        -- If full, automatically switch their status to WAITLISTED
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

INSERT INTO
    rooms (name, total_capacity)
VALUES (
        'Studio A (Main Group Fitness)',
        35
    ),
    (
        'Studio B (Yoga & Pilates)',
        20
    ),
    ('Spin Cycle Studio', 25),
    (
        'Functional Training Zone',
        15
    ),
    ('Private PT Room 1', 3);