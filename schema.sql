-- Schema for SAQR Wholesale Management System

-- 1. Customers Table (Account Ledger)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    balance DECIMAL(12, 2) DEFAULT 0.00, -- Positive for debt, negative for credit
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inventory Table (Products)
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    quantity DECIMAL(12, 2) DEFAULT 0.00,
    min_limit DECIMAL(12, 2) DEFAULT 0.00,
    unit VARCHAR(50) DEFAULT 'كغم',
    last_updated TIMESTAMP DEFAULT NOW()
);

-- 3. Invoices Table (Sales)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    total_weight DECIMAL(12, 2) NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

-- 4. Invoice Items Table (Details)
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weight DECIMAL(12, 2) NOT NULL,
    box_weight DECIMAL(12, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL
);

-- 5. Receipts Table (Payments)
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    date TIMESTAMP DEFAULT NOW()
);

-- Initial Data for testing
INSERT INTO inventory (name, quantity, min_limit, unit) VALUES 
('بندورة نخب أول', 1500.00, 300.00, 'كغم'),
('خيار بلدي', 800.00, 200.00, 'كغم'),
('بصل أحمر', 2000.00, 500.00, 'كغم')
ON CONFLICT (name) DO NOTHING;
