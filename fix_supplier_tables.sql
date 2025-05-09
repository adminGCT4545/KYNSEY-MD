-- SQL script to modify the newly created tables to match expected column names

-- Fix supplier_contracts table
ALTER TABLE supplier_contracts 
ADD COLUMN contract_number VARCHAR(100),
ADD COLUMN status VARCHAR(50) DEFAULT 'active',
ADD COLUMN total_value DECIMAL(15, 2);

-- Rename columns separately
ALTER TABLE supplier_contracts RENAME COLUMN contract_start_date TO start_date;
ALTER TABLE supplier_contracts RENAME COLUMN contract_end_date TO end_date;

-- Update contract_number values
UPDATE supplier_contracts 
SET contract_number = 'CONT-' || contract_id,
    total_value = contract_value,
    status = 'active';

-- Fix supplier_risk_assessments table
ALTER TABLE supplier_risk_assessments 
ADD COLUMN overall_risk_score DECIMAL(4, 2),
ADD COLUMN risk_level VARCHAR(50);

-- Calculate overall_risk_score from risk_score and set risk_level
UPDATE supplier_risk_assessments
SET overall_risk_score = risk_score::decimal / 2, -- Convert 1-10 scale to match expected 1-5 scale
    risk_level = CASE 
                  WHEN risk_score <= 3 THEN 'low'
                  WHEN risk_score <= 6 THEN 'medium'
                  WHEN risk_score <= 8 THEN 'high'
                  ELSE 'critical'
                 END;

-- Fix supplier_performance_evaluations table
ALTER TABLE supplier_performance_evaluations 
ADD COLUMN responsiveness_score INT,
ADD COLUMN cost_score INT,
ADD COLUMN performance_category VARCHAR(50);

-- Update responsiveness_score with communication_rating and calculate performance_category
UPDATE supplier_performance_evaluations
SET responsiveness_score = communication_rating,
    cost_score = 4, -- Default average value
    performance_category = CASE 
                           WHEN overall_score >= 4.5 THEN 'Excellent'
                           WHEN overall_score >= 3.5 THEN 'Good'
                           WHEN overall_score >= 2.5 THEN 'Average'
                           ELSE 'Poor'
                          END;
