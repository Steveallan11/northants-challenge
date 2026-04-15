create extension if not exists "pgcrypto";

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null unique,
  town text null,
  newsletter_opt_in boolean not null default false,
  consent_version text null,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text null,
  is_published boolean not null default false,
  is_active boolean not null default false,
  starts_at timestamptz null,
  ends_at timestamptz null,
  time_limit_seconds int not null default 15,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  sort_order int not null,
  type text not null,
  prompt text not null,
  extra_text text null,
  image_url text null,
  options jsonb not null,
  correct_index int not null check (correct_index between 0 and 3),
  explanation text null,
  category text null,
  difficulty text null,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  score int not null default 0,
  correct_count int not null default 0,
  average_response_ms int null,
  completed_at timestamptz null,
  is_scored boolean not null default true,
  share_code text unique null,
  referred_by_attempt_id uuid null references public.attempts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_index int null,
  is_correct boolean not null default false,
  response_ms int null,
  time_remaining_ms int null,
  points_awarded int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid null references public.attempts(id) on delete set null,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  player_id uuid null references public.players(id) on delete set null,
  share_code text null,
  share_channel text null,
  clicked_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  share_code text not null,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  referrer_attempt_id uuid null references public.attempts(id) on delete set null,
  visitor_session_id text null,
  converted_to_attempt boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid null references public.admins(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create unique index if not exists attempts_one_scored_attempt_per_quiz_player
  on public.attempts (quiz_id, player_id)
  where is_scored = true;

create index if not exists idx_questions_quiz_order on public.questions (quiz_id, sort_order);
create index if not exists idx_attempts_quiz_completed on public.attempts (quiz_id, completed_at desc);
create index if not exists idx_attempts_player on public.attempts (player_id);
create index if not exists idx_players_newsletter on public.players (newsletter_opt_in);
create index if not exists idx_share_events_quiz on public.share_events (quiz_id);
create index if not exists idx_referral_visits_share_code on public.referral_visits (share_code);

create or replace view public.public_leaderboard_entries as
select
  case
    when a.quiz_id = (select id from public.quizzes where is_active = true limit 1) then 'weekly'
    else 'all-time'
  end as scope,
  a.quiz_id,
  a.id as attempt_id,
  p.id as player_id,
  p.first_name,
  p.town,
  a.score,
  a.correct_count,
  a.average_response_ms,
  a.completed_at,
  a.share_code
from public.attempts a
join public.players p on p.id = a.player_id
where a.is_scored = true
  and a.completed_at is not null;

grant select on public.public_leaderboard_entries to anon, authenticated;
