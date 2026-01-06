-- Update generated_content table for AI-powered content generation
-- Adds fields needed for full content generation workflow

-- Add new columns
ALTER TABLE generated_content
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS suggested_keywords TEXT[],
ADD COLUMN IF NOT EXISTS estimated_reading_time INT;

-- Update content_type enum to include more types
ALTER TABLE generated_content DROP CONSTRAINT IF EXISTS generated_content_content_type_check;
ALTER TABLE generated_content ADD CONSTRAINT generated_content_content_type_check
  CHECK (content_type IN ('blog_post', 'landing_page', 'product_description', 'blog', 'meta-description', 'social'));

-- Update status enum to include approval workflow
ALTER TABLE generated_content DROP CONSTRAINT IF EXISTS generated_content_status_check;
ALTER TABLE generated_content ADD CONSTRAINT generated_content_status_check
  CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected'));

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);

-- Comments for documentation
COMMENT ON COLUMN generated_content.meta_description IS 'SEO meta description for the content';
COMMENT ON COLUMN generated_content.suggested_keywords IS 'Array of related keywords suggested by AI';
COMMENT ON COLUMN generated_content.estimated_reading_time IS 'Estimated reading time in minutes';
