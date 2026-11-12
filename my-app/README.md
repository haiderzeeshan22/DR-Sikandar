# Family Dental Clinic

A responsive dental clinic website with online appointment requests, a PostgreSQL database, patient status tracking, and a receptionist approval dashboard.

## Features

- **Patients** can request an appointment by choosing a doctor, service, date, and available time.
- Each request gets a booking reference such as `FD-7K3M9Q`.
- **Patients** can check their status at `/appointment-status` using the reference and phone number.
- **Receptionists** sign in at `/reception/login` and can:
  - See pending requests and today's schedule stats.
  - Filter by status, date, or search by patient, phone, or reference.
  - Approve, decline, complete, or cancel appointments.
  - Add a note that the patient sees on the status page.
- Appointments are stored in **PostgreSQL** with a database-level guarantee against double-booking the same doctor and time slot.
- Every new screen is mobile-first and responsive.

## Tech stack

- Next.js 16 (App Router, Route Handlers)
- React 19
- Tailwind CSS 4
- PostgreSQL 17 with `pg`
- Zod validation
- HMAC-signed, HttpOnly receptionist session cookie

## Requirements

- Node.js 20.9 or newer
- PostgreSQL 13+ (developed with PostgreSQL 17)
- pgAdmin is optional, but useful for inspecting the database

## 1. Install dependencies

```bash
npm install
```

## 2. Create the database

Create a database and a dedicated application user. You can do this in pgAdmin or with `psql`:

```sql
CREATE ROLE clinic_app LOGIN PASSWORD 'choose-a-strong-password';
CREATE DATABASE family_dental_clinic OWNER clinic_app;
```

## 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
DATABASE_URL=postgresql://clinic_app:YOUR_PASSWORD@127.0.0.1:5432/family_dental_clinic
AUTH_SECRET=at-least-32-random-characters
RECEPTION_PASSCODE=choose-a-strong-passcode
```

Generate a strong `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## 4. Create tables and seed data

```bash
npm run db:setup
```

This applies `db/schema.sql` and `db/seed.sql`. It is safe to run again; it does not delete appointments.

## 5. Run the app

```bash
npm run dev
```

Open:

- Website: http://localhost:3000
- Track an appointment: http://localhost:3000/appointment-status
- Reception dashboard: http://localhost:3000/reception/login

The reception passcode is whatever you set in `RECEPTION_PASSCODE` in `.env.local`.

## How booking works

1. A patient submits the form on the home page.
2. The request is saved with the status `pending`.
3. The slot is reserved immediately, so two patients cannot book the same doctor and time while one is waiting for approval.
4. Reception approves or declines the request.
5. The patient can check the result with their reference and phone number.
6. After a visit, reception can mark an approved appointment as `completed`.

### Slot rules

- Clinic hours: **9:00 AM – 5:00 PM**, every day.
- Lunch break: **1:00 PM – 2:00 PM**.
- Slot length: **30 minutes**.
- Requests can be made up to **60 days** ahead.
- Today's slots require at least **1 hour** of lead time.
- Statuses: `pending`, `approved`, `declined`, `completed`, `cancelled`.
- Only `pending` requests can be approved or declined. Only `approved` appointments can be completed. Pending or approved appointments can be cancelled by the clinic.
- Declined or cancelled bookings free the slot again.

## Viewing data in pgAdmin

Connect with:

- Host: `127.0.0.1`
- Port: `5432`
- Database: `family_dental_clinic`
- User: `clinic_app`
- Password: the password in your `.env.local`

Main tables:

- `doctors`
- `services`
- `appointments`

The partial unique index `appointments_active_slot_unique` prevents double-booking. The `appointments` table also has indexes for status/date, phone lookup, and recent creations.

## API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/booking-options` | Active doctors and services for the booking form |
| `GET` | `/api/appointments/availability?doctorId=1&date=YYYY-MM-DD` | Slot availability for a doctor and date |
| `POST` | `/api/appointments` | Create an appointment request |
| `GET` | `/api/appointments/lookup?reference=FD-XXXXXX&phone=...` | Patient status lookup |
| `POST` | `/api/reception/login` | Sign in reception |
| `POST` | `/api/reception/logout` | Sign out reception |
| `GET` | `/api/reception/appointments?status=pending&date=&search=` | Protected appointment list and stats |
| `PATCH` | `/api/reception/appointments/:id` | Protected approve/decline/complete/cancel action |

Reception APIs require the signed session cookie and are rejected with `401` otherwise. Passcode attempts are rate-limited in memory.

## Security notes

- `.env.local` is ignored by git. Never commit real database credentials, the auth secret, or the reception passcode.
- Before deploying, replace the development passcode and `AUTH_SECRET`.
- The reception cookie is `HttpOnly`, `SameSite=Strict`, and marked `Secure` in production.
- Patient lookup requires both the booking reference and the phone number used to book.
- Reception notes are shown to patients on the status page; do not put private internal comments there.
- The login rate limiter is in-memory, so it resets when the server restarts. For a multi-instance production deployment, use a shared rate-limit store.

## Useful commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run db:setup  # Apply schema and seed data
```
