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

-- Create supplier_performance_evaluations table
CREATE TABLE IF NOT EXISTS supplier_performance_evaluations (
    evaluation_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    evaluation_date DATE,
    quality_score NUMERIC(3, 1),
    delivery_score NUMERIC(3, 1),
    responsiveness_score NUMERIC(3, 1),
    cost_score NUMERIC(3, 1),
    overall_score NUMERIC(3, 1),
    reviewer_id INTEGER,
    comments TEXT,
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

-- Add sample data for contracts
INSERT INTO supplier_contracts (supplier_id, contract_number, contract_type, start_date, end_date, total_value, payment_terms, status)
VALUES 
(2, 'CONT-001', 'Service', '2025-01-01', '2025-12-31', 250000.00, 'Net 60', 'active'),
(3, 'CONT-002', 'Goods', '2025-02-15', '2025-06-15', 175000.00, '2% 10 Net 30', 'active');

-- Add sample data for risk assessments
INSERT INTO supplier_risk_assessments (supplier_id, assessment_date, financial_risk_score, compliance_risk_score, supply_chain_risk_score, geopolitical_risk_score, overall_risk_score, risk_level, next_assessment_date)
VALUES 
(2, '2025-04-01', 2.5, 3.0, 3.5, 2.0, 2.75, 'medium', '2025-10-01'),
(3, '2025-04-15', 3.5, 4.0, 3.5, 4.5, 3.88, 'high', '2025-07-15');

-- Add sample data for performance evaluations
INSERT INTO supplier_performance_evaluations (supplier_id, evaluation_date, quality_score, delivery_score, responsiveness_score, cost_score, overall_score)
VALUES 
(2, '2025-04-01', 4.2, 3.8, 4.0, 3.5, 3.88),
(3, '2025-04-15', 3.5, 3.0, 4.0, 3.8, 3.58);

-- Add sample data for certifications
INSERT INTO supplier_certifications (supplier_id, certification_name, certification_number, issuing_authority, issue_date, expiry_date, status)
VALUES 
(2, 'ISO 9001', 'ISO-9001-12345', 'ISO', '2024-06-01', '2025-06-01', 'active'),
(3, 'ISO 14001', 'ISO-14001-67890', 'ISO', '2024-03-15', '2025-05-30', 'active');
