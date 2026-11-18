/*
# Create add_xp function for incrementing user XP

1. New Functions
- `add_xp(xp_to_add integer)` — SECURITY DEFINER function that adds XP to the
  calling user's profile row. This avoids race conditions where two concurrent
  quiz finishes could overwrite each other's XP with a plain UPDATE SET.

2. Security
- SECURITY DEFINER so it can run with elevated privileges.
- REVOKE EXECUTE from PUBLIC and anon, GRANT to authenticated only.
- Uses auth.uid() to ensure the user can only update their own row.
- Uses a mutable search_path set to 'public' to prevent search_path injection.

3. Notes
- Called from the frontend as: supabase.rpc("add_xp", { xp_to_add: 30 })
- Returns the new total XP, or null if no profile row exists.
*/

CREATE OR REPLACE FUNCTION add_xp(xp_to_add integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_xp integer;
BEGIN
  -- Update the caller's XP and return the new total
  UPDATE profiles
    SET xp = xp + xp_to_add
    WHERE id = auth.uid()
    RETURNING xp INTO new_xp;

  RETURN new_xp;
END;
$$;

-- Only authenticated users can call this function
REVOKE EXECUTE ON FUNCTION add_xp(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION add_xp(integer) TO authenticated;