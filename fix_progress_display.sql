-- Fix RPC function to include task_id and version_id
CREATE OR REPLACE FUNCTION public.get_user_progress_details(p_user_id uuid)
 RETURNS TABLE(
   id uuid, 
   task_id uuid,
   version_id uuid,
   task_title text, 
   version_name text, 
   attempts integer, 
   first_time_seconds integer, 
   best_time_seconds integer, 
   completed_steps_history jsonb
 )
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
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
