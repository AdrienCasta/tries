CREATE TABLE public.helpers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date,
  
  birth_country_code char(2),
  birth_city text,
  
  residence_country_code char(2),
  residence_city text,
  residence_zip_code text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX idx_helper_last_name ON public.helpers (last_name);