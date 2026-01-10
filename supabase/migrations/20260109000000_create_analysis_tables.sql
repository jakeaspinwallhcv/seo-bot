-- ======================
-- WEBSITE ANALYSES TABLE
-- ======================
-- Stores overall SEO analysis results for projects
CREATE TABLE website_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Overall scores (0-100)
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  technical_score INT CHECK (technical_score >= 0 AND technical_score <= 100),
  content_score INT CHECK (content_score >= 0 AND content_score <= 100),
  mobile_score INT CHECK (mobile_score >= 0 AND mobile_score <= 100),
  ai_chatbot_score INT CHECK (ai_chatbot_score >= 0 AND ai_chatbot_score <= 100),

  -- Metadata
  pages_crawled INT DEFAULT 0,
  total_issues INT DEFAULT 0,
  critical_issues INT DEFAULT 0,
  warnings INT DEFAULT 0,

  -- Analysis status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_website_analyses_project_id ON website_analyses(project_id);
CREATE INDEX idx_website_analyses_created_at ON website_analyses(created_at DESC);
CREATE INDEX idx_website_analyses_status ON website_analyses(status);

-- RLS policies
ALTER TABLE website_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses for own projects"
  ON website_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = website_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses for own projects"
  ON website_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = website_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analyses for own projects"
  ON website_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = website_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ======================
-- CRAWLED PAGES TABLE
-- ======================
-- Stores individual page data from website crawl
CREATE TABLE crawled_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,

  -- Page metadata
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  canonical_url TEXT,

  -- Content metrics
  word_count INT,
  readability_score FLOAT,

  -- Technical metrics
  status_code INT,
  load_time_ms INT,
  page_size_kb INT,

  -- SEO elements
  has_robots_meta BOOLEAN DEFAULT false,
  is_indexable BOOLEAN DEFAULT true,
  has_og_tags BOOLEAN DEFAULT false,
  has_twitter_cards BOOLEAN DEFAULT false,
  has_schema_markup BOOLEAN DEFAULT false,

  -- Images
  total_images INT DEFAULT 0,
  images_without_alt INT DEFAULT 0,

  -- Links
  internal_links INT DEFAULT 0,
  external_links INT DEFAULT 0,
  broken_links INT DEFAULT 0,

  -- Timestamps
  crawled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crawled_pages_analysis_id ON crawled_pages(analysis_id);
CREATE INDEX idx_crawled_pages_url ON crawled_pages(url);

-- RLS policies
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pages for own analyses"
  ON crawled_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = crawled_pages.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pages for own analyses"
  ON crawled_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = crawled_pages.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

-- ======================
-- SEO ISSUES TABLE
-- ======================
-- Stores identified SEO issues from analysis
CREATE TABLE seo_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,
  page_id UUID REFERENCES crawled_pages(id) ON DELETE CASCADE,

  -- Issue details
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  category TEXT NOT NULL CHECK (category IN ('technical', 'content', 'mobile', 'ai_chatbot')),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,

  -- Page context (if issue is page-specific)
  page_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_seo_issues_analysis_id ON seo_issues(analysis_id);
CREATE INDEX idx_seo_issues_page_id ON seo_issues(page_id);
CREATE INDEX idx_seo_issues_severity ON seo_issues(severity);
CREATE INDEX idx_seo_issues_category ON seo_issues(category);

-- RLS policies
ALTER TABLE seo_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view issues for own analyses"
  ON seo_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = seo_issues.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert issues for own analyses"
  ON seo_issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = seo_issues.analysis_id
      AND projects.user_id = auth.uid()
    )
  );

-- Add updated_at trigger to website_analyses
CREATE TRIGGER update_website_analyses_updated_at BEFORE UPDATE ON website_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE website_analyses IS 'Stores SEO analysis results with scores and metadata';
COMMENT ON TABLE crawled_pages IS 'Individual pages crawled during website analysis';
COMMENT ON TABLE seo_issues IS 'SEO issues identified during analysis with recommendations';
