# Database Logic: Procedures, Functions, Triggers, and Queries

This document outlines the core server-side logic and database-level automation implemented in the **Vortex Gym Management System**, as well as a roadmap for future optimizations.

## 🏗️ Current Implementation

### 1. Stored Functions (PL/pgSQL)

| Function Name | Description | Location |
|--------------|-------------|----------|
| `trg_process_successful_payment()` | **Instant Activation Engine**: Calculates `end_date` (1 month or 1 year) and creates/updates a user's subscription automatically when an invoice status becomes 'SUCCESS'. | `V2__Triggers_And_Functions.sql` |
| `check_class_capacity()` | **Waitlist Logic**: Before a booking is saved, it counts current enrollments. If the room is full, it automatically changes the new booking status to `WAITLISTED`. | `V2__Triggers_And_Functions.sql` |
| `get_dashboard_metrics()` | **Analytics Engine**: A master function that aggregates MRR (Monthly Recurring Revenue), active member counts, payment success rates, churn rates, top-rated trainers, and peak check-in hours into a single JSON object. | `V2__Triggers_And_Functions.sql` |

### 2. Database Triggers

| Trigger Name | Event | Description |
|--------------|-------|-------------|
| `activate_subscription_after_payment` | `AFTER INSERT OR UPDATE` on `invoices_payments` | Bridges the payment gateway response with the subscription system. |
| `trg_enforce_class_capacity` | `BEFORE INSERT OR UPDATE` on `class_bookings` | Ensures no class can ever exceed its physical room capacity at the database level. |

### 3. High-Performance Queries (JPA & Native)

- **Capacity & Room Conflict Check:**
  - `getUsedCapacityForRoomAtTime`: Calculates the intersection of all classes in a specific room to prevent double-booking or over-booking of the floor space.
- **Trainer Overlap Prevention:**
  - `countOverlappingTrainerClasses`: A cross-reference query that ensures a trainer isn't scheduled for two different classes at the same time.
- **Member Availability Filtering:**
  - `getMemberAvailableClasses`: A dynamic query that filters the global schedule to only show classes that occur within the user's specific subscription window.

---

## 🚀 Future Roadmap (Potential Implementations)

### 1. Proposed Procedures & Functions

- **`expire_stale_subscriptions()`**: A scheduled procedure to set 'ACTIVE' subscriptions to 'EXPIRED' if the current date passes `end_date`, and generate a "Renewal Required" notification.
- **`calculate_member_engagement_score(user_id)`**: A function that returns a 1-100 score based on class attendance frequency and check-in consistency.
- **`batch_cancel_trainer_schedule(trainer_id)`**: A procedure for emergency leave; cancels all future classes for a trainer and moves enrolled members back to "Credit" or notifies them in one operation.

### 2. Proposed Triggers

- **`trg_audit_inventory_change`**: Automatically logs every change in `equipment_status` to an `inventory_logs` table for accounting and maintenance tracking.
- **`trg_promote_waitlist_on_cancellation`**: When a member cancels their `ENROLLED` spot, this trigger would automatically find the oldest `WAITLISTED` user for that session and promote them to `ENROLLED`.
- **`trg_new_member_welcome_notif`**: Triggers a system greeting notification the moment a user record is inserted with the 'MEMBER' role.

### 3. Proposed Advanced Queries

- **Churn Prediction Query**: Identifies members who haven't checked in for 14+ days despite having an active plan.
- **Room Utilization Report**: A complex aggregation query calculating the percentage of "Idle vs. Active" time for each gym room over a 30-day period.
- **Revenue Forecasting**: A query using `subscriptions` and `billing_cycle` to predict incoming revenue for the next 3 months.
