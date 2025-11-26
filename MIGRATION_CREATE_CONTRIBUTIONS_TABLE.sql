-- ============================================================================
-- MIGRATION: Create contributions table for exercise validation
-- ============================================================================

-- Create contributions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contributions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contributor_id uuid NOT NULL,
    exercise_name text NOT NULL,
    exercise_description text,
    difficulty_level text,
    steps jsonb,
    images jsonb,
    status text DEFAULT 'pending' NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contributions_contributor_id_fkey'
    ) THEN
        ALTER TABLE public.contributions ADD CONSTRAINT contributions_contributor_id_fkey 
            FOREIGN KEY (contributor_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contributions_reviewed_by_fkey'
    ) THEN
        ALTER TABLE public.contributions ADD CONSTRAINT contributions_reviewed_by_fkey 
            FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor_id ON public.contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON public.contributions(created_at DESC);

-- Add columns if they don't exist
DO $$
BEGIN
    ALTER TABLE public.contributions 
    ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
    ALTER TABLE public.contributions 
    ADD COLUMN IF NOT EXISTS reviewed_by uuid;
    ALTER TABLE public.contributions 
    ADD COLUMN IF NOT EXISTS rejection_reason text;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Contributors can read own contributions" ON public.contributions;
DROP POLICY IF EXISTS "Contributors can create contributions" ON public.contributions;
DROP POLICY IF EXISTS "Admins can manage all contributions" ON public.contributions;

-- RLS Policies
CREATE POLICY "Contributors can read own contributions" ON public.contributions
FOR SELECT USING (
    contributor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'administrateur'
    )
);

CREATE POLICY "Contributors can create contributions" ON public.contributions
FOR INSERT WITH CHECK (
    contributor_id = auth.uid()
);

CREATE POLICY "Admins can manage all contributions" ON public.contributions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'administrateur'
    )
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_contributions_updated_at ON public.contributions;
CREATE TRIGGER update_contributions_updated_at
BEFORE UPDATE ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- MIGRATION: Add validation columns to images_metadata table
-- ============================================================================

DO $$
BEGIN
    ALTER TABLE public.images_metadata
    ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
    ALTER TABLE public.images_metadata
    ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id);
    ALTER TABLE public.images_metadata
    ADD COLUMN IF NOT EXISTS rejection_reason text;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Add trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_images_metadata_updated_at ON public.images_metadata;
CREATE TRIGGER update_images_metadata_updated_at
BEFORE UPDATE ON public.images_metadata
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
