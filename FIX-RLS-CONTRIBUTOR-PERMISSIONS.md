# FIX: RLS Permission Error for Contributors

## 🔴 Erreur
```
"new row violates row-level security policy for table "versions""
```

## 🔍 Cause
La table `versions` (et `steps`) a des policies RLS qui permettent **uniquement aux admins et formateurs** de créer des versions/steps. Les contributeurs ne peuvent pas!

Les policies actuelles:
```sql
CREATE POLICY "Allow admins and trainers to manage exercises" 
  ON public.versions 
  FOR ALL 
  USING ((get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text])));
```

Cela signifie: **Seuls les admins et formateurs** peuvent faire ANY (SELECT, INSERT, UPDATE, DELETE).

## ✅ Solution
Ajouter une policy permettant aux contributeurs de créer des versions/steps **pour leurs propres tâches**.

## 📋 How to Apply

### Option 1: Via Supabase Dashboard (Recommandé)
1. Ouvre **Supabase Dashboard** → Ton projet
2. Va à **SQL Editor**
3. Clique **New Query**
4. Copie le contenu du fichier: `migrations_fix_contributor_permissions.sql`
5. Clique **Run**
6. ✅ Done !

### Option 2: Via SQL (Copy-paste exact)
Exécute ce SQL dans Supabase:

```sql
-- Fix RLS for versions table
DROP POLICY IF EXISTS "Allow admins and trainers to manage exercises" ON public.versions;

CREATE POLICY "Contributors can manage versions for their own tasks" 
  ON public.versions 
  FOR ALL 
  USING (
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    (task_id IN (
      SELECT id FROM public.tasks 
      WHERE owner_id = auth.uid()
    ))
  )
  WITH CHECK (
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    (task_id IN (
      SELECT id FROM public.tasks 
      WHERE owner_id = auth.uid()
    ))
  );

-- Fix RLS for steps table
DROP POLICY IF EXISTS "Allow admins and trainers to manage steps" ON public.steps;

CREATE POLICY "Contributors can manage steps for their own versions"
  ON public.steps
  FOR ALL
  USING (
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    (version_id IN (
      SELECT v.id FROM public.versions v
      JOIN public.tasks t ON v.task_id = t.id
      WHERE t.owner_id = auth.uid()
    ))
  )
  WITH CHECK (
    (get_my_role() = ANY (ARRAY['administrateur'::text, 'formateur'::text]))
    OR
    (version_id IN (
      SELECT v.id FROM public.versions v
      JOIN public.tasks t ON v.task_id = t.id
      WHERE t.owner_id = auth.uid()
    ))
  );
```

## 🧪 Test After Fix

1. **Déconnecte-toi** si tu es connecté comme admin
2. **Crée un compte contributeur** (ou utilise un compte non-admin)
3. **Va à**: http://localhost:5173/contributeur/nouvelle-contribution
4. **Crée une contribution** complète (titre, description, version, steps)
5. **Clique Soumettre**

### Si tu vois ✅
```
✅ Contribution soumise avec succès! 
Elle sera validée par un administrateur.
```
→ **Le problème est RÉSOLU!**

### Si tu vois encore l'erreur RLS
→ Partage le message d'erreur exact et je vais enquêter

## 📊 What Changed

**Before:**
```
versions: Only admins/trainers can INSERT/UPDATE
steps: Only admins/trainers can INSERT/UPDATE
```

**After:**
```
versions: Admins/trainers OR task owner can INSERT/UPDATE
steps: Admins/trainers OR task owner (via version) can INSERT/UPDATE
```

## 💡 How It Works

### Versions Policy
```sql
FOR ALL USING (
  is_admin_or_trainer() 
  OR 
  I_own_the_task_this_version_belongs_to()
)
```

### Steps Policy
```sql
FOR ALL USING (
  is_admin_or_trainer() 
  OR 
  I_own_the_task_that_contains_this_version()
)
```

## ⚠️ Important Notes

- **Task policies already work**: Contributors can create tasks (line 423 in schema.sql)
- **This only fixes versions/steps**: We're adding contributor permission for child tables
- **Security**: Contributors can ONLY manage versions/steps for tasks they own
- **Admins**: Still have full access to everything

## 🔐 Security Check

The policy ensures:
1. ✅ User must own the parent task
2. ✅ Cannot modify other users' content
3. ✅ Cannot escalate permissions
4. ✅ Admins still have override access

## 📞 If It Still Doesn't Work

1. **Verify user role**: Check if you're logged in as non-admin
   ```
   SELECT current_user_role() -- Should show 'contributeur'
   ```

2. **Verify task owner**: Check if the task has owner_id set
   ```
   SELECT id, title, owner_id FROM tasks LIMIT 5;
   ```

3. **Check RLS is applied**: Verify the new policies exist
   ```
   SELECT * FROM pg_policies WHERE tablename = 'versions';
   ```

---

**File**: `migrations_fix_contributor_permissions.sql`
**Status**: Ready to apply ✅
**Impact**: Contributors can now create contributions
**Risk Level**: Low (only affects permissions, no data changes)
