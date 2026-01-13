-- Add crawler exclusion patterns table and crawler settings
-- This migration adds support for configurable URL exclusion patterns per project
-- and sitemap-based crawling

-- Create crawler_exclusion_patterns table
CREATE TABLE IF NOT EXISTS crawler_exclusion_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_project_pattern UNIQUE(project_id, pattern)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exclusion_patterns_project_id ON crawler_exclusion_patterns(project_id);
CREATE INDEX IF NOT EXISTS idx_exclusion_patterns_active ON crawler_exclusion_patterns(project_id, is_active) WHERE is_active = true;

-- Add crawler_settings column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS crawler_settings JSONB DEFAULT jsonb_build_object(
  'max_pages', 50,
  'timeout_ms', 30000,
  'rate_limit_ms', 1000,
  'respect_robots_txt', true,
  'follow_nofollow_links', false,
  'crawl_strategy', 'breadth_first'
);

-- Enable RLS on crawler_exclusion_patterns
ALTER TABLE crawler_exclusion_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view exclusion patterns for their own projects
CREATE POLICY "Users can view exclusion patterns for own projects"
  ON crawler_exclusion_patterns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = crawler_exclusion_patterns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert exclusion patterns for their own projects
CREATE POLICY "Users can insert exclusion patterns for own projects"
  ON crawler_exclusion_patterns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = crawler_exclusion_patterns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update exclusion patterns for their own projects
CREATE POLICY "Users can update exclusion patterns for own projects"
  ON crawler_exclusion_patterns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = crawler_exclusion_patterns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete exclusion patterns for their own projects
-- (but only non-default patterns - enforced at application level)
CREATE POLICY "Users can delete exclusion patterns for own projects"
  ON crawler_exclusion_patterns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = crawler_exclusion_patterns.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Seed default exclusion patterns for all existing projects
-- These patterns cover common URLs that should be excluded from SEO crawling
INSERT INTO crawler_exclusion_patterns (project_id, pattern, is_default, is_active)
SELECT
  p.id,
  pattern_value.pattern,
  true,
  true
FROM projects p
CROSS JOIN (
  VALUES
    -- Admin and authentication pages
    ('*/admin/*'),
    ('*/wp-admin/*'),
    ('*/login*'),
    ('*/signin*'),
    ('*/signup*'),
    ('*/logout*'),
    ('*/register*'),

    -- Static assets
    ('*.pdf'),
    ('*.jpg'),
    ('*.jpeg'),
    ('*.png'),
    ('*.gif'),
    ('*.svg'),
    ('*.ico'),
    ('*.css'),
    ('*.js'),
    ('*.woff*'),
    ('*.ttf'),
    ('*.eot'),
    ('*.otf'),
    ('*.zip'),
    ('*.tar'),
    ('*.gz'),

    -- Error pages
    ('/404'),
    ('*/404*'),
    ('/403'),
    ('*/403*'),
    ('/500'),
    ('*/500*'),

    -- Legal and utility pages
    ('/dmca-notice'),
    ('*/dmca*'),
    ('/privacy-policy'),
    ('/terms-of-service'),
    ('/sitemap.xml'),
    ('/robots.txt'),

    -- Dynamic content that shouldn't be indexed
    ('*/listings/*'),
    ('*/listing/*'),
    ('*/search*'),
    ('*/category/*'),
    ('*/tag/*'),
    ('*/archive/*'),
    ('*/feed*'),
    ('*/rss*'),
    ('*/api/*'),
    ('*/ajax/*'),
    ('/home-search/*'),

    -- WordPress specific
    ('*/wp-content/*'),
    ('*/wp-includes/*'),
    ('*/wp-json/*'),

    -- Common query parameters to exclude
    ('*?print=*'),
    ('*?share=*'),
    ('*?replytocom=*')
) AS pattern_value(pattern)
ON CONFLICT (project_id, pattern) DO NOTHING;

-- Add comment explaining the table
COMMENT ON TABLE crawler_exclusion_patterns IS 'URL exclusion patterns for website crawler. Supports wildcard matching with * (any characters) and ? (single character). Default patterns are automatically created for all projects.';

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crawler_exclusion_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_crawler_exclusion_patterns_updated_at
  BEFORE UPDATE ON crawler_exclusion_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_crawler_exclusion_patterns_updated_at();
