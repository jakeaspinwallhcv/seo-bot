# Debug Analysis - Why No Pages Are Showing

## Current Situation

Your sitemap has 69 URLs:
- 17 static pages (home, contact, about, etc.)
- 46 blog pages
- 6 neighborhood pages
- 0 property listings (good - excluded as intended)

But **0 pages are being crawled**. Even non-listing pages aren't showing up.

## Step 1: Set Up Service Role Key (Required First)

Without this, crawled pages can't be saved to the database.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API
2. Copy the **service_role** key (starts with `eyJ...`)
3. Update `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY
```
4. Restart dev server: `npm run dev`

## Step 2: Run Analysis with Debug Logging

I've added detailed logging to show exactly which URLs are being excluded and why.

1. Go to http://localhost:3000/analysis
2. Click "Start Analysis"
3. Watch the terminal output

You should now see logs like:
```
✅ Crawling: https://jakeaspinwall.com/
✅ Crawling: https://jakeaspinwall.com/about
✅ Crawling: https://jakeaspinwall.com/blog/post-name
❌ Excluded by pattern "*/listings/*": https://jakeaspinwall.com/listings/property-123
```

## Step 3: Identify Problematic Patterns

Look for patterns that are blocking legitimate pages (not listings):
- If you see `❌ Excluded by pattern "*/blog/*"` - that's a problem
- If you see `❌ Excluded by pattern "*/listings/*"` - that's correct (working as intended)

## Step 4: Disable Specific Patterns

Once we identify which patterns are blocking your non-listing pages, you can disable them via SQL:

```sql
-- Example: Disable a specific pattern
UPDATE crawler_exclusion_patterns
SET is_active = false
WHERE pattern = '*/the-problematic-pattern/*';
```

Or create a script to disable multiple patterns at once.

## Common Patterns That Might Be Blocking Content

Check if any of these are matching your URLs:
- `*/category/*` - might block blog categories
- `*/tag/*` - might block blog tags
- `*/archive/*` - might block blog archives
- `*/search*` - might block search pages
- `*.pdf` - blocks PDFs (probably fine)
- `*.jpg`, `*.png`, etc. - blocks images (probably fine)

## Expected Outcome

After fixing:
```
Starting analysis for jakeaspinwall.com
Loaded 52 exclusion patterns
Discovering URLs...
Using sitemap_index.xml with 69 URLs
Starting crawl with BFS strategy...
✅ Crawling: https://jakeaspinwall.com/
✅ Crawling: https://jakeaspinwall.com/about
✅ Crawling: https://jakeaspinwall.com/blog/some-post
❌ Excluded by pattern "*/listings/*": https://jakeaspinwall.com/listings/property
...
Crawl complete: 23 pages, 0 failures (46 excluded)
Analysis completed - 23 pages, 89 issues
```

---

**Next Steps:**
1. Set up service role key
2. Run analysis and share the terminal output with me
3. I'll help identify which patterns to disable
