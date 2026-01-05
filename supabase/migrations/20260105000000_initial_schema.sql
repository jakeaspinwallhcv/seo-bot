-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- PROFILES TABLE
-- ======================
-- Extends Supabase auth.users with additional user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'agency')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ======================
-- PROJECTS TABLE
-- ======================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- KEYWORDS TABLE
-- ======================
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  target_url TEXT,
  search_volume INT,
  difficulty_score INT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, keyword)
);

-- RLS policies for keywords
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view keywords in own projects"
  ON keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert keywords in own projects"
  ON keywords FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update keywords in own projects"
  ON keywords FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete keywords in own projects"
  ON keywords FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = keywords.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ======================
-- RANK CHECKS TABLE
-- ======================
CREATE TABLE rank_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  rank INT,
  url TEXT,
  serp_features JSONB,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_rank_checks_keyword_id ON rank_checks(keyword_id);
CREATE INDEX idx_rank_checks_checked_at ON rank_checks(checked_at DESC);

-- RLS policies for rank_checks
ALTER TABLE rank_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rank checks for own keywords"
  ON rank_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM keywords
      JOIN projects ON projects.id = keywords.project_id
      WHERE keywords.id = rank_checks.keyword_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rank checks for own keywords"
  ON rank_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM keywords
      JOIN projects ON projects.id = keywords.project_id
      WHERE keywords.id = rank_checks.keyword_id
      AND projects.user_id = auth.uid()
    )
  );

-- ======================
-- AI SEARCH CHECKS TABLE
-- ======================
CREATE TABLE ai_search_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('claude', 'chatgpt', 'perplexity', 'gemini')),
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  is_cited BOOLEAN DEFAULT false,
  cited_url TEXT,
  position INT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_ai_search_checks_project_id ON ai_search_checks(project_id);
CREATE INDEX idx_ai_search_checks_keyword_id ON ai_search_checks(keyword_id);
CREATE INDEX idx_ai_search_checks_checked_at ON ai_search_checks(checked_at DESC);

-- RLS policies for ai_search_checks
ALTER TABLE ai_search_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI checks for own projects"
  ON ai_search_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_search_checks.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert AI checks for own projects"
  ON ai_search_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_search_checks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ======================
-- GENERATED CONTENT TABLE
-- ======================
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
  content_type TEXT DEFAULT 'blog' CHECK (content_type IN ('blog', 'meta-description', 'social')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  seo_score INT,
  word_count INT,
  readability_score FLOAT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_generated_content_project_id ON generated_content(project_id);
CREATE INDEX idx_generated_content_created_at ON generated_content(created_at DESC);

-- RLS policies for generated_content
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content for own projects"
  ON generated_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content for own projects"
  ON generated_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update content for own projects"
  ON generated_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content for own projects"
  ON generated_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generated_content.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ======================
-- USAGE TRACKING TABLE
-- ======================
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('ai_check', 'content_generation', 'rank_check')),
  count INT DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, period_start)
);

-- RLS policies for usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- ======================
-- FUNCTIONS & TRIGGERS
-- ======================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
