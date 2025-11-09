ALTER TABLE public.users
ADD COLUMN profile_status TEXT NOT NULL DEFAULT 'incomplete'
CHECK (profile_status IN ('incomplete', 'completed'));
