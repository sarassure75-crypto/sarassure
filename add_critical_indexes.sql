-- ============================================================================
-- INDEXES CRITIQUES POUR OPTIMISATION DES PERFORMANCES
-- Date: 2025-12-09
-- ============================================================================

-- Index pour les recherches de tâches par catégorie et type
CREATE INDEX IF NOT EXISTS idx_tasks_category_type_active 
ON public.tasks(category_id, task_type, creation_status) 
WHERE is_deleted = false;

-- Index pour les tentatives de questionnaires par apprenant
CREATE INDEX IF NOT EXISTS idx_questionnaire_attempts_learner_task 
ON public.questionnaire_attempts(learner_id, task_id, completed_at DESC);

-- Index pour les questions de questionnaires par task_id
CREATE INDEX IF NOT EXISTS idx_questionnaire_questions_task 
ON public.questionnaire_questions(task_id, question_order);

-- Index pour les choix par question_id
CREATE INDEX IF NOT EXISTS idx_questionnaire_choices_question 
ON public.questionnaire_choices(question_id, choice_order);

-- Index pour les images en attente de modération
CREATE INDEX IF NOT EXISTS idx_images_metadata_moderation 
ON public.images_metadata(moderation_status, uploaded_at DESC)
WHERE moderation_status = 'pending';

-- Index pour les contributions par statut
CREATE INDEX IF NOT EXISTS idx_contributions_status 
ON public.contributions(status, created_at DESC)
WHERE status IN ('draft', 'pending');

-- Index pour les profils par rôle
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role, created_at DESC);

-- Index pour la progression des utilisateurs
CREATE INDEX IF NOT EXISTS idx_user_progress_user_version 
ON public.user_version_progress(user_id, version_id, completed);

-- Index pour les rapports d'erreur par date
CREATE INDEX IF NOT EXISTS idx_error_reports_date 
ON public.error_reports(report_date DESC, is_sent);

-- Index pour la visibilité des apprenants
CREATE INDEX IF NOT EXISTS idx_learner_visibility_learner 
ON public.learner_visibility(learner_id, task_id, is_visible)
WHERE is_visible = true;

-- Index pour les versions par task_id
CREATE INDEX IF NOT EXISTS idx_versions_task 
ON public.versions(task_id, created_at DESC);

-- Index pour les étapes par version_id
CREATE INDEX IF NOT EXISTS idx_steps_version 
ON public.steps(version_id, step_order);

-- Index composite pour les points des contributeurs
CREATE INDEX IF NOT EXISTS idx_contributor_points_user_date 
ON public.contributor_points(contributor_id, awarded_at DESC);

-- Index pour les statistiques des contributeurs
CREATE INDEX IF NOT EXISTS idx_contributor_stats_user 
ON public.contributor_stats(user_id);

-- Analyse des tables pour mettre à jour les statistiques PostgreSQL
ANALYZE public.tasks;
ANALYZE public.questionnaire_attempts;
ANALYZE public.questionnaire_questions;
ANALYZE public.questionnaire_choices;
ANALYZE public.images_metadata;
ANALYZE public.contributions;
ANALYZE public.profiles;
ANALYZE public.user_version_progress;
ANALYZE public.error_reports;
ANALYZE public.learner_visibility;
ANALYZE public.versions;
ANALYZE public.steps;
ANALYZE public.contributor_points;
ANALYZE public.contributor_stats;

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
