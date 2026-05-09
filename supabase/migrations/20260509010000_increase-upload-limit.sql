-- Increase bucket size limit from 5MB to 20MB and add HEIC support
UPDATE storage.buckets
SET
  file_size_limit = 20971520, -- 20MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
WHERE id = 'dish-images';
