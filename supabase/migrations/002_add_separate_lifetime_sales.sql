-- Add separate lifetime sales columns for NY and Chicago styles
-- Migration: 002_add_separate_lifetime_sales.sql

ALTER TABLE restaurant_metrics 
ADD COLUMN IF NOT EXISTS ny_lifetime_sales INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS chicago_lifetime_sales INTEGER DEFAULT 0 NOT NULL;

-- Migrate existing pizzas_sold to both columns (if pizzas_sold > 0)
-- This assumes the existing value should be split or duplicated
-- You may want to adjust this logic based on your needs
UPDATE restaurant_metrics 
SET 
    ny_lifetime_sales = COALESCE(pizzas_sold, 0),
    chicago_lifetime_sales = COALESCE(pizzas_sold, 0)
WHERE ny_lifetime_sales = 0 AND chicago_lifetime_sales = 0;
