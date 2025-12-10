# Instructions pour exporter le Schema actuel de Supabase

## Étape 1 : Exporter via Supabase SQL Editor

1. Va dans **Supabase Dashboard → SQL Editor**
2. Lance cette requête pour générer l'export complet :

```sql
-- Export complet du schema
SELECT pg_dump(
  format := 'plain'
);
```

OU plus simplement via **Supabase CLI** :

```bash
# Installer Supabase CLI si nécessaire
npm install -g @supabase/cli

# Se connecter
supabase login

# Exporter le schema
supabase db pull --schema-only
```

## Étape 2 : Alternative - Utiliser pgAdmin/psql

```bash
# Via psql (si accès direct au DB)
pg_dump -U postgres -h db.xxxxx.supabase.co -d postgres --schema=public > schema-updated.sql
```

## Étape 3 : Mettre à jour Git

```bash
# Copier le schema exporté
cp schema-updated.sql schema.sql

# Commiter
git add schema.sql
git commit -m "feat: mise à jour du schema avec corrections functions et RLS"
git push
```

## Étape 4 : Déployer sur Hostinger

```bash
# SSH dans Hostinger
ssh user@hostinger.com

# Mettre à jour depuis Git
cd /app
git pull origin main

# Redéployer
npm run build
npm run deploy  # ou votre commande de déploiement
```

---

**Quelle approche préfères-tu ?**
1. Exporter via Supabase CLI (le plus fiable)
2. Exporter manuellement via SQL Editor
3. Je regénère un schema.sql complet basé sur les corrections appliquées
