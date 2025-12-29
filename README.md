# Material Request Tracker

**Live Demo:** https://mattrack.netlify.app/

A simple and modern material request tracker built for construction projects.  
The goal of this app is to manage material requests cleanly and use AI to give quick risk insights, without exposing raw data.

Built with React, Supabase, and Netlify Functions.

---
### Testing Credentials

**email**: mdtaqui.jhar@gmail.com

**password**: 123123123

---

## What this app does

This app helps teams:
- Track material requests
- See request status in real time
- Get AI-based risk insights from summary data
- Keep company data fully isolated and secure

---

## Key Features

- **Material Request Management**  
  Create, view, filter, and track material requests easily.

- **AI Risk Insights**  
  AI analyzes only summary stats like pending or urgent counts.  
  No raw rows are sent to AI.

- **Real-time Updates**  
  Status changes show instantly.

- **Multi-tenant Support**  
  Company-wise data isolation using Supabase RLS.

- **CSV Export**  
  Download material requests as CSV.

---

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui

### Backend
- Supabase (PostgreSQL, Auth, RLS)

### AI and Serverless
- Netlify Functions
- Groq SDK (Llama / Mixtral)

### State Management
- TanStack Query

---

## Setup Instructions

### 1. Requirements

- Node.js v18 or above
- Supabase account
- Netlify account (optional but recommended)
- Groq API key

---

### 2. Install the project

```bash
git clone <repository-url>
npm install

```

### 3. Environment Variables
Create a .env file in the root folder:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

# Used for auth redirects
VITE_APP_URL=http://localhost:8888


For AI to work locally:

Run the app using netlify dev

Set GROQ_API_KEY in your shell or Netlify environment

### 4. Database Setup

```sql
-- Profiles table
create table public.profiles (
id uuid
company_id uuid
created_at timestamp with time zone
);

-- Material requests table
create table public.material_requests (
  id uuid default gen_random_uuid() primary key,
  company_id text not null,
  project_id uuid null,
  material_name text not null,
  quantity numeric not null,
  unit text not null,
  status text check (status in ('pending', 'approved', 'fulfilled', 'rejected')) default 'pending',
  priority text check (priority in ('low', 'medium', 'urgent')) default 'medium',
  requested_by text not null,
  notes text,
  requested_at timestamp with time zone default timezone('utc', now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.material_requests enable row level security;

-- Policies

-- Users can view their own profile
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

-- Users can view material requests from their company
create policy "Users can view company requests"
on public.material_requests for select
using (
  company_id = (
    select company_id from public.profiles where id = auth.uid()
  )
);

-- Users can create requests for their company
create policy "Users can create requests"
on public.material_requests for insert
with check (
  company_id = (
    select company_id from public.profiles where id = auth.uid()
  )
);
```

-- Function
When new user Sign-up we will create user profile with id of auth.user.id and company_id as random uuid(), so do this with supabase funciton and make it trigger on on_auth_user_created,

**Handle_user_create() function** 
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (
    id,
    company_id
  )
  values (
    new.id,
    gen_random_uuid()
  );

  return new;
end;
$$;
```

**Add this extension for the UUID**
```sql
create extension if not exists "pgcrypto";
```
**Now set-up a trigger**
```sql
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
```


### 5. Run the App Locally

We use Netlify Dev to run both the frontend and serverless functions together.

```bash
npm install -g netlify-cli
netlify dev
```

App runs at:
http://localhost:8888

### 6. Architecture and Decisions
Client-side Supabase Access
Material requests are fetched directly from Supabase
Supabase RLS enforces company-level access
No custom backend permission logic needed

Serverless AI Logic

AI runs inside Netlify Functions
API keys remain secure and hidden from the client
Data Privacy by Design
Only summary stats are sent to AI

Example: total requests, urgent count, pending count
No raw database rows are shared
Stateless AI Function
AI function has no database access
Receives summary input and returns insights
Simple, secure, and easy to scale

-----

Submission to karriere@bauai.eu
