-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SOIL ANALYSES
CREATE TABLE IF NOT EXISTS soil_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  health_score INTEGER,
  nitrogen TEXT,
  phosphorus TEXT,
  potassium TEXT,
  ph TEXT,
  organic_matter TEXT,
  moisture TEXT,
  soil_texture TEXT,
  erosion_risk TEXT,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LAND ASSESSMENTS
CREATE TABLE IF NOT EXISTS land_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  land_size DECIMAL,
  soil_type TEXT,
  degradation_level TEXT,
  water_access TEXT,
  soil_health_score INTEGER,
  tree_recommendations JSONB,
  action_plan JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- FINANCIAL RECORDS
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')),
  amount DECIMAL,
  category TEXT,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT,
  status TEXT,
  invited_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SATELLITE DATA
CREATE TABLE IF NOT EXISTS satellite_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  ndvi_value DECIMAL,
  acquisition_date DATE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE soil_analyses ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (optional safety)
DROP POLICY IF EXISTS "Users can view own data" ON soil_analyses;
DROP POLICY IF EXISTS "Users can insert own data" ON soil_analyses;

-- Create new policies cleanly
CREATE POLICY "Users can view own data"
ON soil_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
ON soil_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);
