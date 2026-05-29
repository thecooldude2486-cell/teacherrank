-- ===== Roles =====
create type public.app_role as enum ('normal_user', 'admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'normal_user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins can view all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Profiles readable by authenticated" on public.profiles
  for select to authenticated using (true);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'normal_user')
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- ===== Schools =====
create type public.submission_status as enum ('pending', 'approved', 'rejected');

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  school_type text,
  year_levels text,
  description text,
  status submission_status not null default 'pending',
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_schools_updated before update on public.schools for each row execute function public.set_updated_at();

grant select on public.schools to anon;
grant select, insert on public.schools to authenticated;
grant all on public.schools to service_role;
alter table public.schools enable row level security;

create policy "Approved schools public" on public.schools for select to anon using (status = 'approved');
create policy "Authed see approved or own" on public.schools for select to authenticated using (status = 'approved' or submitted_by_user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Authed submit schools" on public.schools for insert to authenticated with check (submitted_by_user_id = auth.uid() and status = 'pending');
create policy "Admins manage schools" on public.schools for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete schools" on public.schools for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ===== Teachers =====
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_id uuid references public.schools(id) on delete set null,
  year_level text,
  class_type text,
  location text,
  status submission_status not null default 'pending',
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_teachers_updated before update on public.teachers for each row execute function public.set_updated_at();

grant select on public.teachers to anon;
grant select, insert on public.teachers to authenticated;
grant all on public.teachers to service_role;
alter table public.teachers enable row level security;

create policy "Approved teachers public" on public.teachers for select to anon using (status = 'approved');
create policy "Authed see approved or own teachers" on public.teachers for select to authenticated using (status = 'approved' or submitted_by_user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Authed submit teachers" on public.teachers for insert to authenticated with check (submitted_by_user_id = auth.uid() and status = 'pending');
create policy "Admins manage teachers" on public.teachers for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete teachers" on public.teachers for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ===== Teacher Reviews =====
create table public.teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_name text,
  school_name text,
  year_level text,
  communication_rating numeric(3,2),
  classroom_support_rating numeric(3,2),
  teaching_clarity_rating numeric(3,2),
  engagement_rating numeric(3,2),
  wellbeing_rating numeric(3,2),
  homework_rating numeric(3,2),
  overall_rating numeric(3,2),
  written_feedback text,
  status submission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_treviews_updated before update on public.teacher_reviews for each row execute function public.set_updated_at();

grant select on public.teacher_reviews to anon;
grant select, insert on public.teacher_reviews to authenticated;
grant all on public.teacher_reviews to service_role;
alter table public.teacher_reviews enable row level security;

create policy "Approved teacher reviews public" on public.teacher_reviews for select to anon using (status = 'approved');
create policy "Authed see approved or own treviews" on public.teacher_reviews for select to authenticated using (status = 'approved' or user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Authed insert treviews" on public.teacher_reviews for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "Admins manage treviews" on public.teacher_reviews for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete treviews" on public.teacher_reviews for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ===== School Reviews =====
create table public.school_reviews (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  school_name text,
  child_year_level text,
  teaching_quality_rating numeric(3,2),
  academic_support_rating numeric(3,2),
  homework_rating numeric(3,2),
  wellbeing_rating numeric(3,2),
  safety_rating numeric(3,2),
  cleanliness_rating numeric(3,2),
  school_space_rating numeric(3,2),
  playground_rating numeric(3,2),
  facilities_rating numeric(3,2),
  toilets_hygiene_rating numeric(3,2),
  canteen_rating numeric(3,2),
  sports_facilities_rating numeric(3,2),
  library_resources_rating numeric(3,2),
  location_convenience_rating numeric(3,2),
  parking_rating numeric(3,2),
  public_transport_rating numeric(3,2),
  dropoff_pickup_rating numeric(3,2),
  walking_biking_rating numeric(3,2),
  traffic_safety_rating numeric(3,2),
  nearby_facilities_rating numeric(3,2),
  communication_rating numeric(3,2),
  extracurricular_rating numeric(3,2),
  inclusiveness_rating numeric(3,2),
  parent_community_rating numeric(3,2),
  school_culture_rating numeric(3,2),
  overall_rating numeric(3,2),
  learning_score numeric(3,2),
  environment_score numeric(3,2),
  location_score numeric(3,2),
  community_score numeric(3,2),
  written_feedback text,
  status submission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_sreviews_updated before update on public.school_reviews for each row execute function public.set_updated_at();

grant select on public.school_reviews to anon;
grant select, insert on public.school_reviews to authenticated;
grant all on public.school_reviews to service_role;
alter table public.school_reviews enable row level security;

create policy "Approved school reviews public" on public.school_reviews for select to anon using (status = 'approved');
create policy "Authed see approved or own sreviews" on public.school_reviews for select to authenticated using (status = 'approved' or user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Authed insert sreviews" on public.school_reviews for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "Admins manage sreviews" on public.school_reviews for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete sreviews" on public.school_reviews for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ===== Reports =====
create type public.report_type as enum ('teacher_review', 'school_review');
create type public.report_status as enum ('pending', 'reviewed', 'dismissed');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  review_type report_type not null,
  review_id uuid not null,
  reported_by_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status report_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_reports_updated before update on public.reports for each row execute function public.set_updated_at();

grant select, insert on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;

create policy "Users see own reports" on public.reports for select to authenticated using (reported_by_user_id = auth.uid());
create policy "Admins see all reports" on public.reports for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Authed report" on public.reports for insert to authenticated with check (reported_by_user_id = auth.uid());
create policy "Admins manage reports" on public.reports for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon;