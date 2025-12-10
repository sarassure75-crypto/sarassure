-- ================================================================
-- CORRECTION COMPLÈTE SUPABASE - TOUTES LES FUNCTIONS + RLS
-- ================================================================
-- Date: 2025-12-10
-- Objectif: Corriger l'accès utilisateur cassé et sécuriser toutes les functions
-- ================================================================

-- ===== SECTION 1: ACTIVER RLS SUR LES 4 TABLES MANQUANTES =====
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE images_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_questions ENABLE ROW LEVEL SECURITY;

-- ===== SECTION 2: CORRIGER get_user_profile - FONCTION CRITIQUE =====
-- Cette fonction avec search_path = '' casse l'accès utilisateur
DROP FUNCTION IF EXISTS public.get_user_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile(bigint) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_profile(input_user_id uuid)
RETURNS TABLE(id uuid, first_name text, last_name text, pseudo text, role text, email text, trainer_code text, assigned_trainer_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    RETURN QUERY 
    SELECT 
        p.id, 
        p.first_name, 
        p.last_name,
        p.pseudo,
        p.role,
        p.email,
        p.trainer_code,
        p.assigned_trainer_id,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.id = input_user_id;
END;
$function$;

-- ===== SECTION 3: CORRIGER TOUTES LES FUNCTIONS TRIGGERS =====

-- 1. update_exercise_request_timestamp
DROP FUNCTION IF EXISTS public.update_exercise_request_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION public.update_exercise_request_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 2. trigger_award_points_on_approval
DROP FUNCTION IF EXISTS public.trigger_award_points_on_approval() CASCADE;
CREATE OR REPLACE FUNCTION public.trigger_award_points_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  v_points INTEGER;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    v_points := COALESCE(calculate_contribution_points(NEW.id), 0);
    
    INSERT INTO contribution_points (
      contribution_id,
      contributor_id,
      points_earned,
      points_type,
      reason
    ) VALUES (
      NEW.id,
      NEW.contributor_id,
      v_points,
      CASE 
        WHEN NEW.type = 'image' THEN 'screenshot_new'
        WHEN NEW.type = 'exercise' THEN 'exercise_base'
        ELSE 'other'
      END,
      'Points pour contribution approuvée'
    );
    
    PERFORM update_contributor_stats(NEW.contributor_id);
  END IF;
  
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    INSERT INTO contribution_points (
      contribution_id,
      contributor_id,
      points_earned,
      points_type,
      reason
    ) VALUES (
      NEW.id,
      NEW.contributor_id,
      -2,
      'penalty_rejection',
      'Pénalité pour contribution rejetée: ' || COALESCE(NEW.rejection_reason, 'Non conforme')
    );
    
    PERFORM update_contributor_stats(NEW.contributor_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. trigger_apply_penalty_on_error_confirmed
DROP FUNCTION IF EXISTS public.trigger_apply_penalty_on_error_confirmed() CASCADE;
CREATE OR REPLACE FUNCTION public.trigger_apply_penalty_on_error_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    PERFORM apply_error_penalty(
      NEW.user_id,
      NEW.contribution_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. trigger_update_contributor_stats
DROP FUNCTION IF EXISTS public.trigger_update_contributor_stats() CASCADE;
CREATE OR REPLACE FUNCTION public.trigger_update_contributor_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status != OLD.status) THEN
    PERFORM update_contributor_stats(NEW.contributor_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ===== SECTION 4: CORRIGER TOUTES LES FUNCTIONS UTILITAIRES =====

-- 1. increment_image_usage
DROP FUNCTION IF EXISTS public.increment_image_usage(uuid, uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_image_usage(p_image_id uuid, p_task_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  UPDATE images_metadata
  SET
    usage_count = usage_count + 1,
    used_in_tasks = array_append(used_in_tasks, p_task_id),
    updated_at = NOW()
  WHERE id = p_image_id;
  
  UPDATE contributor_stats
  SET 
    total_image_usage = total_image_usage + 1,
    updated_at = NOW()
  WHERE user_id = (SELECT uploaded_by FROM images_metadata WHERE id = p_image_id);
END;
$function$;

-- 2. can_view_contributor_revenue
DROP FUNCTION IF EXISTS public.can_view_contributor_revenue(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.can_view_contributor_revenue(target_contributor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'administrateur'
  ) THEN
    RETURN TRUE;
  END IF;
  
  IF auth.uid() = target_contributor_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- 3. calculate_contribution_points
DROP FUNCTION IF EXISTS public.calculate_contribution_points(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_contribution_points(p_contribution_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  v_contribution RECORD;
  v_points INTEGER := 0;
  v_task_count INTEGER;
  v_version_count INTEGER;
BEGIN
  SELECT * INTO v_contribution FROM public.contributions WHERE id = p_contribution_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  IF v_contribution.type = 'image' THEN
    IF v_contribution.content->>'is_reused' = 'true' THEN
      v_points := 0;
    ELSE
      v_points := 1;
      
      IF v_contribution.content->>'high_quality' = 'true' THEN
        v_points := v_points + 1;
      END IF;
    END IF;
    
  ELSIF v_contribution.type = 'exercise' THEN
    v_points := 5;
    
    v_task_count := COALESCE(jsonb_array_length(v_contribution.content->'tasks'), 0);
    IF v_task_count > 5 THEN
      v_points := v_points + 2;
    END IF;
    
    v_version_count := COALESCE(jsonb_array_length(v_contribution.content->'versions'), 1);
    IF v_version_count >= 2 THEN
      v_points := v_points + ((v_version_count - 1) * 3);
    END IF;
  END IF;
  
  RETURN v_points;
END;
$function$;

-- 4. apply_error_penalty
DROP FUNCTION IF EXISTS public.apply_error_penalty(uuid, uuid, uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.apply_error_penalty(p_contributor_id uuid, p_contribution_id uuid, p_error_report_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  v_total_approved INTEGER;
  v_total_errors INTEGER;
  v_error_rate DECIMAL(5,2);
  v_penalty_points INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_total_approved
  FROM public.contributions
  WHERE contributor_id = p_contributor_id AND status = 'approved';
  
  SELECT COUNT(*) INTO v_total_errors
  FROM public.error_reports
  WHERE user_id = p_contributor_id AND status = 'confirmed';
  
  IF v_total_approved > 0 THEN
    v_error_rate := (v_total_errors::DECIMAL / v_total_approved) * 100;
  ELSE
    v_error_rate := 0;
  END IF;
  
  IF v_total_errors <= 1 THEN
    v_penalty_points := 0;
  ELSIF v_total_errors = 2 THEN
    v_penalty_points := -3;
  ELSE
    v_penalty_points := -3;
    
    IF v_error_rate > 10 AND v_total_approved >= 20 THEN
      v_penalty_points := v_penalty_points + (-1 * v_total_approved);
    END IF;
    
    IF v_error_rate > 20 AND v_total_approved >= 20 THEN
      v_penalty_points := v_penalty_points + (-1 * v_total_approved);
    END IF;
  END IF;
  
  IF v_penalty_points < 0 THEN
    INSERT INTO public.contribution_points (
      contribution_id,
      contributor_id,
      points_earned,
      points_type,
      reason
    ) VALUES (
      p_contribution_id,
      p_contributor_id,
      v_penalty_points,
      'penalty_error',
      'Pénalité pour erreur signalée (erreur #' || v_total_errors || ', taux: ' || v_error_rate || '%)'
    );
    
    UPDATE public.error_reports
    SET 
      penalty_applied = true,
      penalty_points = v_penalty_points
    WHERE id = p_error_report_id;
  END IF;
  
  PERFORM update_contributor_stats(p_contributor_id);
  
  RETURN v_penalty_points;
END;
$function$;

-- 5. update_contributor_stats
DROP FUNCTION IF EXISTS public.update_contributor_stats(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.update_contributor_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.contributor_stats (user_id) 
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  UPDATE public.contributor_stats
  SET
    total_contributions = (
      SELECT COUNT(*) FROM public.contributions WHERE contributor_id = p_user_id
    ),
    approved_contributions = (
      SELECT COUNT(*) FROM public.contributions 
      WHERE contributor_id = p_user_id AND status = 'approved'
    ),
    rejected_contributions = (
      SELECT COUNT(*) FROM public.contributions 
      WHERE contributor_id = p_user_id AND status = 'rejected'
    ),
    pending_contributions = (
      SELECT COUNT(*) FROM public.contributions 
      WHERE contributor_id = p_user_id AND status = 'pending'
    ),
    draft_contributions = (
      SELECT COUNT(*) FROM public.contributions 
      WHERE contributor_id = p_user_id AND status = 'draft'
    ),
    images_uploaded = (
      SELECT COUNT(*) FROM public.images_metadata WHERE uploaded_by = p_user_id
    ),
    images_approved = (
      SELECT COUNT(*) FROM public.images_metadata 
      WHERE uploaded_by = p_user_id AND moderation_status = 'approved'
    ),
    images_rejected = (
      SELECT COUNT(*) FROM public.images_metadata 
      WHERE uploaded_by = p_user_id AND moderation_status = 'rejected'
    ),
    approval_rate = (
      CASE 
        WHEN (SELECT COUNT(*) FROM public.contributions WHERE contributor_id = p_user_id AND status IN ('approved', 'rejected')) > 0
        THEN (
          SELECT ROUND(
            (COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / 
             COUNT(*) FILTER (WHERE status IN ('approved', 'rejected'))) * 100, 
            2
          )
          FROM public.contributions 
          WHERE contributor_id = p_user_id
        )
        ELSE 0
      END
    ),
    last_contribution_at = (
      SELECT MAX(created_at) FROM public.contributions WHERE contributor_id = p_user_id
    ),
    first_contribution_at = (
      SELECT MIN(created_at) FROM public.contributions WHERE contributor_id = p_user_id
    ),
    last_calculated_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$function$;

-- ===== SECTION 5: CORRIGER LES FUNCTIONS D'ACCÈS UTILISATEUR =====

-- 1. handle_new_user - CRITIQUE POUR L'AUTHENTIFICATION
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    user_role text;
    user_first_name text;
    user_pseudo text;
    new_learner_code text;
    new_trainer_code text;
    user_email text;
BEGIN
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

-- 2. current_user_id
DROP FUNCTION IF EXISTS public.current_user_id() CASCADE;
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT auth.uid();
$function$;

-- 3. current_user_role
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- 4. get_my_role
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- 5. current_jwt_claim
DROP FUNCTION IF EXISTS public.current_jwt_claim(text) CASCADE;
CREATE OR REPLACE FUNCTION public.current_jwt_claim(claim_name text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT COALESCE(auth.jwt() ->> claim_name, current_setting('jwt.claims.' || claim_name, true));
$function$;

-- 6. jwt_claim
DROP FUNCTION IF EXISTS public.jwt_claim(text) CASCADE;
CREATE OR REPLACE FUNCTION public.jwt_claim(claim_name text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT auth.jwt() ->> claim_name;
$function$;

-- ===== SECTION 6: CORRIGER LES FUNCTIONS DE CODE GÉNÉRATION =====

-- 1. generate_unique_learner_code
DROP FUNCTION IF EXISTS public.generate_unique_learner_code() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_unique_learner_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    new_code text;
    code_exists boolean;
BEGIN
    LOOP
        new_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
        
        SELECT EXISTS(
            SELECT 1 FROM public.profiles 
            WHERE learner_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$function$;

-- 2. generate_unique_trainer_code
DROP FUNCTION IF EXISTS public.generate_unique_trainer_code() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_unique_trainer_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    new_code text;
    code_exists boolean;
BEGIN
    LOOP
        new_code := UPPER(CHR(65 + FLOOR(RANDOM() * 26)::int) || 
                          CHR(65 + FLOOR(RANDOM() * 26)::int) || 
                          LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'));
        
        SELECT EXISTS(
            SELECT 1 FROM public.profiles 
            WHERE trainer_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$function$;

-- 3. generate_exercise_request_code
DROP FUNCTION IF EXISTS public.generate_exercise_request_code() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_exercise_request_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    year_suffix VARCHAR(4);
    sequence_num INTEGER;
    new_code VARCHAR(20);
BEGIN
    IF NEW.code IS NOT NULL AND NEW.code != '' THEN
        RETURN NEW;
    END IF;
    
    year_suffix := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(code FROM 'EX-' || year_suffix || '-(\d+)') AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM public.exercise_requests
    WHERE code LIKE 'EX-' || year_suffix || '-%';
    
    new_code := 'EX-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 3, '0');
    NEW.code := new_code;
    
    RETURN NEW;
END;
$function$;

-- ===== SECTION 7: CORRIGER LES AUTRES FUNCTIONS =====

-- 1. link_exercise_to_request
DROP FUNCTION IF EXISTS public.link_exercise_to_request(varchar, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.link_exercise_to_request(p_request_code character varying, p_task_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    v_request_id UUID;
BEGIN
    SELECT id INTO v_request_id
    FROM public.exercise_requests
    WHERE code = p_request_code;
    
    IF v_request_id IS NULL THEN
        RAISE EXCEPTION 'Exercise request with code % not found', p_request_code;
    END IF;
    
    UPDATE public.exercise_requests
    SET 
        linked_task_ids = array_append(linked_task_ids, p_task_id),
        status = CASE 
            WHEN status = 'pending' THEN 'in_progress'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = v_request_id
    AND NOT (p_task_id = ANY(linked_task_ids));
    
    RETURN TRUE;
END;
$function$;

-- 2. update_exercise_request_counters
DROP FUNCTION IF EXISTS public.update_exercise_request_counters(varchar) CASCADE;
CREATE OR REPLACE FUNCTION public.update_exercise_request_counters(p_request_code character varying)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    v_request_id UUID;
    v_task_ids INTEGER[];
    v_validated_count INTEGER := 0;
    v_pending_count INTEGER := 0;
BEGIN
    SELECT id, linked_task_ids INTO v_request_id, v_task_ids
    FROM public.exercise_requests
    WHERE code = p_request_code;
    
    IF v_request_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    SELECT 
        COALESCE(SUM(CASE WHEN moderation_status = 'validated' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN moderation_status = 'pending' THEN 1 ELSE 0 END), 0)
    INTO v_validated_count, v_pending_count
    FROM public.versions
    WHERE task_id = ANY(v_task_ids);
    
    UPDATE public.exercise_requests
    SET 
        validated_versions_count = v_validated_count,
        pending_versions_count = v_pending_count,
        updated_at = NOW()
    WHERE id = v_request_id;
    
    RETURN TRUE;
END;
$function$;

-- 3. insert_contact_message
DROP FUNCTION IF EXISTS public.insert_contact_message(text, text, text, text) CASCADE;
CREATE OR REPLACE FUNCTION public.insert_contact_message(p_name text, p_email text, p_subject text, p_message text)
RETURNS TABLE(id uuid, name text, email text, subject text, message text, is_read boolean, replied boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO public.contact_messages (name, email, subject, message)
  VALUES (p_name, p_email, p_subject, p_message)
  RETURNING 
    contact_messages.id,
    contact_messages.name,
    contact_messages.email,
    contact_messages.subject,
    contact_messages.message,
    contact_messages.is_read,
    contact_messages.replied,
    contact_messages.created_at;
END;
$function$;

-- 4. update_user_profile
DROP FUNCTION IF EXISTS public.update_user_profile(uuid, text, text, text) CASCADE;
CREATE OR REPLACE FUNCTION public.update_user_profile(p_user_id uuid, p_first_name text DEFAULT NULL::text, p_last_name text DEFAULT NULL::text, p_email text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    UPDATE public.profiles
    SET 
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        email = COALESCE(p_email, email)
    WHERE id = p_user_id;
END;
$function$;

-- 5. get_user_progress_details
DROP FUNCTION IF EXISTS public.get_user_progress_details(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_progress_details(p_user_id uuid)
RETURNS TABLE(id uuid, task_id uuid, version_id uuid, task_title text, version_name text, attempts integer, first_time_seconds integer, best_time_seconds integer, completed_steps_history jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        uvp.id,
        t.id AS task_id,
        v.id AS version_id,
        t.title AS task_title,
        v.name AS version_name,
        uvp.attempts,
        uvp.first_time_seconds,
        uvp.best_time_seconds,
        uvp.completed_steps_history
    FROM
        public.user_version_progress uvp
    JOIN
        public.versions v ON uvp.version_id = v.id
    JOIN
        public.tasks t ON v.task_id = t.id
    WHERE
        uvp.user_id = p_user_id
    ORDER BY
        uvp.last_attempted_at DESC;
END;
$function$;

-- 6. upsert_user_version_progress
DROP FUNCTION IF EXISTS public.upsert_user_version_progress(uuid, uuid, integer, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.upsert_user_version_progress(p_user_id uuid, p_version_id uuid, p_attempt_time_seconds integer, p_completed_step jsonb)
RETURNS public.user_version_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  _now timestamptz := now();
  _row public.user_version_progress%ROWTYPE;
BEGIN
  UPDATE public.user_version_progress
  SET
    attempts = COALESCE(attempts, 0) + 1,
    first_time_seconds = CASE WHEN first_time_seconds IS NULL THEN p_attempt_time_seconds ELSE first_time_seconds END,
    best_time_seconds = CASE
      WHEN p_attempt_time_seconds IS NOT NULL AND (best_time_seconds IS NULL OR p_attempt_time_seconds < best_time_seconds)
      THEN p_attempt_time_seconds
      ELSE best_time_seconds
    END,
    completed_steps_history = CASE
      WHEN p_completed_step IS NOT NULL THEN COALESCE(completed_steps_history, '[]'::jsonb) || jsonb_build_array(p_completed_step)
      ELSE completed_steps_history
    END,
    updated_at = _now
  WHERE user_id = p_user_id AND version_id = p_version_id
  RETURNING * INTO _row;

  IF FOUND THEN
    RETURN _row;
  END IF;

  INSERT INTO public.user_version_progress(id, user_id, version_id, attempts, first_time_seconds, best_time_seconds, completed_steps_history, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    p_user_id,
    p_version_id,
    1,
    p_attempt_time_seconds,
    p_attempt_time_seconds,
    CASE WHEN p_completed_step IS NOT NULL THEN jsonb_build_array(p_completed_step) ELSE '[]'::jsonb END,
    _now,
    _now
  )
  RETURNING * INTO _row;

  RETURN _row;
END;
$function$;

-- ===== SECTION 8: CORRIGER LES FUNCTIONS TIMESTAMP =====

-- 1. handle_updated_at
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. set_updated_at
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

-- 3. set_created_at_if_null
DROP FUNCTION IF EXISTS public.set_created_at_if_null() CASCADE;
CREATE OR REPLACE FUNCTION public.set_created_at_if_null()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. set_created_at_timestamp
DROP FUNCTION IF EXISTS public.set_created_at_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION public.set_created_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$function$;

-- 5. update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 6. update_questionnaire_choices_updated_at
DROP FUNCTION IF EXISTS public.update_questionnaire_choices_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_questionnaire_choices_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 7. update_questionnaire_questions_updated_at
DROP FUNCTION IF EXISTS public.update_questionnaire_questions_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_questionnaire_questions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- ===== SECTION 9: CORRIGER LES FUNCTIONS SUPPLÉMENTAIRES =====

-- 1. set_task_owner
DROP FUNCTION IF EXISTS public.set_task_owner() CASCADE;
CREATE OR REPLACE FUNCTION public.set_task_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. log_error_report_deletion
DROP FUNCTION IF EXISTS public.log_error_report_deletion() CASCADE;
CREATE OR REPLACE FUNCTION public.log_error_report_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    INSERT INTO public.error_reports_log (error_report_id, deleted_at)
    VALUES (OLD.id, now());
    RETURN OLD;
END;
$function$;

-- 3. unlink_trainer_learner
DROP FUNCTION IF EXISTS public.unlink_trainer_learner(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.unlink_trainer_learner() CASCADE;
CREATE OR REPLACE FUNCTION public.unlink_trainer_learner(p_trainer_id uuid, p_learner_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    IF p_trainer_id IS NULL OR p_learner_id IS NULL THEN
        RAISE EXCEPTION 'Trainer ID and Learner ID must not be null';
    END IF;

    DELETE FROM public.trainer_learner_links
    WHERE trainer_id = p_trainer_id
      AND learner_id = p_learner_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in unlink_trainer_learner: %', SQLERRM;
        RETURN FALSE;
END;
$function$;

-- 4. calculate_reward_distribution
DROP FUNCTION IF EXISTS public.calculate_reward_distribution(numeric) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_reward_distribution(p_sales_milestone numeric)
RETURNS TABLE(contributor_id uuid, contributor_pseudo text, total_points integer, percentage numeric, amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  v_amount_to_distribute DECIMAL(10,2);
  v_total_community_points INTEGER;
BEGIN
  v_amount_to_distribute := p_sales_milestone * 0.20;
  
  SELECT COALESCE(SUM(points_earned), 0) INTO v_total_community_points
  FROM public.contribution_points
  WHERE is_active = true;
  
  IF v_total_community_points = 0 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    cp.contributor_id,
    u.public_pseudo,
    SUM(cp.points_earned) as total_points,
    ROUND((SUM(cp.points_earned)::DECIMAL / v_total_community_points) * 100, 2) as percentage,
    ROUND((SUM(cp.points_earned)::DECIMAL / v_total_community_points) * v_amount_to_distribute, 2) as amount
  FROM public.contribution_points cp
  JOIN public.profiles u ON u.id = cp.contributor_id
  WHERE cp.is_active = true
  GROUP BY cp.contributor_id, u.public_pseudo
  HAVING SUM(cp.points_earned) > 0
  ORDER BY total_points DESC;
END;
$function$;

-- 5. avg_satisfaction_rating
DROP FUNCTION IF EXISTS public.avg_satisfaction_rating() CASCADE;
CREATE OR REPLACE FUNCTION public.avg_satisfaction_rating()
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT AVG(rating)::numeric FROM public.satisfaction_responses;
$function$;

-- 6. get_distinct_image_categories
DROP FUNCTION IF EXISTS public.get_distinct_image_categories() CASCADE;
CREATE OR REPLACE FUNCTION public.get_distinct_image_categories()
RETURNS TABLE(category text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT unnest(array_agg(ai.category))
    FROM public.app_images ai;
END;
$function$;

-- 7. get_distinct_image_subcategories
DROP FUNCTION IF EXISTS public.get_distinct_image_subcategories(text) CASCADE;
CREATE OR REPLACE FUNCTION public.get_distinct_image_subcategories(category_filter text DEFAULT NULL::text)
RETURNS TABLE(subcategory text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT DISTINCT app_images.subcategory
  FROM public.app_images
  WHERE (category_filter IS NULL OR app_images.category = category_filter)
    AND app_images.subcategory IS NOT NULL
  ORDER BY app_images.subcategory;
$function$;

-- 8. update_version_if_match
DROP FUNCTION IF EXISTS public.update_version_if_match(uuid, jsonb, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.update_version_if_match(p_id uuid, p_patch jsonb, p_expected_version integer)
RETURNS public.versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  _old jsonb;
  _new jsonb;
  _updated_row public.versions%ROWTYPE;
BEGIN
  SELECT to_jsonb(v.*) INTO _old
  FROM public.versions v
  WHERE v.id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found';
  END IF;

  IF ( (_old ->> 'version_int')::integer IS DISTINCT FROM p_expected_version ) THEN
    RAISE EXCEPTION 'version_conflict';
  END IF;

  _new := _old || p_patch;

  UPDATE public.versions
  SET
    name = ( _new ->> 'name' )::text,
    version = ( _new ->> 'version' )::text,
    pictogram_app_image_id = ( NULLIF(_new ->> 'pictogram_app_image_id','') )::uuid,
    app_image_id = ( NULLIF(_new ->> 'app_image_id','') )::uuid,
    icon_name = ( _new ->> 'icon_name' )::text,
    has_variant_note = (CASE WHEN _new ? 'has_variant_note' THEN (_new ->> 'has_variant_note')::boolean ELSE has_variant_note END),
    task_id = ( NULLIF(_new ->> 'task_id','') )::uuid,
    updated_at = now(),
    version_int = version_int + 1
  WHERE id = p_id
  RETURNING * INTO _updated_row;

  RETURN _updated_row;
END;
$function$;

-- 9. versions_to_compare_json
DROP FUNCTION IF EXISTS public.versions_to_compare_json(public.versions) CASCADE;
CREATE OR REPLACE FUNCTION public.versions_to_compare_json(v public.versions)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT jsonb_build_object(
    'name', v.name,
    'version', v.version,
    'pictogram_app_image_id', v.pictogram_app_image_id,
    'app_image_id', v.app_image_id,
    'icon_name', v.icon_name,
    'has_variant_note', v.has_variant_note,
    'task_id', v.task_id
  );
$function$;

-- 10. update_user_version_progress
DROP FUNCTION IF EXISTS public.update_user_version_progress(uuid, uuid, integer, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.update_user_version_progress(p_user_id uuid, p_version_id uuid, p_attempt_time_seconds integer, p_completed_step jsonb)
RETURNS public.user_version_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  _now timestamptz := now();
  _row_id uuid;
  _result public.user_version_progress%ROWTYPE;
BEGIN
  SELECT id INTO _row_id
  FROM public.user_version_progress
  WHERE user_id = p_user_id
    AND version_id = p_version_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_version_progress_not_found';
  END IF;

  UPDATE public.user_version_progress
  SET
    attempts = COALESCE(attempts, 0) + 1,
    first_time_seconds = CASE
      WHEN first_time_seconds IS NULL THEN p_attempt_time_seconds
      ELSE first_time_seconds
    END,
    best_time_seconds = CASE
      WHEN p_attempt_time_seconds IS NOT NULL
       AND (best_time_seconds IS NULL OR p_attempt_time_seconds < best_time_seconds)
      THEN p_attempt_time_seconds
      ELSE best_time_seconds
    END,
    completed_steps_history = CASE
      WHEN p_completed_step IS NOT NULL THEN
        COALESCE(completed_steps_history, '[]'::jsonb) || jsonb_build_array(p_completed_step)
      ELSE completed_steps_history
    END,
    updated_at = _now
  WHERE id = _row_id
  RETURNING * INTO _result;

  RETURN _result;
END;
$function$;

-- ===== SECTION 10: CORRIGER RLS & SECURITY =====

-- 1. rls_audit_rotate_90_days
DROP FUNCTION IF EXISTS public.rls_audit_rotate_90_days() CASCADE;
CREATE OR REPLACE FUNCTION public.rls_audit_rotate_90_days()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  DELETE FROM public.rls_function_eval_audit
  WHERE detected_at < now() - INTERVAL '90 days';
END;
$function$;

-- 2. detect_rls_function_re_evaluation
DROP FUNCTION IF EXISTS public.detect_rls_function_re_evaluation() CASCADE;
CREATE OR REPLACE FUNCTION public.detect_rls_function_re_evaluation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  r record;
  col_list text;
BEGIN
  FOR r IN
    WITH policies AS (
      SELECT
        pol.oid AS policy_oid,
        n.nspname AS schema_name,
        c.relname AS table_name,
        pol.polname AS policy_name,
        pol.polcmd AS command,
        pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
        pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expr
      FROM pg_policy pol
      JOIN pg_class c ON c.oid = pol.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname NOT IN ('pg_catalog','information_schema')
    ),
    exploded AS (
      SELECT policy_oid, schema_name, table_name, policy_name, command, 'using' AS expr_type, using_expr AS expr FROM policies WHERE using_expr IS NOT NULL
      UNION ALL
      SELECT policy_oid, schema_name, table_name, policy_name, command, 'with_check' AS expr_type, with_check_expr AS expr FROM policies WHERE with_check_expr IS NOT NULL
    ),
    matches AS (
      SELECT
        e.*,
        CASE
          WHEN expr ~* '\bcurrent_setting\s*\(' THEN 'current_setting'
          WHEN expr ~* '\bauth\.(uid|jwt|role)\s*\(' THEN 'auth.func_paren'
          WHEN expr ~* '\bauth\.(uid|jwt|role)\b' THEN 'auth.func_no_paren'
          ELSE NULL
        END AS detected_fn,
        false AS references_column,
        left(expr,800) AS expr_preview
      FROM exploded e
    )
    SELECT * FROM matches WHERE detected_fn IS NOT NULL
  LOOP
    col_list := (SELECT string_agg(attname, '|') FROM pg_attribute a
                 JOIN pg_class c ON c.oid = (SELECT oid FROM pg_class WHERE relname = r.table_name AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = r.schema_name) LIMIT 1)
                 WHERE a.attnum > 0 AND NOT a.attisdropped);
    IF col_list IS NULL THEN
      r.references_column := false;
    ELSE
      r.references_column := (r.expr_preview ~* ('\b(' || col_list || ')\b'));
    END IF;

    INSERT INTO public.rls_function_eval_audit(schema_name, table_name, policy_name, command, expr_type, detected_fn, references_column, expr_preview)
    VALUES (r.schema_name, r.table_name, r.policy_name, r.command, r.expr_type, r.detected_fn, r.references_column, r.expr_preview);
  END LOOP;
END;
$function$;

-- ================================================================
-- FIN DE LA CORRECTION COMPLÈTE
-- ================================================================
-- Toutes les functions ont maintenant:
-- ✅ SET search_path = 'public', 'pg_catalog' pour sécurité
-- ✅ SECURITY DEFINER où nécessaire
-- ✅ Logique correcte restaurée (pas de dummy functions)
-- ✅ Accès utilisateur réparé (handle_new_user, current_user_*, get_my_role)
-- ✅ RLS activé sur les 4 tables manquantes
-- ================================================================
