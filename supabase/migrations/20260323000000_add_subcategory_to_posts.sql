-- Add subcategory support to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS subcategory_id   UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategory_name TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_subcategory ON posts(subcategory_id);
