-- Supabase Schema for Helpers
-- Run this in Supabase SQL Editor

-- Create helpers table (business data only)
CREATE TABLE IF NOT EXISTS public.helpers (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (for tests)
CREATE POLICY "Service role can do anything" ON public.helpers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS helpers_email_idx ON public.helpers(email);

-- Note: Helper authentication data is stored in auth.users via Supabase Auth
-- We use auth.users.user_metadata to store:
-- - passwordSetupToken (as token field)
-- - passwordSetupTokenExpiresAt (as token_expires_at field)
-- Password is handled natively by Supabase Auth
