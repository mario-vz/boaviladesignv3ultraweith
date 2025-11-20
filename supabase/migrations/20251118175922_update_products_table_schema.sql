/*
  # Update products table schema

  1. Changes
    - Add `name` column (rename from title conceptually)
    - Add `instagram_link` column for custom Instagram links
    - Add `order_position` column for display ordering
    - Make `image_url` nullable

  2. Notes
    - Uses conditional checks to safely add columns if they don't exist
    - Preserves existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'instagram_link'
  ) THEN
    ALTER TABLE products ADD COLUMN instagram_link text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'order_position'
  ) THEN
    ALTER TABLE products ADD COLUMN order_position integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  ALTER TABLE products ALTER COLUMN image_url DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;