-- Optimize RLS policies for better performance at scale
-- Issue: auth.uid() is re-evaluated for each row, causing O(n) calls
-- Solution: Wrap auth.uid() with (select auth.uid()) for O(1) evaluation per query
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ======================
-- PROFILES TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = (select auth.uid()));

-- ======================
-- PROJECTS TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = (select auth.uid()));

-- ======================
-- KEYWORDS TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view keywords in own projects" ON keywords;
CREATE POLICY "Users can view keywords in own projects"
  ON keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert keywords in own projects" ON keywords;
CREATE POLICY "Users can insert keywords in own projects"
  ON keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update keywords in own projects" ON keywords;
CREATE POLICY "Users can update keywords in own projects"
  ON keywords FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete keywords in own projects" ON keywords;
CREATE POLICY "Users can delete keywords in own projects"
  ON keywords FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- RANK_CHECKS TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view rank checks for own keywords" ON rank_checks;
CREATE POLICY "Users can view rank checks for own keywords"
  ON rank_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM keywords
      JOIN projects ON projects.id = keywords.project_id
      WHERE keywords.id = rank_checks.keyword_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert rank checks for own keywords" ON rank_checks;
CREATE POLICY "Users can insert rank checks for own keywords"
  ON rank_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM keywords
      JOIN projects ON projects.id = keywords.project_id
      WHERE keywords.id = rank_checks.keyword_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- AI_SEARCH_CHECKS TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view AI checks for own projects" ON ai_search_checks;
DROP POLICY IF EXISTS "Users can view their own AI search checks" ON ai_search_checks;
CREATE POLICY "Users can view their own AI search checks"
  ON ai_search_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_search_checks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert AI checks for own projects" ON ai_search_checks;
DROP POLICY IF EXISTS "Users can insert AI search checks for their own projects" ON ai_search_checks;
CREATE POLICY "Users can insert AI search checks for their own projects"
  ON ai_search_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_search_checks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own AI search checks" ON ai_search_checks;
CREATE POLICY "Users can delete their own AI search checks"
  ON ai_search_checks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_search_checks.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- GENERATED_CONTENT TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view content for own projects" ON generated_content;
CREATE POLICY "Users can view content for own projects"
  ON generated_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert content for own projects" ON generated_content;
CREATE POLICY "Users can insert content for own projects"
  ON generated_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update content for own projects" ON generated_content;
CREATE POLICY "Users can update content for own projects"
  ON generated_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete content for own projects" ON generated_content;
CREATE POLICY "Users can delete content for own projects"
  ON generated_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- USAGE_TRACKING TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own usage" ON usage_tracking;
CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own usage" ON usage_tracking;
CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (user_id = (select auth.uid()));

-- ======================
-- WEBSITE_ANALYSES TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view analyses for own projects" ON website_analyses;
CREATE POLICY "Users can view analyses for own projects"
  ON website_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = website_analyses.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert analyses for own projects" ON website_analyses;
CREATE POLICY "Users can insert analyses for own projects"
  ON website_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = website_analyses.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update analyses for own projects" ON website_analyses;
CREATE POLICY "Users can update analyses for own projects"
  ON website_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = website_analyses.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- CRAWLED_PAGES TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view pages for own analyses" ON crawled_pages;
CREATE POLICY "Users can view pages for own analyses"
  ON crawled_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = crawled_pages.analysis_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert pages for own analyses" ON crawled_pages;
CREATE POLICY "Users can insert pages for own analyses"
  ON crawled_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = crawled_pages.analysis_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- SEO_ISSUES TABLE
-- ======================

DROP POLICY IF EXISTS "Users can view issues for own analyses" ON seo_issues;
CREATE POLICY "Users can view issues for own analyses"
  ON seo_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = seo_issues.analysis_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert issues for own analyses" ON seo_issues;
CREATE POLICY "Users can insert issues for own analyses"
  ON seo_issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM website_analyses
      JOIN projects ON projects.id = website_analyses.project_id
      WHERE website_analyses.id = seo_issues.analysis_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- ======================
-- PERFORMANCE INDEXES
-- ======================
-- Add missing indexes on foreign keys for better join performance

-- Index for projects.user_id (joins with profiles)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Index for generated_content.keyword_id (joins with keywords)
CREATE INDEX IF NOT EXISTS idx_generated_content_keyword_id ON generated_content(keyword_id);

-- ======================
-- COMMENTS
-- ======================

COMMENT ON POLICY "Users can view own profile" ON profiles IS
'Optimized RLS: auth.uid() wrapped in subselect for O(1) evaluation per query';

COMMENT ON POLICY "Users can view own projects" ON projects IS
'Optimized RLS: auth.uid() wrapped in subselect for O(1) evaluation per query';

COMMENT ON INDEX idx_projects_user_id IS
'Index for foreign key joins with profiles table';

COMMENT ON INDEX idx_generated_content_keyword_id IS
'Index for foreign key joins with keywords table';

-- Note: Some indexes may show as "unused" in Supabase linter immediately after creation
-- This is expected for new features. They will be used as the application scales.
-- Indexes showing as unused:
-- - idx_rank_checks_checked_at (used for time-series queries)
-- - idx_generated_content_created_at (used for sorting content by date)
-- - idx_rank_checks_serp_features (used for SERP feature analysis)
-- - idx_generated_content_status (used for filtering by content status)
-- - idx_website_analyses_created_at (used for analysis history)
-- - idx_website_analyses_status (used for filtering in-progress analyses)
-- - idx_crawled_pages_analysis_id (used for page lookups by analysis)
-- - idx_crawled_pages_url (used for URL deduplication)
-- - idx_seo_issues_* (used for issue filtering and grouping)
