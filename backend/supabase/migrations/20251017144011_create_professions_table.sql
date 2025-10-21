CREATE TABLE public.professions (
  id smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.helper_professions (
    helper_id uuid NOT NULL REFERENCES public.helpers(id) ON DELETE CASCADE,
    profession_id smallint NOT NULL REFERENCES public.professions(id) ON DELETE RESTRICT,

    rpps_id char(11) CHECK (rpps_id IS NULL OR rpps_id ~ '^\d{11}$'),
    adeli_id char(9) CHECK (adeli_id IS NULL OR adeli_id ~ '^\d{9}$'),

    CONSTRAINT check_exactly_one_health_id
        CHECK ((rpps_id IS NOT NULL AND adeli_id IS NULL)
            OR (rpps_id IS NULL AND adeli_id IS NOT NULL)),

    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (helper_id, profession_id)
);

CREATE INDEX idx_helper_professions_helper ON public.helper_professions(helper_id);
CREATE INDEX idx_helper_professions_profession ON public.helper_professions(profession_id);
CREATE INDEX idx_helper_professions_rpps ON public.helper_professions(rpps_id) WHERE rpps_id IS NOT NULL;
CREATE INDEX idx_helper_professions_adeli ON public.helper_professions(adeli_id) WHERE adeli_id IS NOT NULL;