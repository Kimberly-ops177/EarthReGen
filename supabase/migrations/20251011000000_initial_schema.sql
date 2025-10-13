-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  land_size DECIMAL,
  soil_type TEXT,
  degradation_level TEXT,
  water_access TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Soil analyses table
CREATE TABLE soil_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT,
  health_score INTEGER,
  nitrogen TEXT,
  phosphorus TEXT,
  potassium TEXT,
  ph_level TEXT,
  organic_matter TEXT,
  moisture TEXT,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NDVI readings table
CREATE TABLE ndvi_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  value DECIMAL(3,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carbon credits table
CREATE TABLE carbon_credits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  land_area DECIMAL,
  tons_sequestered DECIMAL,
  credit_value DECIMAL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial records table
CREATE TABLE financial_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Alerts table
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndvi_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Soil analyses policies
CREATE POLICY "Users can view soil analyses for their projects"
  ON soil_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = soil_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert soil analyses for their projects"
  ON soil_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = soil_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
-- (Add SELECT, INSERT, UPDATE policies for ndvi_readings, carbon_credits, financial_records, team_members, alerts)

-- Storage bucket for soil images
INSERT INTO storage.buckets (id, name, public)
VALUES ('soil-images', 'soil-images', true);

-- Storage policy
CREATE POLICY "Users can upload soil images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'soil-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view soil images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'soil-images');