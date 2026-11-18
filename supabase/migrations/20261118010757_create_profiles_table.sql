/*
# Create profiles table

1. New Tables
- `profiles`
  - `id` (uuid, primary key) — matches the auth.users id of the student
  - `name` (text, not null) — student's full name
  - `nickname` (text, not null, unique) — leaderboard display name
  - `age` (integer) — student's age
  - `education` (text) — level of education (undergraduate, master, phd)
  - `school` (text) — chosen school, filled later on the school page
  - `xp` (integer, default 0) — experience points earned from quizzes
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `profiles`.
- Grant SELECT, INSERT, UPDATE to `authenticated` only (sign-in app).
- Owner-scoped policies: each student can read and update only their own profile row.
- INSERT policy checks that the new row's id equals the authenticated user's id.

3. Notes
- The frontend inserts a row with id = newUser.id right after signUp.
- nickname has a UNIQUE constraint so duplicate nicknames produce a clear error.
- school and xp are nullable/defaulted so the initial insert only sets name, nickname, age, education.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  nickname text NOT NULL,
  age integer,
  education text,
  school text,
  xp integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_nickname_key UNIQUE (nickname)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);