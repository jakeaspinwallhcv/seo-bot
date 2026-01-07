-- Add hero_image_url column to generated_content table
ALTER TABLE generated_content
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN generated_content.hero_image_url IS 'URL to DALL-E 3 generated hero image for the content';
