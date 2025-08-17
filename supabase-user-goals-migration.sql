-- Migration to add user authentication to goals
-- Run this in your Supabase SQL editor

-- Step 1: Add user_id column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index on user_id for performance
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);

-- Step 3: Enable Row Level Security (RLS) on goals table
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies

-- Policy: Users can only see their own goals
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert goals for themselves
CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own goals
CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own goals
CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Allow anonymous users to create and manage goals (for guest mode)
-- This policy allows goals with NULL user_id to be managed by anyone
CREATE POLICY "Anonymous users can manage anonymous goals" ON goals
    FOR ALL USING (user_id IS NULL);

-- Note: Existing goals without user_id will remain accessible to all users
-- You may want to either:
-- 1. Delete existing test data: DELETE FROM goals WHERE user_id IS NULL;
-- 2. Or assign them to a specific user: UPDATE goals SET user_id = 'USER_UUID' WHERE user_id IS NULL;