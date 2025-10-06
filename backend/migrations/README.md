# Database Migrations

## How to run migrations

### Using Supabase CLI
```bash
supabase db push
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL

## Migration Files

### 001_create_professions_tables.sql
Creates the normalized structure for multiple professions per helper:
- `professions` table: Reference table with all valid professions
- `helper_professions` table: Junction table for many-to-many relationship
- Migrates existing `helpers.profession` data to new structure
- Drops old `profession` column

**Safe to run multiple times** - Uses `IF NOT EXISTS` and `ON CONFLICT` clauses.
