-- WAECPrep Supabase Schema
-- Run this in Supabase SQL Editor

-- Questions table (mirror of local SQLite)
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    local_id INTEGER,
    source TEXT NOT NULL,
    subject TEXT NOT NULL,
    year INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    answer TEXT,
    section TEXT,
    topic TEXT,
    topic_cluster INTEGER DEFAULT -1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_subject_year ON questions(subject, year);
CREATE INDEX IF NOT EXISTS idx_questions_topic_cluster ON questions(topic_cluster);

-- Predictions table (pre-computed ML results)
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    year INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    topic TEXT NOT NULL,
    topic_cluster INTEGER,
    probability FLOAT NOT NULL,
    computed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_subject_year ON predictions(subject, year);

-- User progress table (tracks each user's scores)
CREATE TABLE IF NOT EXISTS user_progress (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    year INTEGER,
    score INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    session_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_device ON user_progress(device_id);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for questions and predictions
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read predictions" ON predictions FOR SELECT USING (true);

-- Users can only write/read their own progress
CREATE POLICY "Users manage own progress" ON user_progress
    USING (device_id = current_setting('app.device_id', true));

-- Service role can write everything (for our sync script)
CREATE POLICY "Service write questions" ON questions FOR INSERT
    WITH CHECK (true);
CREATE POLICY "Service write predictions" ON predictions FOR INSERT
    WITH CHECK (true);
CREATE POLICY "Service write progress" ON user_progress FOR INSERT
    WITH CHECK (true);
