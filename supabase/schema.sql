-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- NextAuth Tables

-- User table
create table users (
  id uuid not null default uuid_generate_v4() primary key,
  name text,
  email text unique,
  email_verified timestamp with time zone,
  image text,
  strava_id integer unique,
  access_token text,
  refresh_token text,
  token_expires timestamp with time zone,
  stripe_customer_id text unique,
  payment_method_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Account table
create table accounts (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,

  unique(provider, provider_account_id)
);

-- Session table
create table sessions (
  id uuid not null default uuid_generate_v4() primary key,
  session_token text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  expires timestamp with time zone not null
);

-- VerificationToken table
create table verification_tokens (
  identifier text not null,
  token text not null unique,
  expires timestamp with time zone not null,

  unique(identifier, token)
);

-- Application Tables

-- Goal table
create table goals (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null references users(id),
  type text not null,
  target double precision not null,
  penalty double precision not null,
  frequency text not null default 'weekly',
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Activity table
create table activities (
  id uuid not null default uuid_generate_v4() primary key,
  strava_id bigint unique not null,
  user_id uuid references users(id),
  goal_id uuid references goals(id),
  type text not null,
  distance double precision not null,
  moving_time integer not null,
  total_elevation_gain double precision default 0 not null,
  average_speed double precision default 0 not null,
  max_speed double precision default 0 not null,
  average_heartrate double precision,
  max_heartrate double precision,
  calories double precision,
  start_date timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);