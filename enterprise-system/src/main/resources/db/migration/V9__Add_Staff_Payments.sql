CREATE TABLE staff_payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    check_in_id UUID NOT NULL REFERENCES check_ins(id),
    hours_worked NUMERIC(10,2) NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
