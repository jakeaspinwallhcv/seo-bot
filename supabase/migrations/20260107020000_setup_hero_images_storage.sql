-- Create storage bucket for hero images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view hero images (public bucket)
CREATE POLICY "Hero images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Policy: Authenticated users can upload hero images
CREATE POLICY "Authenticated users can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own hero images
CREATE POLICY "Users can update their own hero images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can delete their own hero images
CREATE POLICY "Users can delete their own hero images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-images'
  AND auth.role() = 'authenticated'
);

COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';
COMMENT ON POLICY "Hero images are publicly accessible" ON storage.objects IS 'Allow public read access to hero images';
