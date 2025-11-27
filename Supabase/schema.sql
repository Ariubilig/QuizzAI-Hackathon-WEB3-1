-- Create rooms table
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  host_id uuid not null,
  status text check (status in ('waiting', 'playing', 'finished')) default 'waiting',
  questions jsonb,
  category text,
  difficulty text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create players table
create table public.players (
  id uuid default gen_random_uuid() primary key,
  room_code text references public.rooms(code) on delete cascade,
  name text not null,
  score int default 0,
  time_taken int default 0, -- in milliseconds
  status text check (status in ('joined', 'finished')) default 'joined',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.rooms enable row level security;
alter table public.players enable row level security;

-- RLS Policies for rooms table
create policy "Allow public to read rooms"
  on public.rooms for select
  using (true);

create policy "Allow public to insert rooms"
  on public.rooms for insert
  with check (true);

create policy "Allow public to update rooms"
  on public.rooms for update
  using (true);

-- RLS Policies for players table
create policy "Allow public to read players"
  on public.players for select
  using (true);

create policy "Allow public to insert players"
  on public.players for insert
  with check (true);

create policy "Allow public to update players"
  on public.players for update
  using (true);

-- Enable Realtime for these tables
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
