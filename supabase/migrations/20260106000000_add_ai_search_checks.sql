-- Add AI Search Checks table
-- This table stores the results of checking if a domain appears in AI chatbot responses

CREATE TABLE IF NOT EXISTS ai_search_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('claude', 'chatgpt', 'perplexity', 'gemini')),
  query TEXT NOT NULL,
  is_cited BOOLEAN NOT NULL DEFAULT false,
  response_text TEXT NOT NULL,
  citation_context TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_search_checks_keyword_id ON ai_search_checks(keyword_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_checks_project_id ON ai_search_checks(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_checks_checked_at ON ai_search_checks(checked_at DESC);

-- Add RLS policies
ALTER TABLE ai_search_checks ENABLE ROW LEVEL SECURITY;

-- Users can view AI search checks for their own projects
CREATE POLICY "Users can view their own AI search checks"
  ON ai_search_checks
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can insert AI search checks for their own projects
CREATE POLICY "Users can insert AI search checks for their own projects"
  ON ai_search_checks
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Users can delete AI search checks for their own projects
CREATE POLICY "Users can delete their own AI search checks"
  ON ai_search_checks
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
