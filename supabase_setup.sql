-- ============================================
-- MistryStudio — Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  cost_price NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  unit TEXT DEFAULT 'pcs',
  pcs_per_unit INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT,
  qty INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  pcs_per_unit INTEGER DEFAULT 1,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  category TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Stock log table
CREATE TABLE IF NOT EXISTS stock_log (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT,
  change INTEGER,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations (personal app, no auth needed)
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on stock_log" ON stock_log FOR ALL USING (true) WITH CHECK (true);

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Pens'), ('Pencils'), ('Notebooks'), ('Files & Folders'),
  ('Art Supplies'), ('Erasers'), ('Markers'), ('Other')
ON CONFLICT (name) DO NOTHING;
