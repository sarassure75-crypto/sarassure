-- 2026-02-16_recreate_handle_new_user.sql
-- Recreate `handle_new_user` trigger function and trigger on auth.users
-- Grants EXECUTE to `authenticated` so the trigger can run in RLS contexts

-- Drop existing function/trigger if present (safe idempotent)
DROP TRIGGER IF EXISTS on_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
    user_role text;
    user_first_name text;
    user_pseudo text;
    new_learner_code text;
    new_trainer_code text;
    user_email text;
BEGIN
    -- Safe read of raw_user_meta_data (Supabase stores custom data there)
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'apprenant');
    user_first_name := NEW.raw_user_meta_data->>'first_name';
    user_pseudo := NEW.raw_user_meta_data->>'pseudo';
    user_email := NEW.email;

    IF user_role = 'apprenant' THEN
        new_learner_code := public.generate_unique_learner_code();
        new_trainer_code := NULL;
    ELSIF user_role = 'formateur' THEN
        new_learner_code := NULL;
        new_trainer_code := public.generate_unique_trainer_code();
    ELSE
        new_learner_code := NULL;
        new_trainer_code := NULL;
    END IF;

    INSERT INTO public.profiles (id, first_name, email, role, pseudo, learner_code, trainer_code)
    VALUES (NEW.id, user_first_name, user_email, user_role, user_pseudo, new_learner_code, new_trainer_code);

    RETURN NEW;
END;
$function$;

-- Create trigger to call the function after a new auth user is inserted
CREATE TRIGGER on_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure authenticated role can execute the function (required when trigger runs under auth contexts)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Optional: grant execute on helper code-gen functions if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'generate_unique_learner_code' AND n.nspname = 'public') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.generate_unique_learner_code() TO authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.proname = 'generate_unique_trainer_code' AND n.nspname = 'public') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.generate_unique_trainer_code() TO authenticated';
  END IF;
END$$;

-- Comment for clarity
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger to create a profile row when an auth.users row is created (recreated 2026-02-16)';
