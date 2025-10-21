INSERT INTO public.professions (name) VALUES
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

