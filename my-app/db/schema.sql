-- Family Dental Clinic database schema
-- Safe to run multiple times: existing tables and rows are preserved.

create table if not exists doctors (
  id serial primary key,
  slug text not null unique,
  name text not null,
  role text not null default '',
  image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id serial primary key,
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id bigserial primary key,
  reference_code text not null unique,
  patient_name text not null,
  phone text not null,
  phone_digits text not null,
  email text,
  doctor_id integer not null references doctors(id),
  service_id integer not null references services(id),
  appointment_date date not null,
  appointment_time time not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'completed', 'cancelled')),
  receptionist_note text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A doctor can only have one active (pending or approved) booking per time slot.
create unique index if not exists appointments_active_slot_unique
  on appointments (doctor_id, appointment_date, appointment_time)
  where status in ('pending', 'approved');

create index if not exists appointments_status_date_idx
  on appointments (status, appointment_date, appointment_time);

create index if not exists appointments_phone_digits_idx
  on appointments (phone_digits);

create index if not exists appointments_created_at_idx
  on appointments (created_at desc);

create table if not exists reviews (
  id bigserial primary key,
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  review text not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_created_at_idx
  on reviews (created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
  before update on appointments
  for each row
  execute function set_updated_at();
