create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  student_id text,
  university text,
  major text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists boards (
  slug text primary key,
  name text not null,
  description text not null,
  icon text not null,
  accent text not null,
  sort_order integer not null default 0
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  board_slug text not null references boards(slug),
  author_id uuid references users(id) on delete set null,
  title text not null,
  content text not null,
  anonymous boolean not null default false,
  allow_comments boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  content text not null,
  anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists post_likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists market_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references users(id) on delete set null,
  title text not null,
  description text,
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  condition text not null,
  campus text not null,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists courses (
  code text primary key,
  title text not null,
  dept text not null,
  campus text not null,
  term text not null,
  delivery text not null,
  status text not null,
  description text not null
);

create table if not exists course_meetings (
  id uuid primary key default gen_random_uuid(),
  course_code text not null references courses(code) on delete cascade,
  day text not null,
  start_time time not null,
  end_time time not null,
  campus text not null,
  room text not null,
  instructor text not null
);

create table if not exists timetable_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_code text not null references courses(code) on delete cascade,
  meeting_id uuid references course_meetings(id) on delete set null,
  color text not null default '#235a4f',
  created_at timestamptz not null default now(),
  unique (user_id, course_code, meeting_id)
);

create index if not exists idx_posts_board_created on posts(board_slug, created_at desc);
create index if not exists idx_comments_post on comments(post_id, created_at);
create index if not exists idx_market_items_created on market_items(created_at desc);
create index if not exists idx_course_meetings_course on course_meetings(course_code);

insert into boards (slug, name, description, icon, accent, sort_order)
values
  ('free', 'Free Board', 'Daily questions, campus life, and quick updates.', 'MessageSquare', 'blue', 10),
  ('class', 'Class Info', 'Course notes, assignment reminders, and study threads.', 'BookOpen', 'green', 20),
  ('exam', 'Exam Info', 'Exam dates, review sessions, and prep resources.', 'CalendarCheck', 'rose', 30),
  ('job', 'Job Info', 'Internships, hiring posts, and career events.', 'BriefcaseBusiness', 'amber', 40),
  ('club-utksa', 'UTKSA', 'Korean student association events and announcements.', 'UsersRound', 'violet', 50),
  ('club-utkos', 'UTKOS', 'Coding, algorithms, and project meetups.', 'Code2', 'teal', 60)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  accent = excluded.accent,
  sort_order = excluded.sort_order;

insert into courses (code, title, dept, campus, term, delivery, status, description)
values
  ('CSC108H1', 'Introduction to Computer Programming', 'Computer Science', 'St. George', 'F', 'In-Person', 'Open', 'Python-based intro to programming.'),
  ('MAT135H1', 'Calculus I', 'Mathematics', 'St. George', 'F', 'In-Person', 'Waitlist', 'Limits, derivatives, applications.'),
  ('CSC148H1', 'Introduction to Computer Science', 'Computer Science', 'St. George', 'S', 'Online', 'Full', 'Abstract data types and algorithms in Python.'),
  ('STA130H1', 'An Introduction to Statistical Reasoning and Data Science', 'Statistics', 'St. George', 'F', 'Hybrid', 'Open', 'Data science and statistical reasoning.')
on conflict (code) do update
set
  title = excluded.title,
  dept = excluded.dept,
  campus = excluded.campus,
  term = excluded.term,
  delivery = excluded.delivery,
  status = excluded.status,
  description = excluded.description;

insert into course_meetings (course_code, day, start_time, end_time, campus, room, instructor)
select *
from (
  values
    ('CSC108H1', 'Mon', '10:00'::time, '11:00'::time, 'St. George', 'BA1130', 'Smith'),
    ('CSC108H1', 'Wed', '10:00'::time, '11:00'::time, 'St. George', 'BA1130', 'Smith'),
    ('MAT135H1', 'Tue', '12:00'::time, '13:00'::time, 'St. George', 'SS2108', 'Lee'),
    ('MAT135H1', 'Thu', '12:00'::time, '13:00'::time, 'St. George', 'SS2108', 'Lee'),
    ('CSC148H1', 'Mon', '14:00'::time, '15:00'::time, 'St. George', 'BA1210', 'Ng'),
    ('CSC148H1', 'Wed', '14:00'::time, '15:00'::time, 'St. George', 'BA1210', 'Ng'),
    ('STA130H1', 'Fri', '09:00'::time, '10:00'::time, 'St. George', 'MP102', 'Khan')
) as seed(course_code, day, start_time, end_time, campus, room, instructor)
where not exists (
  select 1
  from course_meetings cm
  where cm.course_code = seed.course_code
    and cm.day = seed.day
    and cm.start_time = seed.start_time
);
