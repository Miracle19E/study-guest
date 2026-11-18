/*
# Create quiz_results table

1. New Tables
- `quiz_results`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `subject` (text, not null) — which subject the quiz was about
  - `score` (integer, not null) — number of correct answers
  - `total` (integer, not null) — total questions in the quiz
  - `xp_earned` (integer, not null, default 0) — XP earned from this quiz
  - `created_at` (timestamptz, default now) — when the quiz was taken

2. Modified Tables
- `profiles` — add UPDATE policy so XP can be incremented (already has update_own_profile,
  but we also need to make sure the anon role does NOT have insert/update since the
  previous migration accidentally granted all verbs to anon). We revoke excess grants
  from anon and keep only what authenticated needs.

3. Security
- Enable RLS on `quiz_results`.
- Grant SELECT, INSERT to `authenticated` only (sign-in app).
- Owner-scoped policies: user_id defaults to auth.uid(), and policies check auth.uid() = user_id.
- Clean up profiles grants: revoke all from anon, keep SELECT/INSERT/UPDATE for authenticated.
- Add a DELETE policy for quiz_results so users can remove their own results if needed.

4. Notes
- The frontend inserts a row with { subject, score, total, xp_earned } — user_id is
  filled automatically by the DEFAULT auth.uid().
- The frontend then separately increments profiles.xp via an UPDATE.
- An index on user_id + created_at DESC speeds up the "last 5 results" query.
*/

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON quiz_results TO authenticated;

-- Index for fetching a user's recent results ordered by date
CREATE INDEX IF NOT EXISTS quiz_results_user_created_idx
  ON quiz_results (user_id, created_at DESC);

-- Owner-scoped SELECT: users can only read their own results
DROP POLICY IF EXISTS "select_own_results" ON quiz_results;
CREATE POLICY "select_own_results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owner-scoped INSERT: user_id must match the authenticated user
DROP POLICY IF EXISTS "insert_own_results" ON quiz_results;
CREATE POLICY "insert_own_results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner-scoped DELETE: users can delete their own results
DROP POLICY IF EXISTS "delete_own_results" ON quiz_results;
CREATE POLICY "delete_own_results"
  ON quiz_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Clean up profiles: revoke excess anon grants from the previous migration
REVOKE SELECT, INSERT, UPDATE, DELETE ON profiles FROM anon;