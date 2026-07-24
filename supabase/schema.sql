-- Attendance Management System — database schema
-- Run this in the Supabase SQL Editor.

-- Students table
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll_number text not null unique,
  department text not null,
  year text not null,
  created_at timestamptz not null default now()
);

-- Attendance table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null default current_date,
  status text not null check (status in ('Present', 'Absent')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create index if not exists attendance_date_idx on public.attendance(date);
create index if not exists attendance_student_idx on public.attendance(student_id);

-- Enable Row Level Security
alter table public.students enable row level security;
alter table public.attendance enable row level security;

-- Permissive policies (this demo app has no authentication)
drop policy if exists "public_all_students" on public.students;
create policy "public_all_students" on public.students
  for all using (true) with check (true);

drop policy if exists "public_all_attendance" on public.attendance;
create policy "public_all_attendance" on public.attendance
  for all using (true) with check (true);
