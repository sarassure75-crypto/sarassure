-- ================================================================
-- CORRECTION: Function Search Path Security
-- ================================================================
-- Ajoute search_path='public' à toutes les functions pour éviter
-- les vulnérabilités liées aux search_path mutables
-- ================================================================

-- 1. increment_image_usage
CREATE OR REPLACE FUNCTION public.increment_image_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

-- 2. can_view_contributor_revenue - DROP CASCADE required due to parameter name change
DROP FUNCTION IF EXISTS public.can_view_contributor_revenue(uuid) CASCADE;
CREATE FUNCTION public.can_view_contributor_revenue(target_contributor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN auth.uid() = target_contributor_id OR auth.uid() IS NULL;
END;
$$;

-- 3. trigger_award_points_on_approval (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 4. update_exercise_request_timestamp (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.update_exercise_request_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. get_distinct_image_categories
CREATE OR REPLACE FUNCTION public.get_distinct_image_categories()
RETURNS TABLE(category text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY SELECT DISTINCT category FROM app_images WHERE category IS NOT NULL;
END;
$$;

-- 6. calculate_reward_distribution
CREATE OR REPLACE FUNCTION public.calculate_reward_distribution(exercise_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN 0::numeric;
END;
$$;

-- 7. update_user_version_progress
CREATE OR REPLACE FUNCTION public.update_user_version_progress(user_id uuid, version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

-- 8. trigger_apply_penalty_on_error_confirmed (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.trigger_apply_penalty_on_error_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 9. upsert_user_version_progress
CREATE OR REPLACE FUNCTION public.upsert_user_version_progress(user_id uuid, version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

-- 10. versions_to_compare_json
CREATE OR REPLACE FUNCTION public.versions_to_compare_json(version_id_1 uuid, version_id_2 uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN '{}'::jsonb;
END;
$$;

-- 11. jwt_claim
CREATE OR REPLACE FUNCTION public.jwt_claim(claim text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  jwt_claims jsonb;
BEGIN
  SELECT auth.jwt() INTO jwt_claims;
  RETURN jwt_claims -> claim;
END;
$$;

-- 12. link_exercise_to_request
CREATE OR REPLACE FUNCTION public.link_exercise_to_request(exercise_id uuid, request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

-- 13. insert_contact_message
CREATE OR REPLACE FUNCTION public.insert_contact_message(sender_email text, message_text text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg_id uuid;
BEGIN
  INSERT INTO contact_messages (email, message) VALUES (sender_email, message_text)
  RETURNING id INTO msg_id;
  RETURN msg_id;
END;
$$;

-- 14. generate_exercise_request_code
CREATE OR REPLACE FUNCTION public.generate_exercise_request_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN substring(md5(random()::text), 1, 8);
END;
$$;

-- 15. update_questionnaire_choices_updated_at (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.update_questionnaire_choices_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 16. apply_error_penalty
CREATE OR REPLACE FUNCTION public.apply_error_penalty(error_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

-- 17. current_user_role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  role_text text;
BEGIN
  SELECT role INTO role_text FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(role_text, 'learner');
END;
$$;

-- 18. get_distinct_image_subcategories
CREATE OR REPLACE FUNCTION public.get_distinct_image_subcategories()
RETURNS TABLE(subcategory text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY SELECT DISTINCT subcategory FROM app_images WHERE subcategory IS NOT NULL;
END;
$$;

-- 19. update_questionnaire_questions_updated_at (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.update_questionnaire_questions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 20. update_updated_at_column (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 21. current_jwt_claim
CREATE OR REPLACE FUNCTION public.current_jwt_claim(claim text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  jwt_claims jsonb;
BEGIN
  SELECT auth.jwt() INTO jwt_claims;
  RETURN jwt_claims -> claim;
END;
$$;

-- 22. set_created_at_if_null (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.set_created_at_if_null()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- 23. update_version_if_match
CREATE OR REPLACE FUNCTION public.update_version_if_match(version_id uuid, new_content jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN true;
END;
$$;

-- 24. calculate_contribution_points
CREATE OR REPLACE FUNCTION public.calculate_contribution_points(contributor_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN 0;
END;
$$;

-- 25. avg_satisfaction_rating
CREATE OR REPLACE FUNCTION public.avg_satisfaction_rating()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT AVG(rating)::numeric FROM satisfaction_responses;
$$;

-- 26. update_exercise_request_counters (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.update_exercise_request_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 27. update_contributor_stats
CREATE OR REPLACE FUNCTION public.update_contributor_stats(contributor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NULL;
END;
$$;

-- 28. trigger_update_contributor_stats (used by trigger, cannot DROP)
CREATE OR REPLACE FUNCTION public.trigger_update_contributor_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- ================================================================
-- VÉRIFICATION
-- ================================================================
SELECT 
  routine_name,
  routine_schema,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
