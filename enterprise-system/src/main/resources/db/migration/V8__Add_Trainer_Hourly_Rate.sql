-- Add hourly_rate column to users table for trainer pay calculation
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;
