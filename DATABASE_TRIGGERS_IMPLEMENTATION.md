# Database Triggers Implementation Guide

## Overview

This document describes all the database triggers implemented in the Enterprise Gym System. Triggers are automatic database operations that are executed in response to specific events on tables.

---

## ✅ Implemented Triggers

### 1. **activate_subscription_after_payment** (V2)

**Purpose:** Bridges the payment gateway response with the subscription system
**Table:** `invoices_payments`
**Timing:** AFTER INSERT OR UPDATE
**Function:** `trg_process_successful_payment()`

#### How It Works:

- Monitors when an invoice payment status changes to 'SUCCESS'
- Automatically creates or updates a subscription record
- Sets subscription status to 'ACTIVE'
- Calculates end_date based on billing_cycle (Monthly or Yearly)
- Stores the current timestamp as start_date

#### Example Scenario:

```
User pays $50 for a MONTHLY plan
↓
Invoice status → 'SUCCESS'
↓
Trigger fires
↓
Subscription automatically created/updated
Status: ACTIVE
Start Date: NOW
End Date: NOW + 1 month
```

#### Database Check:

```sql
-- Check if trigger is working
SELECT * FROM subscriptions WHERE user_id = '<user_id>' AND status = 'ACTIVE';
```

---

### 2. **trg_enforce_class_capacity** (V2)

**Purpose:** Ensures no class can exceed its physical room capacity
**Table:** `class_bookings`
**Timing:** BEFORE INSERT OR UPDATE
**Function:** `check_class_capacity()`

#### How It Works:

- Before a booking is inserted, counts existing ENROLLED bookings
- Compares against class_sessions.max_capacity
- Automatically changes status to 'WAITLISTED' if capacity is exceeded
- Prevents double-booking errors at the database level

#### Example Scenario:

```
Class has max_capacity = 20
20 members are already ENROLLED
↓
New member books the class
↓
Count = 20 (equals max_capacity)
↓
Booking status automatically set to WAITLISTED
```

---

### 3. **sync_member_status** (V6 - NEW)

**Purpose:** Syncs denormalized member status when subscription changes
**Table:** `subscriptions`
**Timing:** AFTER INSERT OR UPDATE
**Function:** `sync_member_status()`

#### How It Works:

- Monitors subscription table for changes
- Queries the latest subscription status for the user
- Updates the denormalized `users.current_status` column
- Provides fast access to member status without joins

#### Example Scenario:

```
User's subscription status changes to 'ACTIVE'
↓
Trigger fires
↓
Looks up latest subscription for user
↓
Updates users.current_status = 'ACTIVE'
```

#### Database Check:

```sql
-- Check member status synchronization
SELECT u.id, u.email, u.current_status, s.status
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.current_status != s.status;
```

#### Impact:

- **Frontend:** Member dashboard displays current_status in real-time
- **Queries:** Faster member status lookups without subscription joins
- **Analytics:** Accurate member status reporting

---

### 4. **validate_trainer_shift** (V6 - NEW)

**Purpose:** Ensures classes are not scheduled outside trainer's defined shift hours
**Table:** `class_sessions`
**Timing:** BEFORE INSERT
**Function:** `validate_trainer_shift()`

#### How It Works:

- Before a class session is inserted, validates trainer availability
- Extracts the day of week from the class start_time
- Checks if trainer has a shift covering the entire class duration
- Raises an exception if trainer isn't available
- Prevents database constraint violations at the source

#### Example Scenario:

```
Admin tries to create a class:
- Trainer: John (ID: xyz)
- Day: MONDAY
- Time: 18:00 - 20:00

Trigger validates:
- Does John have a MONDAY shift?
- Does the shift cover 18:00 - 20:00?

If YES → Class is created ✓
If NO → Exception raised: "Class scheduled outside trainer's shift hours" ✗
```

#### Database Check:

