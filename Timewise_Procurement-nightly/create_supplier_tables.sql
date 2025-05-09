-- Create supplier_contracts table
CREATE TABLE IF NOT EXISTS supplier_contracts (
    contract_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    contract_number VARCHAR(50) NOT NULL,
    contract_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    total_value NUMERIC(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_terms VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_notice_days INTEGER,
    document_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier_risk_assessments table
CREATE TABLE IF NOT EXISTS supplier_risk_assessments (
    assessment_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    assessment_date DATE,
    financial_risk_score NUMERIC(3, 1),
    compliance_risk_score NUMERIC(3, 1),
    supply_chain_risk_score NUMERIC(3, 1),
    geopolitical_risk_score NUMERIC(3, 1),
    overall_risk_score NUMERIC(3, 1),
    risk_level VARCHAR(20),
    assessor_id INTEGER,
    mitigation_plan TEXT,
    next_assessment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier_certifications table
CREATE TABLE IF NOT EXISTS supplier_certifications (
    certification_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    certification_name VARCHAR(100) NOT NULL,
    certification_number VARCHAR(50),
    issuing_authority VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    document_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create or update the supplier_performance table with all necessary columns
-- First, check if it exists and has the right columns, if not, create it
CREATE TABLE IF NOT EXISTS supplier_performance (
    performance_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    quality_score NUMERIC(3, 1) NOT NULL,
    delivery_score NUMERIC(3, 1) NOT NULL,
    responsiveness_score NUMERIC(3, 1) NOT NULL,
    cost_score NUMERIC(3, 1) NOT NULL,
    overall_score NUMERIC(3, 1) NOT NULL,
    performance_category VARCHAR(50),
    evaluation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for contracts
INSERT INTO supplier_contracts (supplier_id, contract_number, contract_type, start_date, end_date, total_value, payment_terms, status)
VALUES 
(2, 'CONT-001', 'Service', '2025-01-01', '2025-06-30', 250000.00, 'Net 60', 'active'),
(3, 'CONT-002', 'Goods', '2025-02-15', '2025-07-15', 175000.00, '2% 10 Net 30', 'active'),
(4, 'CONT-003', 'Service', '2024-10-01', '2025-05-15', 320000.00, 'Net 30', 'active'),
(5, 'CONT-004', 'License', '2024-11-15', '2025-08-15', 85000.00, 'Net 45', 'active'),
(6, 'CONT-005', 'Goods', '2025-01-15', '2025-09-15', 125000.00, 'Net 60', 'active');

-- Sample data for risk assessments
INSERT INTO supplier_risk_assessments (supplier_id, assessment_date, financial_risk_score, compliance_risk_score, supply_chain_risk_score, geopolitical_risk_score, overall_risk_score, risk_level, next_assessment_date)
VALUES 
(2, '2025-04-01', 2.5, 3.0, 3.5, 2.0, 2.75, 'medium', '2025-10-01'),
(3, '2025-04-15', 3.5, 4.0, 3.5, 4.5, 3.88, 'high', '2025-07-15'),
(4, '2025-03-10', 1.5, 2.0, 1.5, 1.5, 1.63, 'low', '2025-09-10'),
(5, '2025-04-05', 4.0, 3.5, 4.5, 4.0, 4.00, 'high', '2025-07-05'),
(6, '2025-04-20', 3.0, 2.5, 3.0, 2.5, 2.75, 'medium', '2025-10-20');

-- Sample data for certifications
INSERT INTO supplier_certifications (supplier_id, certification_name, certification_number, issuing_authority, issue_date, expiry_date, status)
VALUES 
(2, 'ISO 9001', 'ISO-9001-12345', 'ISO', '2024-06-01', '2025-06-01', 'active'),
(3, 'ISO 14001', 'ISO-14001-67890', 'ISO', '2024-03-15', '2025-05-30', 'active'),
(4, 'ISO 27001', 'ISO-27001-24680', 'ISO', '2024-07-15', '2025-07-15', 'active'),
(5, 'FDA Compliance', 'FDA-8765-43210', 'FDA', '2024-01-10', '2025-06-15', 'active'),
(6, 'CE Mark', 'CE-2023-9876', 'European Commission', '2024-04-20', '2025-04-20', 'active');

-- Sample data for supplier performance (if data doesn't already exist)
INSERT INTO supplier_performance (supplier_id, quality_score, delivery_score, responsiveness_score, cost_score, overall_score, performance_category)
SELECT 
    s.supplier_id,
    CASE 
        WHEN s.supplier_id % 5 = 0 THEN 3.5
        WHEN s.supplier_id % 5 = 1 THEN 4.0
        WHEN s.supplier_id % 5 = 2 THEN 4.5
        WHEN s.supplier_id % 5 = 3 THEN 3.8
        ELSE 4.2
    END as quality_score,
    CASE 
        WHEN s.supplier_id % 5 = 0 THEN 3.7
        WHEN s.supplier_id % 5 = 1 THEN 4.1
        WHEN s.supplier_id % 5 = 2 THEN 4.3
        WHEN s.supplier_id % 5 = 3 THEN 3.9
        ELSE 4.0
    END as delivery_score,
    CASE 
        WHEN s.supplier_id % 5 = 0 THEN 3.8
        WHEN s.supplier_id % 5 = 1 THEN 4.2
        WHEN s.supplier_id % 5 = 2 THEN 4.4
        WHEN s.supplier_id % 5 = 3 THEN 3.7
        ELSE 4.1
    END as responsiveness_score,
    CASE 
        WHEN s.supplier_id % 5 = 0 THEN 3.6
        WHEN s.supplier_id % 5 = 1 THEN 3.9
        WHEN s.supplier_id % 5 = 2 THEN 4.2
        WHEN s.supplier_id % 5 = 3 THEN 3.8
        ELSE 3.9
    END as cost_score,
    CASE 
        WHEN s.supplier_id % 5 = 0 THEN 3.65
        WHEN s.supplier_id % 5 = 1 THEN 4.05
        WHEN s.supplier_id % 5 = 2 THEN 4.35
        WHEN s.supplier_id % 5 = 3 THEN 3.8
        ELSE 4.05
    END as overall_score,
    CASE 
        WHEN s.supplier_id % 5 = 0 THEN 'Average'
        WHEN s.supplier_id % 5 = 1 THEN 'Good'
        WHEN s.supplier_id % 5 = 2 THEN 'Excellent'
        WHEN s.supplier_id % 5 = 3 THEN 'Average'
        ELSE 'Good'
    END as performance_category
FROM 
    suppliers s
WHERE 
    NOT EXISTS (SELECT 1 FROM supplier_performance sp WHERE sp.supplier_id = s.supplier_id) 
    AND s.supplier_status = 'active'
LIMIT 10;
