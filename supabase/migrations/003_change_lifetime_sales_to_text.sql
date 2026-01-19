-- Change lifetime sales columns from INTEGER to TEXT to support formatted values
-- Migration: 003_change_lifetime_sales_to_text.sql

-- Convert existing integer values to text
ALTER TABLE restaurant_metrics 
ALTER COLUMN ny_lifetime_sales TYPE TEXT USING ny_lifetime_sales::TEXT,
ALTER COLUMN chicago_lifetime_sales TYPE TEXT USING chicago_lifetime_sales::TEXT;

-- Set default values to empty string instead of 0
ALTER TABLE restaurant_metrics 
ALTER COLUMN ny_lifetime_sales SET DEFAULT '',
ALTER COLUMN chicago_lifetime_sales SET DEFAULT '';

-- Update existing 0 values to empty string
UPDATE restaurant_metrics 
SET 
    ny_lifetime_sales = CASE WHEN ny_lifetime_sales = '0' THEN '' ELSE ny_lifetime_sales END,
    chicago_lifetime_sales = CASE WHEN chicago_lifetime_sales = '0' THEN '' ELSE chicago_lifetime_sales END;
