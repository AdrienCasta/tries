-- Migration: Create professions reference table and junction table for multiple professions per helper
-- Date: 2025-10-06

-- Step 1: Create professions reference table
CREATE TABLE IF NOT EXISTS professions (
  id SERIAL PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Seed professions with predefined values
INSERT INTO professions (name) VALUES
  ('physiotherapist'),
  ('osteopath'),
  ('physical_trainer'),
  ('sports_coach'),
  ('first_responder'),
  ('sports_physiotherapist'),
  ('acupuncturist'),
  ('massage_therapist'),
  ('chiropractor'),
  ('mental_coach'),
  ('microkinesitherapist'),
  ('nurse'),
  ('doctor'),
  ('etiopath')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create junction table for helper-profession relationship
CREATE TABLE IF NOT EXISTS helper_professions (
  helper_id uuid NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  profession_id integer NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (helper_id, profession_id)
);

-- Step 4: Create index for querying helpers by profession
CREATE INDEX IF NOT EXISTS idx_helper_professions_profession_id
  ON helper_professions(profession_id);

-- Step 5: Create index for querying professions by helper
CREATE INDEX IF NOT EXISTS idx_helper_professions_helper_id
  ON helper_professions(helper_id);

-- Step 6: Migrate existing profession data (if profession column exists in helpers table)
-- This migrates single profession to the new many-to-many structure
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'helpers' AND column_name = 'profession'
  ) THEN
    -- Migrate existing professions to junction table
    INSERT INTO helper_professions (helper_id, profession_id)
    SELECT
      h.id,
      p.id
    FROM helpers h
    INNER JOIN professions p ON h.profession = p.name
    WHERE h.profession IS NOT NULL
    ON CONFLICT DO NOTHING;

    -- Drop the old profession column
    ALTER TABLE helpers DROP COLUMN profession;
  END IF;
END $$;

-- Step 7: Add updated_at trigger for professions table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professions_updated_at
  BEFORE UPDATE ON professions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
