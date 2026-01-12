-- Add missing columns to the error_reports table
ALTER TABLE public.error_reports
ADD COLUMN IF NOT EXISTS error_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS stack_trace TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS page_url VARCHAR(2048),
ADD COLUMN IF NOT EXISTS report_date TIMESTAMPTZ DEFAULT now();

-- Optional: Drop the old 'details' column if it's no longer needed
-- ALTER TABLE public.error_reports DROP COLUMN IF EXISTS details;

-- Grant usage on the sequence if it exists and is needed for a serial primary key
-- (Assuming 'id' is the primary key and is of type serial or bigserial)
-- GRANT USAGE, SELECT ON SEQUENCE error_reports_id_seq TO authenticated, service_role;

-- Ensure RLS is enabled and policies are in place
-- The policy below allows any authenticated user to insert an error report.
-- Adjust as necessary for your security requirements.

-- First, enable RLS if not already enabled
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists, to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert error reports" ON public.error_reports;

-- Create a new policy that allows any authenticated user to insert a report
CREATE POLICY "Allow authenticated users to insert error reports"
ON public.error_reports
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure admins can see all reports
DROP POLICY IF EXISTS "Admins can view all error reports" ON public.error_reports;
CREATE POLICY "Admins can view all error reports"
ON public.error_reports
FOR SELECT
TO authenticated
USING ( (auth.jwt() -> 'user_role') = '"ADMIN"'::jsonb );

-- Ensure users can't see other users' reports (if you add a user_id column)
-- Example policy if you add a user_id column to link errors to users:
-- ALTER TABLE public.error_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
-- CREATE POLICY "Users can view their own error reports"
-- ON public.error_reports
-- FOR SELECT
-- USING ( auth.uid() = user_id );

COMMENT ON TABLE public.error_reports IS 'Stores client-side error reports for debugging purposes.';
COMMENT ON COLUMN public.error_reports.error_type IS 'The type of error (e.g., TypeError, NetworkError).';
COMMENT ON COLUMN public.error_reports.error_message IS 'The main error message string.';
COMMENT ON COLUMN public.error_reports.stack_trace IS 'The component stack or JavaScript stack trace.';
COMMENT ON COLUMN public.error_reports.user_agent IS 'The user agent string of the client browser.';
COMMENT ON COLUMN public.error_reports.page_url IS 'The URL of the page where the error occurred.';
COMMENT ON COLUMN public.error_reports.report_date IS 'The timestamp when the error was reported.';
