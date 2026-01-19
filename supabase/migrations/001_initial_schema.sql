-- That's Amore Pizzeria - Initial Supabase Schema
-- This migration creates all tables needed for restaurant management

-- 1. Restaurant Metrics Table (votes and pizzas sold)
CREATE TABLE IF NOT EXISTS restaurant_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ny_votes INTEGER DEFAULT 0 NOT NULL,
    chicago_votes INTEGER DEFAULT 0 NOT NULL,
    total_votes INTEGER DEFAULT 0 NOT NULL,
    pizzas_sold INTEGER DEFAULT 0 NOT NULL,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vote Records Table (individual votes for analytics)
CREATE TABLE IF NOT EXISTS vote_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    choice TEXT NOT NULL CHECK (choice IN ('ny', 'chicago')),
    session_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_id for duplicate prevention
CREATE INDEX IF NOT EXISTS idx_vote_records_session_id ON vote_records(session_id);

-- 3. Restaurant Hours Table
CREATE TABLE IF NOT EXISTS restaurant_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    header_text TEXT NOT NULL DEFAULT 'Mon-Fri: 11AM-10PM | Sat-Sun: 12PM-11PM',
    footer_text TEXT NOT NULL DEFAULT 'Open Daily | Mon-Fri: 11AM-10PM | Sat-Sun: 12PM-11PM',
    business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    holiday_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Restaurant Status Table
CREATE TABLE IF NOT EXISTS restaurant_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_closed BOOLEAN DEFAULT false NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Scheduled Closures Table
CREATE TABLE IF NOT EXISTS scheduled_closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    closure_date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on closure_date for efficient queries
CREATE INDEX IF NOT EXISTS idx_scheduled_closures_date ON scheduled_closures(closure_date);

-- Insert initial data
-- Restaurant Metrics (single row)
INSERT INTO restaurant_metrics (ny_votes, chicago_votes, total_votes, pizzas_sold)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Restaurant Hours (single row with default hours)
INSERT INTO restaurant_hours (header_text, footer_text, business_hours, holiday_hours)
VALUES (
    'Mon-Fri: 11AM-10PM | Sat-Sun: 12PM-11PM',
    'Open Daily | Mon-Fri: 11AM-10PM | Sat-Sun: 12PM-11PM',
    '{
        "0": {"day": "Sunday", "hours": "11:00 AM - 8:00 PM", "open": true},
        "1": {"day": "Monday", "hours": "Closed", "open": false},
        "2": {"day": "Tuesday", "hours": "11:00 AM - 8:00 PM", "open": true},
        "3": {"day": "Wednesday", "hours": "11:00 AM - 8:00 PM", "open": true},
        "4": {"day": "Thursday", "hours": "11:00 AM - 8:00 PM", "open": true},
        "5": {"day": "Friday", "hours": "11:00 AM - 9:00 PM", "open": true},
        "6": {"day": "Saturday", "hours": "11:00 AM - 9:00 PM", "open": true}
    }'::jsonb,
    '[
        {"name": "Christmas Day", "month": 12, "day": 25, "hours": "Closed", "open": false},
        {"name": "Christmas Eve", "month": 12, "day": 24, "hours": "11:00 AM - 3:00 PM", "open": true},
        {"name": "Easter", "month": 0, "day": 0, "hours": "Closed", "open": false},
        {"name": "Thanksgiving", "month": 10, "day": 0, "hours": "Closed", "open": false, "isCalculated": true}
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Restaurant Status (single row)
INSERT INTO restaurant_status (manual_closed)
VALUES (false)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE restaurant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_closures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurant_metrics
-- Public read access
CREATE POLICY "Public read access for restaurant_metrics"
    ON restaurant_metrics FOR SELECT
    USING (true);

-- Server-side only write access (will use service role key)
CREATE POLICY "Service role write access for restaurant_metrics"
    ON restaurant_metrics FOR ALL
    USING (false); -- This will be bypassed by service role key

-- RLS Policies for vote_records
-- Public read access
CREATE POLICY "Public read access for vote_records"
    ON vote_records FOR SELECT
    USING (true);

-- Public insert access (for voting)
CREATE POLICY "Public insert access for vote_records"
    ON vote_records FOR INSERT
    WITH CHECK (true);

-- RLS Policies for restaurant_hours
-- Public read access
CREATE POLICY "Public read access for restaurant_hours"
    ON restaurant_hours FOR SELECT
    USING (true);

-- Server-side only write access
CREATE POLICY "Service role write access for restaurant_hours"
    ON restaurant_hours FOR ALL
    USING (false);

-- RLS Policies for restaurant_status
-- Public read access
CREATE POLICY "Public read access for restaurant_status"
    ON restaurant_status FOR SELECT
    USING (true);

-- Server-side only write access
CREATE POLICY "Service role write access for restaurant_status"
    ON restaurant_status FOR ALL
    USING (false);

-- RLS Policies for scheduled_closures
-- Public read access
CREATE POLICY "Public read access for scheduled_closures"
    ON scheduled_closures FOR SELECT
    USING (true);

-- Server-side only write access
CREATE POLICY "Service role write access for scheduled_closures"
    ON scheduled_closures FOR ALL
    USING (false);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_restaurant_metrics_updated_at BEFORE UPDATE ON restaurant_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_hours_updated_at BEFORE UPDATE ON restaurant_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_status_updated_at BEFORE UPDATE ON restaurant_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_hours;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_status;
