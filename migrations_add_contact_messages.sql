-- Migration: Create contact_messages table
-- Purpose: Store contact form submissions from users

-- Create contact_messages table if not exists
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    replied boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS contact_messages_is_read_idx ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (avoid conflicts)
DROP POLICY IF EXISTS "Admins can read all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;

-- Policy: Admins and trainers can read all messages
CREATE POLICY "Admins can read all contact messages"
    ON public.contact_messages FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('admin', 'trainer')
        )
    );

-- Policy: Admins and trainers can update messages (mark as read/replied)
CREATE POLICY "Admins can update contact messages"
    ON public.contact_messages FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('admin', 'trainer')
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('admin', 'trainer')
        )
    );

-- Policy: Admins and trainers can delete messages
CREATE POLICY "Admins can delete contact messages"
    ON public.contact_messages FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role IN ('admin', 'trainer')
        )
    );

-- Policy: Anyone can insert contact messages
CREATE POLICY "Anyone can send contact messages"
    ON public.contact_messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
