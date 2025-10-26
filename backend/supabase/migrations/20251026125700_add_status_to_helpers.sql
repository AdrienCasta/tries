ALTER TABLE helpers
ADD COLUMN status TEXT NOT NULL DEFAULT 'incomplete'
CHECK (status IN ('pending_review', 'incomplete'));
