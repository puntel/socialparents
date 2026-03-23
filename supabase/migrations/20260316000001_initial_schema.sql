-- ==============================
-- Social Parents - Initial Schema
-- ==============================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";åç

-- ========================
-- TABLE: categories
-- ========================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label       TEXT NOT NULL UNIQUE,
  color_class TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- TABLE: subcategories
-- ========================
CREATE TABLE IF NOT EXISTS subcategories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- TABLE: profiles
-- (Extends Supabase auth.users)
-- ========================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'Membro da Rede', -- Ex: "Mãe do Léo", "Pai da Sofia"
  bio        TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  is_admin   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- TABLE: posts
-- ========================
CREATE TABLE IF NOT EXISTS posts (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name    TEXT NOT NULL,  -- Denormalized for anonymous posts
  author_role    TEXT NOT NULL,  -- Denormalized for display
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name  TEXT NOT NULL,  -- Denormalized for performance
  color_class    TEXT NOT NULL,  -- Denormalized for performance
  content        TEXT NOT NULL,
  tags           TEXT[] DEFAULT '{}',
  is_sensitive   BOOLEAN NOT NULL DEFAULT false,
  comment_count  INTEGER NOT NULL DEFAULT 0,
  save_count     INTEGER NOT NULL DEFAULT 0,
  support_count  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- ROW LEVEL SECURITY (RLS)
-- ========================

ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts        ENABLE ROW LEVEL SECURITY;

-- categories: anyone can read; only admins can write
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- subcategories: anyone can read; only admins can write
CREATE POLICY "Public read subcategories"
  ON subcategories FOR SELECT USING (true);

CREATE POLICY "Admins manage subcategories"
  ON subcategories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- profiles: users can read all profiles; can only update their own
CREATE POLICY "Public read profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- posts: anyone can read; authenticated users can create; authors can update/delete their own
CREATE POLICY "Public read posts"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- ========================
-- INDEXES
-- ========================
CREATE INDEX IF NOT EXISTS idx_posts_category     ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at   ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subcategories_cat  ON subcategories(category_id);

-- ========================
-- TRIGGER: Auto-create profile on signup
-- ========================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Membro da Rede')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
