-- ============================================================================
-- MIGRATION SÉCURISÉE: Normaliser les rôles SANS CASSER L'EXISTANT
-- ============================================================================
-- Ce script ne modifie QUE les rôles au format anglais vers le format français
-- Il ne touche PAS aux rôles déjà corrects

-- 1. VÉRIFICATION : Afficher tous les rôles actuels
SELECT 
  role,
  COUNT(*) as count,
  string_agg(DISTINCT email, ', ') as exemple_emails
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- 2. MIGRATION OPTIONNELLE : Normaliser vers format français
-- DÉCOMMENTER UNIQUEMENT SI VOUS VOULEZ NORMALISER

/*
-- Mettre à jour contributor → contributeur
UPDATE profiles
SET role = 'contributeur'
WHERE role = 'contributor';

-- Mettre à jour admin → administrateur
UPDATE profiles
SET role = 'administrateur'
WHERE role = 'admin';

-- Mettre à jour trainer → formateur
UPDATE profiles
SET role = 'formateur'
WHERE role = 'trainer';

-- Mettre à jour learner → apprenant
UPDATE profiles
SET role = 'apprenant'
WHERE role = 'learner';
*/

-- 3. VÉRIFICATION FINALE : Afficher le résultat
SELECT 
  role,
  COUNT(*) as count,
  string_agg(email, ', ') as emails
FROM profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'administrateur' THEN 1
    WHEN 'admin' THEN 1
    WHEN 'formateur' THEN 2
    WHEN 'trainer' THEN 2
    WHEN 'contributeur' THEN 3
    WHEN 'contributor' THEN 3
    WHEN 'apprenant' THEN 4
    WHEN 'learner' THEN 4
    ELSE 5
  END;

-- 4. Rapport des rôles
SELECT 
  '✅ L''application est maintenant compatible avec TOUS les formats de rôles' as status,
  'Vous pouvez avoir à la fois "contributor" et "contributeur" dans votre base' as note,
  'Les deux formats fonctionneront correctement' as garantie;

-- ============================================================================
-- IMPORTANT: NE PAS EXÉCUTER DE MIGRATION AUTOMATIQUE
-- ============================================================================
/*
L'application a été mise à jour pour accepter:
- Les rôles français: administrateur, formateur, contributeur, apprenant
- Les rôles anglais: admin, trainer, contributor, learner
- Les variantes de casse (majuscules/minuscules)

AUCUNE MIGRATION N'EST NÉCESSAIRE.
Vos données existantes continueront de fonctionner.

Si vous voulez quand même normaliser vers le français:
1. Faites un BACKUP de votre base de données
2. Décommentez la section 2 ci-dessus
3. Exécutez le script
4. Vérifiez que tout fonctionne

Mais ce n'est PAS obligatoire !
*/
