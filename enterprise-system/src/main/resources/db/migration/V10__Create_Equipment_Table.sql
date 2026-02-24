CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'Cardio', 'Weights'
    status VARCHAR(30) DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'NEEDS_MAINTENANCE', 'RETIRED'
    last_maintained_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some dummy inventory so your dashboard isn't empty
INSERT INTO
    equipment (name, category, status)
VALUES (
        'Treadmill Matrix T50',
        'Cardio',
        'AVAILABLE'
    ),
    (
        'Concept2 Rower',
        'Cardio',
        'NEEDS_MAINTENANCE'
    ),
    (
        'Squat Rack Alpha',
        'Strength',
        'AVAILABLE'
    ),
    (
        'Cable Crossover Pro',
        'Strength',
        'AVAILABLE'
    );