```sql
-- Check trainer shifts
SELECT * FROM trainer_shifts WHERE trainer_id = '<trainer_id>';

-- Verify shift coverage
SELECT * FROM trainer_shifts
WHERE trainer_id = '<trainer_id>'
AND day_of_week = 'MONDAY'
AND start_time <= '18:00'
AND end_time >= '20:00';
```

---

### 5. **validate_trainer_shift_on_update** (V6 - NEW)

**Purpose:** Ensures trainer shift validation on class updates
**Table:** `class_sessions`
**Timing:** BEFORE UPDATE
**Function:** `validate_trainer_shift_on_update()`

#### How It Works:

- Validates only if trainer_id or times have changed
- Same validation logic as insert trigger
- Prevents invalid trainer/time combinations when updating classes
- Discards validation if no relevant fields changed

---

### 6. **auto_activate_sub** (Integrated in V2)

**Purpose:** Activates subscription immediately when invoice is paid
**Part of:** `trg_process_successful_payment()` in V2
**Status:** ✓ Already Implemented

#### Implementation Details:

This functionality is handled by the activate_subscription_after_payment trigger:

```sql
IF NEW.payment_status = 'SUCCESS' THEN
    -- Sets subscription status to 'ACTIVE'
    -- Records start_date as CURRENT_TIMESTAMP
    -- Calculates end_date based on billing_cycle
END IF;
```

---

## 📊 Schema Changes

### New Column: `users.current_status`

```sql
ALTER TABLE users ADD COLUMN current_status VARCHAR(20) DEFAULT 'INACTIVE';
```

- **Purpose:** Denormalized subscription status for fast queries
- **Synchronized by:** sync_member_status trigger
- **Values:** ACTIVE, INACTIVE, SUSPENDED, CANCELLED

### New Table: `trainer_shifts`

```sql
CREATE TABLE trainer_shifts (
    id UUID PRIMARY KEY,
    trainer_id UUID NOT NULL REFERENCES users(id),
    shift_name VARCHAR(100),
    day_of_week VARCHAR(20),  -- MONDAY, TUESDAY, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(trainer_id, day_of_week, start_time)
);
```

---

## 🔧 Backend Integration

### Key Services Updated:

#### SchedulingServiceImpl

```java
// Now validates trainer shifts before creating classes
public void createAdminClass(...) {
    boolean trainerAvailable = trainerShiftService.isTrainerAvailable(
        trainerId, dayOfWeek, startTime, endTime
    );
    if (!trainerAvailable) {
        throw new IllegalArgumentException("Trainer is not available...");
    }
}
```

#### New: TrainerShiftService

- Manages trainer shift CRUD operations
- Validates trainer availability
- Used by SchedulingService and REST API

#### New: TrainerShiftRepository

- Custom queries for shift management
- Overlap detection for scheduling

---

## 🎨 Frontend Integration

### New Components:

#### TrainerShiftManager.jsx

- Admin interface for managing trainer shifts
- Select trainer → View shifts → Add/Delete shifts
- Accessible at `/admin/trainer-shifts`

#### MemberStatus.jsx

- Displays member subscription status
- Shows active subscription details
- Integrated into MemberDashboard
- Auto-refreshes every 30 seconds

### Updated Components:

#### MemberDashboard.jsx

- Integrated MemberStatus component
- Shows real-time membership status
- Synced with users.current_status column

---

## 🚀 API Endpoints

### Trainer Shift Management

```
POST   /api/trainer-shifts/{trainerId}              - Create shift
GET    /api/trainer-shifts/{trainerId}              - Get all shifts
GET    /api/trainer-shifts/{trainerId}/day/{day}    - Get shifts for specific day
GET    /api/trainer-shifts/{trainerId}/check-availability  - Check availability
PUT    /api/trainer-shifts/{shiftId}                - Update shift
DELETE /api/trainer-shifts/{shiftId}                - Delete shift
DELETE /api/trainer-shifts/{trainerId}/all          - Delete all trainer shifts
```

