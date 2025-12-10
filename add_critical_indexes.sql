-- ============================================================================
-- INDEXES CRITIQUES POUR OPTIMISATION DES PERFORMANCES
-- Date: 2025-12-09
-- Note: Création conditionnelle - vérifie l'existence des tables
-- ============================================================================

DO $$
BEGIN
    -- Index pour les recherches de tâches par catégorie et type
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_category_type_active 
        ON public.tasks(category_id, task_type, creation_status) 
        WHERE is_deleted = false;
    END IF;

    -- Index pour les tentatives de questionnaires par apprenant
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questionnaire_attempts') THEN
        CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_learner_task 
        ON public.questionnaire_attempts(learner_id, task_id, completed_at DESC);
    END IF;

    -- Index pour les questions de questionnaires par task_id
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questionnaire_questions') THEN
        CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_task 
        ON public.questionnaire_questions(task_id, question_order);
    END IF;

    -- Index pour les choix par question_id
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questionnaire_choices') THEN
        CREATE INDEX IF NOT EXISTS idx_questionnaire_choices_question 
        ON public.questionnaire_choices(question_id, choice_order);
    END IF;

    -- Index pour les images en attente de modération
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'images_metadata') THEN
        CREATE INDEX IF NOT EXISTS idx_images_metadata_moderation 
        ON public.images_metadata(moderation_status, uploaded_at DESC)
        WHERE moderation_status = 'pending';
    END IF;

    -- Index pour les contributions par statut
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributions') THEN
        CREATE INDEX IF NOT EXISTS idx_contributions_status 
        ON public.contributions(status, created_at DESC)
        WHERE status IN ('draft', 'pending');
    END IF;

    -- Index pour les profils par rôle
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_role 
        ON public.profiles(role, created_at DESC);
    END IF;

    -- Index pour la progression des utilisateurs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_version_progress') THEN
        CREATE INDEX IF NOT EXISTS idx_user_progress_user_version 
        ON public.user_version_progress(user_id, version_id, last_attempted_at DESC);
    END IF;

    -- Index pour les rapports d'erreur par date
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'error_reports') THEN
        CREATE INDEX IF NOT EXISTS idx_error_reports_date 
        ON public.error_reports(report_date DESC, is_sent);
    END IF;

    -- Index pour la visibilité des apprenants
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learner_visibility') THEN
        CREATE INDEX IF NOT EXISTS idx_learner_visibility_learner 
        ON public.learner_visibility(learner_id, task_id, is_visible)
        WHERE is_visible = true;
    END IF;

    -- Index pour les versions par task_id
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'versions') THEN
        CREATE INDEX IF NOT EXISTS idx_versions_task 
        ON public.versions(task_id, created_at DESC);
    END IF;

    -- Index pour les étapes par version_id
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'steps') THEN
        CREATE INDEX IF NOT EXISTS idx_steps_version 
        ON public.steps(version_id, step_order);
    END IF;

    -- Index composite pour les points des contributeurs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributor_points') THEN
        CREATE INDEX IF NOT EXISTS idx_contributor_points_user_date 
        ON public.contributor_points(contributor_id, awarded_at DESC);
    END IF;

    -- Index pour les statistiques des contributeurs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributor_stats') THEN
        CREATE INDEX IF NOT EXISTS idx_contributor_stats_user 
        ON public.contributor_stats(user_id);
    END IF;
END $$;

-- Analyse des tables pour mettre à jour les statistiques PostgreSQL
-- Uniquement les tables principales garanties d'exister
ANALYZE public.tasks;
ANALYZE public.profiles;
ANALYZE public.user_version_progress;
ANALYZE public.error_reports;
ANALYZE public.learner_visibility;
ANALYZE public.versions;
ANALYZE public.steps;

-- Tables optionnelles (ignorer l'erreur si elles n'existent pas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questionnaire_attempts') THEN
        ANALYZE public.questionnaire_attempts;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questionnaire_questions') THEN
        ANALYZE public.questionnaire_questions;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questionnaire_choices') THEN
        ANALYZE public.questionnaire_choices;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'images_metadata') THEN
        ANALYZE public.images_metadata;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributions') THEN
        ANALYZE public.contributions;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributor_points') THEN
        ANALYZE public.contributor_points;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributor_stats') THEN
        ANALYZE public.contributor_stats;
    END IF;
END $$;

-- Afficher les indexes créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
