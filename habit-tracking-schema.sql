-- Extend goals table to support habit tracking
ALTER TABLE goals 
ADD COLUMN habit_type VARCHAR(20) DEFAULT 'one_time' CHECK (habit_type IN ('one_time', 'daily', 'weekly', 'monthly', 'custom'));

ALTER TABLE goals 
ADD COLUMN recurrence_pattern JSONB; -- For custom recurrence rules

ALTER TABLE goals 
ADD COLUMN calendar_event_id VARCHAR(255); -- Link to calendar event

ALTER TABLE goals 
ADD COLUMN auto_created_from_calendar BOOLEAN DEFAULT FALSE;

ALTER TABLE goals 
ADD COLUMN streak_count INTEGER DEFAULT 0;

ALTER TABLE goals 
ADD COLUMN last_completed_date DATE;

-- Create habit completions table for tracking daily completions
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  auto_completed BOOLEAN DEFAULT FALSE, -- If completed via calendar sync
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, completed_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS habit_completions_goal_date_idx ON habit_completions(goal_id, completed_date);
CREATE INDEX IF NOT EXISTS habit_completions_date_idx ON habit_completions(completed_date DESC);

-- Create calendar connections table
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_type VARCHAR(20) NOT NULL CHECK (calendar_type IN ('google', 'caldav', 'ics_upload')),
  calendar_id VARCHAR(255), -- External calendar ID
  access_token TEXT, -- Encrypted access token
  refresh_token TEXT, -- Encrypted refresh token
  last_sync_at TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar sync rules table
CREATE TABLE IF NOT EXISTS calendar_sync_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_connection_id UUID REFERENCES calendar_connections(id) ON DELETE CASCADE,
  keyword_pattern VARCHAR(255), -- Match events with these keywords
  category VARCHAR(100), -- Auto-assign category
  xp_value INTEGER DEFAULT 10,
  habit_type VARCHAR(20) DEFAULT 'daily',
  auto_create_habits BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update triggers for habit completions
CREATE OR REPLACE FUNCTION update_goal_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Update streak count when habit is completed
  IF TG_OP = 'INSERT' THEN
    UPDATE goals 
    SET 
      streak_count = COALESCE(streak_count, 0) + 1,
      last_completed_date = NEW.completed_date,
      updated_at = NOW()
    WHERE id = NEW.goal_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goal_streak_trigger
  AFTER INSERT ON habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_streak();

-- Function to calculate habit streaks
CREATE OR REPLACE FUNCTION calculate_habit_streak(goal_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_completion BOOLEAN;
BEGIN
  -- Start from today and count backwards
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM habit_completions 
      WHERE goal_id = goal_uuid 
      AND completed_date = check_date
    ) INTO has_completion;
    
    IF has_completion THEN
      current_streak := current_streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
    
    -- Prevent infinite loops
    IF current_streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$ language 'plpgsql';