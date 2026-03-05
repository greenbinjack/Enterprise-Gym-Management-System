# Vortex Gym — Entity Relationship Diagram

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR role
        TIMESTAMP created_at
        BOOLEAN is_active
        VARCHAR phone
        TEXT address
        VARCHAR profile_photo_path
    }

    rooms {
        UUID id PK
        VARCHAR name
        INT total_capacity
    }

    membership_plans {
        UUID id PK
        VARCHAR name UK
        DECIMAL monthly_price
        BOOLEAN is_active
        VARCHAR category
        VARCHAR description
        INT discount_level
        UUID recurring_group_id
        VARCHAR recurring_day_of_week
        VARCHAR recurring_start_time
        INT duration_minutes
        UUID allocated_room_id FK
        INT allocated_seats
    }

    membership_plan_trainers {
        UUID plan_id PK_FK
        UUID trainer_id PK_FK
    }

    subscriptions {
        UUID id PK
        UUID user_id FK
        UUID plan_id FK
        VARCHAR billing_cycle
        VARCHAR status
        TIMESTAMP start_date
        TIMESTAMP end_date
        TIMESTAMP updated_at
    }

    invoices_payments {
        UUID id PK
        UUID user_id FK
        UUID plan_id FK
        DECIMAL amount
        VARCHAR billing_cycle
        VARCHAR payment_method
        VARCHAR payment_status
        TIMESTAMP transaction_date
        VARCHAR transaction_id UK
    }

    class_sessions {
        UUID id PK
        VARCHAR name
        UUID room_id FK
        UUID trainer_id FK
        TIMESTAMP start_time
        TIMESTAMP end_time
        INT max_capacity
        UUID recurring_group_id
    }

    class_bookings {
        UUID id PK
        UUID class_session_id FK
        UUID user_id FK
        VARCHAR status
        TIMESTAMP booked_at
    }

    check_ins {
        UUID id PK
        UUID user_id FK
        TIMESTAMP check_in_time
        TIMESTAMP check_out_time
    }

    equipment {
        UUID id PK
        VARCHAR name
        VARCHAR category
        VARCHAR status
        TIMESTAMP last_maintained_date
    }

    trainer_applications {
        UUID id PK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email UK
        VARCHAR phone
        VARCHAR specialties
        VARCHAR cv_url
        VARCHAR status
        TIMESTAMP created_at
    }

    trainer_reviews {
        UUID id PK
        UUID trainer_id FK
        NUMERIC rating
        TIMESTAMP created_at
    }

    notifications {
        UUID id PK
        UUID user_id FK
        VARCHAR message
        BOOLEAN is_read
        TIMESTAMP created_at
    }

    password_reset_tokens {
        UUID id PK
        VARCHAR token UK
        UUID user_id FK
        TIMESTAMP expiry_date
        TIMESTAMP created_at
    }

    %% Relationships
    users ||--o{ subscriptions : "has"
    users ||--o{ invoices_payments : "pays"
    users ||--o{ class_bookings : "books"
    users ||--o{ check_ins : "logs"
    users ||--o{ notifications : "receives"
    users ||--o{ password_reset_tokens : "requests"
    users ||--o{ trainer_reviews : "is reviewed as"

    membership_plans ||--o{ subscriptions : "subscribed via"
    membership_plans ||--o{ invoices_payments : "billed for"
    membership_plans }o--|| rooms : "allocated to"
    membership_plans ||--o{ membership_plan_trainers : "has"
    users ||--o{ membership_plan_trainers : "assigned as trainer"

    rooms ||--o{ class_sessions : "hosts"
    users ||--o{ class_sessions : "leads as trainer"
    class_sessions ||--o{ class_bookings : "booked in"
```

---

## Standalone Tables (No Foreign Keys)

| Table | Reason |
|-------|--------|
| `equipment` | Global asset inventory — not tied to any user, room, or session. Managed by Admin/Staff via status updates only. |
| `trainer_applications` | Public submission form — no link to `users` by design. When an admin **approves** an application, a new `users` record is created in the application layer (not enforced as a DB constraint). |
