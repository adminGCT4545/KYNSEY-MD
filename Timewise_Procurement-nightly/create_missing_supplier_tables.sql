-- SQL script to create missing supplier tables and populate with sample data

-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS supplier_contracts CASCADE;
DROP TABLE IF EXISTS supplier_risk_assessments CASCADE;
DROP TABLE IF EXISTS supplier_performance_evaluations CASCADE;

-- Create supplier_contracts table
CREATE TABLE supplier_contracts (
    contract_id SERIAL PRIMARY KEY,
    supplier_id INT, -- Assuming this links to an existing suppliers table
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    contract_terms TEXT,
    contract_value DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Add FOREIGN KEY constraint if suppliers table exists and has supplier_id
    -- FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Create supplier_risk_assessments table
CREATE TABLE supplier_risk_assessments (
    assessment_id SERIAL PRIMARY KEY,
    supplier_id INT, -- Assuming this links to an existing suppliers table
    assessment_date DATE NOT NULL,
    risk_score INT CHECK (risk_score >= 1 AND risk_score <= 10), -- Example: Scale 1-10
    risk_category VARCHAR(100), -- e.g., Financial, Operational, Compliance
    assessment_details TEXT,
    mitigation_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Add FOREIGN KEY constraint if suppliers table exists and has supplier_id
    -- FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Create supplier_performance_evaluations table
-- Note: This seems similar to the existing 'supplier_performance' table.
-- Defining it as requested, but consider potential redundancy.
CREATE TABLE supplier_performance_evaluations (
    evaluation_id SERIAL PRIMARY KEY,
    supplier_id INT, -- Assuming this links to an existing suppliers table
    evaluation_date DATE NOT NULL,
    evaluator_name VARCHAR(255),
    quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5), -- Example: Scale 1-5
    delivery_rating INT CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    overall_score DECIMAL(4, 2), -- Calculated or overall assessment
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Add FOREIGN KEY constraint if suppliers table exists and has supplier_id
    -- FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Insert sample data into supplier_contracts
-- Assuming supplier_id 1, 2, 3 exist in the suppliers table
INSERT INTO supplier_contracts (supplier_id, contract_start_date, contract_end_date, contract_terms, contract_value) VALUES
(1, '2024-01-01', '2025-12-31', 'Standard service agreement for raw materials.', 150000.00),
(2, '2023-06-15', '2024-06-14', 'Consulting services contract.', 75000.00),
(3, '2024-03-01', '2026-02-28', 'Long-term partnership for component supply.', 500000.00);

-- Insert sample data into supplier_risk_assessments
INSERT INTO supplier_risk_assessments (supplier_id, assessment_date, risk_score, risk_category, assessment_details, mitigation_plan) VALUES
(1, '2024-02-10', 3, 'Operational', 'Minor dependency on a single shipping route.', 'Identify alternative shipping options.'),
(2, '2024-04-22', 6, 'Financial', 'Supplier reported slight decrease in quarterly revenue.', 'Monitor financial health quarterly.'),
(3, '2024-01-15', 2, 'Compliance', 'All certifications up-to-date.', 'Annual compliance check scheduled.');

-- Insert sample data into supplier_performance_evaluations
INSERT INTO supplier_performance_evaluations (supplier_id, evaluation_date, evaluator_name, quality_rating, delivery_rating, communication_rating, overall_score, comments) VALUES
(1, '2024-05-01', 'Alice Smith', 5, 4, 5, 4.67, 'Excellent quality, slight delay on last shipment.'),
(2, '2024-05-03', 'Bob Johnson', 4, 5, 4, 4.33, 'Good service, very responsive communication.'),
(3, '2024-04-30', 'Alice Smith', 5, 5, 5, 5.00, 'Consistently outstanding performance across all areas.');

-- Add triggers for updated_at timestamp if needed (syntax depends on specific SQL dialect)
-- Example for PostgreSQL:
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--    NEW.updated_at = now();
--    RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_supplier_contracts_updated_at BEFORE UPDATE
-- ON supplier_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_supplier_risk_assessments_updated_at BEFORE UPDATE
-- ON supplier_risk_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_supplier_performance_evaluations_updated_at BEFORE UPDATE
-- ON supplier_performance_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- End of script
