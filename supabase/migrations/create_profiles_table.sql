-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp default current_timestamp not null,
  updated_at timestamp default current_timestamp not null,
  username text unique,
  full_name text,
  avatar_url text
);

-- Create index for username lookup
create index if not exists profiles_username_idx on public.profiles(username);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow public read access to profiles
create policy if not exists "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

-- Allow users to insert their own profile
create policy if not exists "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

-- Allow users to update own profile
create policy if not exists "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Allow users to delete own profile
create policy if not exists "Users can delete own profile."
  on public.profiles for delete
  using (auth.uid() = id);