---

## ✅ Testing & Verification

### Test Case 1: Payment → Subscription Activation

```sql
-- Insert payment record
INSERT INTO invoices_payments (user_id, plan_id, amount, billing_cycle, payment_method, payment_status)
VALUES ('user123', 'plan456', 99.99, 'MONTHLY', 'CREDIT_CARD', 'SUCCESS');

-- Verify subscription was created
SELECT * FROM subscriptions WHERE user_id = 'user123' AND status = 'ACTIVE';
```

### Test Case 2: Class Capacity Enforcement

```sql
-- Class has max_capacity = 10
-- 10 members enrolled
-- Try to add 11th member
INSERT INTO class_bookings (class_session_id, user_id, status)
VALUES ('session123', 'user11', 'ENROLLED');

-- Check status (should be WAITLISTED)
SELECT status FROM class_bookings WHERE user_id = 'user11';
```

### Test Case 3: Trainer Shift Validation

```sql
-- Try to create class outside trainer shift
INSERT INTO class_sessions (trainer_id, room_id, name, start_time, end_time, max_capacity)
VALUES ('trainer123', 'room456', 'Invalid Class', '2026-03-12 22:00:00', '2026-03-12 23:00:00', 20);

-- Should raise error if trainer has no shift at that time
```

### Test Case 4: Member Status Sync

```sql
-- Update subscription status
UPDATE subscriptions SET status = 'CANCELLED' WHERE id = 'sub123';

-- Check if users.current_status was updated
SELECT u.current_status, s.status FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.id = 'user123';
```

---

## 🔍 Monitoring & Debugging

### Check Trigger Status

```sql
-- List all triggers in the database
SELECT trigger_schema, trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Check Function Execution

```sql
-- Monitor trigger execution (check database logs)
-- PostgreSQL logs trigger errors with full context
SHOW log_statement;  -- Should be 'all' or 'mod' in development
```

### Disable/Enable Triggers (if needed)

```sql
-- Disable trigger temporarily
ALTER TABLE class_bookings DISABLE TRIGGER validate_trainer_shift;

-- Re-enable trigger
ALTER TABLE class_bookings ENABLE TRIGGER validate_trainer_shift;
```

---

## ⚠️ Important Notes

1. **Database-Level Validation:** Triggers enforce business rules at the database level, preventing invalid data from being stored.

2. **Performance:** Indexes are created on frequently queried columns:
   - `trainer_shifts.trainer_id`
   - `trainer_shifts.day_of_week`

3. **Referential Integrity:** All foreign keys are cascading for proper data cleanup.

4. **Timezone:** Timestamps use `TIMESTAMP WITH TIME ZONE` for accurate scheduling across regions.

5. **Concurrency:** PostgreSQL's MVCC ensures triggers work correctly under concurrent access.

---

## 📝 Migration History

| Version | Component                           | Status                      |
| ------- | ----------------------------------- | --------------------------- |
| V2      | activate_subscription_after_payment | ✅ Implemented              |
| V2      | trg_enforce_class_capacity          | ✅ Implemented              |
| V2      | auto_activate_sub                   | ✅ Implemented (part of V2) |
| V6      | sync_member_status                  | ✅ Implemented              |
| V6      | validate_trainer_shift              | ✅ Implemented              |
| V6      | validate_trainer_shift_on_update    | ✅ Implemented              |

---

## 🎯 Key Takeaways

✅ **All 6 triggers are now fully implemented**
✅ **Backend services properly integrated**
✅ **Frontend components display real-time data**
✅ **Database schema enhanced with necessary columns/tables**
✅ **Error handling and validation in place**
✅ **REST APIs available for frontend communication**

The system now has complete trigger-based automation for:

- 💳 Subscription activation on payment
- 👥 Class capacity management
- 📊 Member status synchronization
- 🕐 Trainer shift validation
