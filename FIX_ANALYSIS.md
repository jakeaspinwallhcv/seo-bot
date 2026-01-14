# Fix Analysis Not Showing Pages

## The Problems

Your analysis isn't showing any pages due to TWO separate issues:

### Issue 1: Service Role Key Not Configured
The background task that saves crawled pages to the database needs a service role key.

**Why**: The Supabase client loses authentication when the API response returns. Background operations fail silently.

### Issue 2: Overly Aggressive Exclusion Patterns
The default crawler exclusion patterns include:
- `*/listings/*`
- `*/listing/*`

These patterns block ANY URL containing "listings" or "listing", which means your real estate listing pages (your main content!) are being excluded from the crawl.

**Result**: 69 URLs found in sitemap → 0 pages crawled (all blocked by patterns)

---

## The Fix

### Step 1: Get Your Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Find the **service_role** key (starts with `eyJ...`)
5. Copy it

### Step 2: Update .env.local

Replace the placeholder in `.env.local`:

```bash
# Before:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# After:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE
```

### Step 3: Disable Problematic Exclusion Patterns

Run the fix script:

```bash
node scripts/fix-exclusion-patterns.js
```

This will disable the `*/listings/*` and `*/listing/*` patterns that are blocking your content.

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Test It

1. Go to http://localhost:3000/analysis
2. Click **"Start Analysis"**
3. Wait 30-60 seconds (watch the terminal for progress logs)
4. Refresh the page
5. You should now see:
   - Status: "completed"
   - Pages listed in the table
   - Issues displayed with counts

---

## Expected Log Output

When it's working correctly, you should see logs like:

```
Starting analysis for jakeaspinwall.com
Loaded 50 exclusion patterns
Discovering URLs...
Using sitemap_index.xml with 69 URLs
Starting crawl with BFS strategy...
Crawled https://jakeaspinwall.com/ (1/50)
Crawled https://jakeaspinwall.com/about (2/50)
Crawled https://jakeaspinwall.com/listings/123-main-st (3/50)
...
Crawl complete: 50 pages, 0 failures
Analysis completed for jakeaspinwall.com - 50 pages, 127 issues
```

---

## What Each Fix Does

**Service Role Client** (`src/lib/supabase/service.ts`):
- Creates a persistent database connection with admin privileges
- Bypasses Row Level Security (RLS) for system operations
- Allows background tasks to write to database after API response returns

**Exclusion Pattern Script** (`scripts/fix-exclusion-patterns.js`):
- Disables default patterns that block listing pages
- Only affects patterns marked as `is_default: true`
- You can re-enable them later in the UI if needed

---

## Still Having Issues?

If you still don't see pages after following all steps:

1. Check the terminal logs for errors
2. Open browser DevTools console for client-side errors
3. Verify the service role key is correct (not the anon key)
4. Check that migrations were run in Supabase Dashboard
5. Try running a fresh analysis with a different domain

---

## Managing Exclusion Patterns Later

You can manage exclusion patterns through the API:

**List active patterns:**
```bash
curl "http://localhost:3000/api/exclusion-patterns?project_id=YOUR_PROJECT_ID"
```

**Disable a pattern:**
```bash
curl -X PATCH "http://localhost:3000/api/exclusion-patterns/PATTERN_ID" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

**Add a custom pattern:**
```bash
curl -X POST "http://localhost:3000/api/exclusion-patterns" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "YOUR_PROJECT_ID", "pattern": "*/admin/*"}'
```

---

**Note**: Keep the service role key secret! Never commit it to Git or expose it in client-side code.
