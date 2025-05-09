-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id SERIAL PRIMARY KEY,
  supplier_name VARCHAR(100) NOT NULL
);

-- Create procurement_schedules table
CREATE TABLE IF NOT EXISTS procurement_schedules (
  supplier_id INTEGER PRIMARY KEY REFERENCES suppliers(supplier_id),
  scheduled_delivery TIME NOT NULL,
  default_delay_days INTEGER NOT NULL DEFAULT 0
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  order_id SERIAL PRIMARY KEY,
  supplier_id INTEGER REFERENCES suppliers(supplier_id),
  supplier_location VARCHAR(100) NOT NULL,
  delivery_location VARCHAR(100) NOT NULL,
  order_date DATE NOT NULL,
  priority VARCHAR(20) NOT NULL,
  total_items INTEGER NOT NULL,
  fulfilled_items INTEGER NOT NULL,
  is_delayed BOOLEAN NOT NULL DEFAULT FALSE,
  cost DECIMAL(10, 2) NOT NULL
);

-- Insert sample data into suppliers
INSERT INTO suppliers (supplier_name) VALUES
  ('Global Supply Co.'),
  ('Tech Components Inc.'),
  ('Office Solutions Ltd.'),
  ('Industrial Materials Corp.'),
  ('Logistics Partners LLC');

-- Insert sample data into procurement_schedules
INSERT INTO procurement_schedules (supplier_id, scheduled_delivery, default_delay_days) VALUES
  (1, '09:00:00', 2),
  (2, '10:30:00', 1),
  (3, '13:00:00', 3),
  (4, '14:30:00', 2),
  (5, '16:00:00', 1);

-- Insert sample data into purchase_orders
INSERT INTO purchase_orders (supplier_id, supplier_location, delivery_location, order_date, priority, total_items, fulfilled_items, is_delayed, cost) VALUES
  (1, 'New York', 'Chicago', '2025-01-15', 'High', 100, 80, FALSE, 5000.00),
  (2, 'San Francisco', 'Denver', '2025-01-20', 'Medium', 50, 50, FALSE, 2500.00),
  (3, 'Boston', 'Miami', '2025-02-05', 'Low', 200, 150, TRUE, 7500.00),
  (4, 'Seattle', 'Austin', '2025-02-10', 'High', 75, 25, TRUE, 3000.00),
  (5, 'Chicago', 'Dallas', '2025-02-15', 'Medium', 150, 100, FALSE, 6000.00),
  (1, 'New York', 'Los Angeles', '2025-03-01', 'High', 120, 120, FALSE, 6000.00),
  (2, 'San Francisco', 'Phoenix', '2025-03-10', 'Low', 80, 40, TRUE, 3200.00),
  (3, 'Boston', 'Atlanta', '2025-03-15', 'Medium', 90, 90, FALSE, 4500.00),
  (4, 'Seattle', 'Houston', '2025-03-20', 'High', 60, 30, TRUE, 2400.00),
  (5, 'Chicago', 'Philadelphia', '2025-03-25', 'Low', 110, 70, FALSE, 4400.00);

-- Create prepared statements
PREPARE get_all_suppliers AS
  SELECT * FROM suppliers ORDER BY supplier_id;

PREPARE get_purchase_orders(date, integer, integer) AS
  SELECT po.*, s.supplier_name
  FROM purchase_orders po
  JOIN suppliers s ON po.supplier_id = s.supplier_id
  WHERE 
    ($1 IS NULL OR EXTRACT(YEAR FROM po.order_date) = EXTRACT(YEAR FROM $1::date)) AND
    ($2 IS NULL OR po.supplier_id = $2) 
  ORDER BY po.order_date DESC
  LIMIT $3;

-- Note: Membership tables and prepared statements are now handled by membership_schema.sql
