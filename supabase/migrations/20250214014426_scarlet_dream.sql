/*
  # Fix storage configuration for event photos

  1. Storage Setup
    - Create event-photos bucket with proper configuration
    - Set file size limits and allowed MIME types
  
  2. Security
    - Grant necessary permissions to authenticated users
    - Enable RLS on storage.objects
    - Create storage policies with proper checks
*/

-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
  ) THEN
    DROP POLICY IF EXISTS "storage_objects_select_policy" ON storage.objects;
    DROP POLICY IF EXISTS "storage_objects_insert_policy" ON storage.objects;
    DROP POLICY IF EXISTS "storage_objects_update_policy" ON storage.objects;
    DROP POLICY IF EXISTS "storage_objects_delete_policy" ON storage.objects;
  END IF;
END $$;

-- Create or update the bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA storage TO authenticated;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "storage_objects_select_policy"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'event-photos');

CREATE POLICY "storage_objects_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-photos' AND
  (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "storage_objects_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-photos' AND
  (storage.foldername(name))[1] != 'private'
);

CREATE POLICY "storage_objects_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-photos' AND
  (storage.foldername(name))[1] != 'private'
);