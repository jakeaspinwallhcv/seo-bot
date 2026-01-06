# Database Migrations

This file contains instructions for running database migrations on Supabase.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for Development)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Click on **SQL Editor** in the left sidebar
3. Click **New query** button
4. Copy the SQL from the migration file you need to run
5. Paste it into the SQL editor
6. Click **Run** button

### Option 2: Supabase CLI (For Production/CI)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run all pending migrations
supabase db push
```

---

## Available Migrations

### 1. Initial Schema (20260105000000_initial_schema.sql)

**Status**: Should already be run from Days 3-5

Creates the core database tables:
- profiles
- projects
- keywords
- rank_checks
- ai_search_checks
- generated_content
- usage_tracking

**File**: `supabase/migrations/20260105000000_initial_schema.sql`

---

### 2. SERP Features (20260105010000_add_serp_features.sql)

**Status**: ⚠️ **NEEDS TO BE RUN** (Added in Days 14-17)

Adds columns to `rank_checks` table for tracking:
- `url` - The URL that ranked
- `title` - The page title
- `serp_features` - JSON object with SERP feature flags

**File**: `supabase/migrations/20260105010000_add_serp_features.sql`

**SQL to run**:
```sql
-- Add SERP features to rank_checks table
ALTER TABLE rank_checks
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS serp_features JSONB DEFAULT '{
  "featured_snippet": false,
  "people_also_ask": false,
  "local_pack": false,
  "knowledge_graph": false,
  "image_pack": false,
  "video_pack": false
}'::jsonb;

-- Add index on serp_features for faster queries
CREATE INDEX IF NOT EXISTS idx_rank_checks_serp_features
ON rank_checks USING gin(serp_features);

-- Add comments
COMMENT ON COLUMN rank_checks.url IS 'The URL that ranked for this keyword';
COMMENT ON COLUMN rank_checks.title IS 'The title of the page that ranked';
COMMENT ON COLUMN rank_checks.serp_features IS 'SERP features present in the search results';
```

---

## Migration Checklist

After running a migration, verify it worked:

1. **Check columns exist**:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'rank_checks';
   ```

2. **Test inserting data**:
   ```sql
   -- Should work without errors
   INSERT INTO rank_checks (
     keyword_id,
     rank,
     url,
     title,
     serp_features,
     checked_at
   ) VALUES (
     'YOUR_KEYWORD_ID',
     5,
     'https://example.com',
     'Example Page',
     '{"featured_snippet": true}'::jsonb,
     NOW()
   );
   ```

3. **Test the app**: Try checking a keyword rank - it should work without database errors

---

## Troubleshooting

**Error: "column already exists"**
- This is normal if you run the migration twice
- The `ADD COLUMN IF NOT EXISTS` prevents errors
- You can safely ignore this

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Check that your database user has ALTER TABLE permissions

**Error: "relation does not exist"**
- Make sure the initial schema migration ran first
- Check that the `rank_checks` table exists

**Still having issues?**
- Check Supabase logs in Dashboard → Database → Logs
- Verify RLS policies aren't blocking the insert
- Try running migrations one at a time
