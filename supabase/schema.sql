-- ==========================================
-- ACE INTERVIEW - COMPREHENSIVE DB SCHEMA
-- ==========================================

-- 1. Profiles Table (Users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  title text,
  company_focus text,
  avatar text,
  settings jsonb default '{}'::jsonb,
  updated_at timestamptz default timezone('utc', now()),
  created_at timestamptz default timezone('utc', now())
);

-- 2. Resumes Table (For Resume Analyzer)
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  file_name text,
  file_url text,
  parsed_content jsonb default '{}'::jsonb,
  ats_score integer,
  feedback text,
  created_at timestamptz default timezone('utc', now())
);

-- 3. Interviews Table (Comprehensive)
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  
  -- Basic Info
  role_applied text not null,          -- e.g., 'Software Engineer'
  company_name text,                   -- e.g., 'Google'
  interview_type text not null,        -- e.g., 'Technical', 'Behavioral'
  status text not null default 'completed',
  interview_date timestamptz default timezone('utc', now()),
  completed_at timestamptz,
  duration integer,                    -- Duration in seconds
  
  -- Overall Scores (0-100)
  overall_rating integer default 0,    
  communication_score integer default 0,
  technical_score integer default 0,
  behavioral_score integer default 0,
  confidence integer default 0,
  body_language_score integer default 0,
  eye_contact_score integer default 0,
  
  -- AI Analysis & Metrics
  filler_words integer default 0,
  speaking_pace text,                  -- e.g., 'Slow', 'Normal', 'Fast'
  posture text,                        -- e.g., 'Good', 'Slouching'
  facial_expressions text,             -- e.g., 'Neutral', 'Smiling'
  voice_tone text,                     -- e.g., 'Confident', 'Nervous'
  emotion_analysis text,               -- e.g., 'Calm, Engaged'
  keyword_matches text,                -- Comma-separated or JSON
  
  -- Transcripts & Feedback
  transcript text,                     -- Full interview transcript
  summary text default '',             -- Brief summary
  ai_feedback text,                    -- Detailed overall feedback
  strengths text[] default '{}',       -- Array of strengths
  weaknesses text[] default '{}',      -- Array of areas for improvement
  recommendations text,                -- Actionable advice
  
  created_at timestamptz default timezone('utc', now())
);

-- 4. Interview Questions Table (Questions asked during the session)
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  question_text text not null,
  category text,                       -- e.g., 'Behavioral', 'System Design'
  expected_answer text,                -- AI generated ideal answer reference
  order_index integer,                 -- Question sequence (1, 2, 3...)
  created_at timestamptz default timezone('utc', now())
);

-- 5. Interview Answers Table (User's responses to specific questions)
create table if not exists public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  question_id uuid not null references public.interview_questions (id) on delete cascade,
  user_response_text text,
  audio_url text,                      -- Storage URL for audio recording
  video_url text,                      -- Storage URL for video recording
  score integer,                       -- Score for this specific answer (0-100)
  ai_feedback text,                    -- Feedback specifically for this answer
  duration integer,                    -- Time taken to answer in seconds
  created_at timestamptz default timezone('utc', now())
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Resumes Policies
create policy "Users can view their own resumes" on public.resumes for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own resumes" on public.resumes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own resumes" on public.resumes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own resumes" on public.resumes for delete to authenticated using (auth.uid() = user_id);

-- Interviews Policies
create policy "Users can view their own interviews" on public.interviews for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own interviews" on public.interviews for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own interviews" on public.interviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own interviews" on public.interviews for delete to authenticated using (auth.uid() = user_id);

-- Interview Questions Policies (Users can only view/insert questions linked to their interviews)
create policy "Users can access questions for their interviews" on public.interview_questions for all to authenticated using (
  interview_id in (select id from public.interviews where user_id = auth.uid())
);

-- Interview Answers Policies (Users can only view/insert answers linked to their interviews)
create policy "Users can access answers for their interviews" on public.interview_answers for all to authenticated using (
  interview_id in (select id from public.interviews where user_id = auth.uid())
);
