# Vortex Gym Management System — Presentation Notes

---

## 1. Project Title

**Vortex Gym Management System**
*An Enterprise-Grade Full-Stack Web Application for Gym Operations*

---

## 2. Team Members

> ⚠️ Fill in your actual names and IDs before handing to teammate.

| Name | Student ID |
|------|-----------|
| [Member 1 Name] | [ID] |
| [Member 2 Name] | [ID] |
| [Member 3 Name] | [ID] |

---

## 3. Brief Overview

Vortex is a **full-stack gym management platform** built for enterprise use. It handles everything from member registration and class scheduling to payments, check-ins, and staff management — all within a single unified system. The platform supports four distinct user roles: **Admin, Staff, Trainer, and Member**, each with their own dashboard and permissions.

---

## 4. All Features

### 🔐 Authentication & Access Control
- JWT-based login / registration
- Role-based access: Admin, Staff, Trainer, Member
- Forgot password with email token reset
- Protected routes per role

### 👤 Member Portal
- Dashboard with subscription status, class bookings, attendance history
- Membership store: purchase base or class packages (monthly / yearly billing)
- Class calendar — browse and book upcoming sessions
- QR-code-ready check-in ID for facility entry
- Profile management with photo upload

### 🏋️ Admin Panel
- **Dashboard** — revenue stats, member count, active subscriptions
- **Master Schedule Builder** — create class-package membership plans with:
  - Multi-day recurring schedules (e.g. Mon, Wed, Fri)
  - Availability check for rooms and trainers before allocation
  - Automatic class session generation across selected weeks
- **User Directory** — view and manage all members
- **Staff Management** — invite, activate, deactivate staff accounts
- **Recruitment Board** — review and approve/reject trainer applications
- **Inventory** — add equipment, change status (Available / Needs Maintenance / Retired)
- **Access Control** — live check-in roster with QR scan input

### 👷 Staff Panel
- Live member roster (real-time check-in tracking)
- Equipment status management (flag / fix / retire equipment)
- Staff profile management

### 🏃 Trainer Panel
- Personal dashboard with assigned classes and session stats
- Schedule viewer — upcoming classes with room and time
- Attendance marking — mark member attendance per session
- Trainer profile and bio management

### 💳 Payments & Subscriptions
- SSLCommerz payment gateway integration
- Monthly and yearly billing cycles
- Grace period handling on subscription expiry
- Invoice and payment history per member

### 📋 Recruitment System
- Public careers page with job listings
- Trainer application form (name, specialties, CV URL)
- Admin review board with Approve / Reject actions
- Approved applicants auto-promoted to Trainer role

### 🔔 Notifications
- In-app notification system per user

### 🌐 Public Website
- Landing page (Home, About, Gallery)
- Plans / Pricing page (public-facing)
- Responsive mobile-first design with dark mode support

---

## 5. Tools & Technology

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Axios |
| Styling | Tailwind CSS |
| Backend | Spring Boot 3 (Java 21) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| DB Migrations | Flyway |
| Security | Spring Security, JWT |
| Payment | SSLCommerz |
| Email | Spring Mail (SMTP) |
| Build Tool | Maven |
| Dev Tools | Spring DevTools, Lombok, MapStruct |

---

## 6. Database Design

**14 Tables:**

| Table | Purpose |
|-------|---------|
| `users` | All users (members, admins, staff, trainers). Role stored as enum string. |
| `rooms` | Gym rooms with name and total capacity |
| `membership_plans` | Plan catalog — base memberships and class packages (recurring schedule, allocated room/seats, assigned trainers) |
| `membership_plan_trainers` | Join table — many trainers per plan |
| `subscriptions` | Member ↔ Plan subscription records with status (`ACTIVE`, `EXPIRED`, `GRACE_PERIOD`) and billing cycle |
| `invoices_payments` | Payment records per transaction with SSLCommerz transaction ID |
| `class_sessions` | Individual class instances — room, trainer, start/end time, capacity |
| `class_bookings` | Member bookings per class session with status (`ENROLLED`, `ATTENDED`, `CANCELLED`) |
| `check_ins` | Facility entry/exit log with timestamps |
| `equipment` | Gym equipment catalog with status (`AVAILABLE`, `NEEDS_MAINTENANCE`, `RETIRED`) |
| `trainer_applications` | Recruitment submissions with approval status |
| `trainer_reviews` | Trainer ratings |
| `notifications` | In-app notification records per user |
| `password_reset_tokens` | Time-limited tokens for password reset emails |

**Key Relationships:**
- A `membership_plan` can have many `trainers` (via join table) and references a `room`
- `subscriptions` link a `user` to a `membership_plan`
- `class_sessions` reference a `room` and a `trainer`; members book them via `class_bookings`
- All primary keys are `UUID`s

**Storage Strategy:**
- Recurring weekdays for a class plan are stored as a comma-separated string in `recurring_day_of_week` (e.g. `"MONDAY,WEDNESDAY"`) — avoids schema changes while supporting multi-day selection

---

## 7. Codebase Explanation & Progress Demonstration

### Backend (Spring Boot — `enterprise-system/`)
```
controller/     → 13 REST controllers (Auth, Member, Admin, Trainer, Staff, Scheduling, Payment…)
service/        → Business logic with interface + impl pattern
repository/     → Spring Data JPA repositories (13 tables)
entity/         → JPA entities matching DB schema
dto/            → Request/response data transfer objects
mapper/         → MapStruct mappers (entity ↔ DTO)
config/         → Security config, JWT filter, CORS
```

### Frontend (React — `frontend/src/`)
```
components/     → 37 page/feature components
  Member*       → MemberDashboard, MemberStore, MemberCalendar, MemberProfile
  Admin*        → AdminDashboard, AdminScheduleBuilder, AdminInventory, AdminCheckIn, AdminUsers…
  Trainer*      → TrainerDashboard, TrainerSchedule, TrainerProfile
  Staff*        → StaffDashboard, StaffProfile, EquipmentManagement
  Public        → Home, About, Plans, Careers, Login, Register
api/            → Axios instance with JWT interceptor
```

### Key Demonstrations
- Admin creates a recurring class plan → picks multiple days → system checks room/trainer availability across all selected days → generates session bundle
- Member browses plans → pays via SSLCommerz → subscription activated → can book classes
- Staff scans QR code → check-in logged → live roster updates
- Admin reviews trainer applications → approves → applicant promoted to TRAINER role

---

## 8. GitHub & Individual Contributions

**GitHub Repository:** `[Insert GitHub URL]`

| Member | Contributions |
|--------|--------------|
| [Member 1] | [e.g. Backend: Auth, Scheduling, Payments] |
| [Member 2] | [e.g. Frontend: Member portal, Admin panel UI] |
| [Member 3] | [e.g. Backend: Subscriptions, DB design, Flyway migrations] |

---

*Generated: March 2026*
