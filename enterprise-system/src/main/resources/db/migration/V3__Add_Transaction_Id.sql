ALTER TABLE invoices_payments
ADD COLUMN transaction_id VARCHAR(100) UNIQUE;

ALTER TABLE invoices_payments
ALTER COLUMN payment_status
SET DEFAULT 'PENDING';