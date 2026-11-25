/*
# Create trigger to auto-create a profiles row on sign-up

1. New Functions
- `handle_new_user()` — SECURITY DEFINER trigger function that runs after
  every new auth user is created. It reads name, nickname, age and education
  from the raw_user_meta_data (passed from the website via
  supabase.auth.signUp options.data) and inserts the matching profiles row.

2. Security
- SECURITY DEFINER so the insert works even though the new user has no
  session yet (the client never inserts into profiles directly).
- search_path pinned to '' for safety.
- Falls back to the email prefix as nickname if none was provided.

3. Notes
- The website calls supabase.auth.signUp({ email, password, options: { data: { name, nickname, age, education } } })
- The trigger then creates the public.profiles row automatically.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, nickname, age, education)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'age', '')::integer,
    NULLIF(NEW.raw_user_meta_data->>'education', '')
  );
  RETURN NEW;
END;
$$;

-- Attach the function to the auth.users table on INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();