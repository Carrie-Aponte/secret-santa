-- Create the app_states table for storing secret santa data
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE app_states (
  id TEXT PRIMARY KEY,
  family_members TEXT[] NOT NULL,
  available_receivers TEXT[] NOT NULL,
  assignments JSONB DEFAULT '{}',
  completed_assignments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE app_states ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on app_states" ON app_states
FOR ALL USING (true);

-- Create an index for faster lookups
CREATE INDEX idx_app_states_id ON app_states(id);
