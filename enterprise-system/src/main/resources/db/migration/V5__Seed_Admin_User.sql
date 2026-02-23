-- Insert a default Admin user, explicitly generating the UUID
INSERT INTO
    users (
        id, -- ADDED THIS
        first_name,
        last_name,
        email,
        password_hash,
        role
    )
VALUES (
        gen_random_uuid (), -- ADDED THIS
        'System',
        'Admin',
        'admin@gym.com',
        '[BCRYPT_HASH_SIMULATION]_admin123',
        'ADMIN'
    )
ON CONFLICT (email) DO NOTHING;