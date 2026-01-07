# Storage Bucket Setup for Hero Images

The storage bucket for hero images needs to be created through the Supabase Dashboard (not SQL) due to permissions.

## Setup Steps

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Click "Storage" in the left sidebar
   - Click "New Bucket"
   - Fill in the details:
     - **Name**: `hero-images`
     - **Public bucket**: ✅ **CHECKED** (images need to be publicly accessible)
     - **File size limit**: `5 MB` (5242880 bytes)
     - **Allowed MIME types**:
       - `image/png`
       - `image/jpeg`
       - `image/jpg`
       - `image/webp`
   - Click "Create Bucket"

3. **Configure Policies (Optional - Default Policies Should Work)**

   The bucket should work with default policies, but if you need custom policies:

   - Click on the `hero-images` bucket
   - Go to "Policies" tab
   - Ensure these policies exist:
     - **SELECT (Read)**: Public access to all files
     - **INSERT (Upload)**: Authenticated users only
     - **UPDATE**: Authenticated users only
     - **DELETE**: Authenticated users only

## Verify Setup

Once created, the bucket should be accessible at:
```
https://[your-project-ref].supabase.co/storage/v1/object/public/hero-images/
```

## Testing

You can test the setup by generating content with a hero image. The system will:
1. Generate image with DALL-E 3
2. Download the image
3. Upload to `hero-images` bucket
4. Return permanent public URL

Check the browser console for logs:
- ✅ "Image uploaded to Supabase Storage: [URL]" - Success
- ❌ "Failed to upload to Supabase Storage" - Check bucket permissions

## Troubleshooting

**Error: "Failed to upload to Supabase Storage"**
- Verify bucket name is exactly `hero-images`
- Verify bucket is marked as "Public"
- Check that authenticated users have INSERT permission
- Verify MIME types include `image/png`

**Images not loading**
- Verify bucket is public
- Check the public URL format
- Ensure no CORS issues (bucket should allow public access)
