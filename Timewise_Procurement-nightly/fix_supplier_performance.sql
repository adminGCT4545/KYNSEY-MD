-- Check if performance_category column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'supplier_performance' AND column_name = 'performance_category'
    ) THEN
        ALTER TABLE supplier_performance ADD COLUMN performance_category VARCHAR(50);
    END IF;

    -- Update existing records with performance category
    UPDATE supplier_performance
    SET performance_category = 
        CASE 
            WHEN overall_score >= 4.5 THEN 'Excellent'
            WHEN overall_score >= 4.0 THEN 'Good'
            WHEN overall_score >= 3.5 THEN 'Average'
            ELSE 'Needs Improvement'
        END
    WHERE performance_category IS NULL;
END $$;

-- Sample data for supplier_performance (if table doesn't have enough records)
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
