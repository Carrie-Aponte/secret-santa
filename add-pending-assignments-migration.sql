-- Migration to add pending_assignments column to app_states table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE app_states 
ADD COLUMN IF NOT EXISTS pending_assignments JSONB DEFAULT '{}';