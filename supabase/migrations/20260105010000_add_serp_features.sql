-- Add SERP features to rank_checks table
-- Migration: Add URL, title, and SERP features tracking

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

-- Add comment
COMMENT ON COLUMN rank_checks.url IS 'The URL that ranked for this keyword';
COMMENT ON COLUMN rank_checks.title IS 'The title of the page that ranked';
COMMENT ON COLUMN rank_checks.serp_features IS 'SERP features present in the search results';
