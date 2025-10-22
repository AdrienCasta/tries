-- Add residence_french_county_code column to store French area codes
ALTER TABLE public.helpers ADD COLUMN residence_french_county_code varchar(3);

-- Remove obsolete residence_city column (no longer needed in simplified model)
ALTER TABLE public.helpers DROP COLUMN residence_city;

-- Remove obsolete residence_zip_code column (was incorrectly used to store French area code)
ALTER TABLE public.helpers DROP COLUMN residence_zip_code;
