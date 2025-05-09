-- KYNSEY MD - Medical ERP Database Views
-- This script creates useful views for reporting and querying the medical database

-- View: Daily Schedule
-- Purpose: Provides a complete view of the daily appointment schedule
CREATE OR REPLACE VIEW view_daily_schedule AS
SELECT 
    a.id AS appointment_id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    a.appointment_type,
    a.reason_for_visit,
    p.id AS patient_id,
    CONCAT(p.last_name, ', ', p.first_name) AS patient_name,
    p.date_of_birth,
    p.phone AS patient_phone,
    prov.id AS provider_id,
    CONCAT(u.last_name, ', ', u.first_name) AS provider_name,
    l.id AS location_id,
    l.name AS location_name,
    o.id AS operatory_id,
    o.name AS operatory_name,
    o.room_number
FROM 
    medical_appointments a
JOIN 
    medical_patients p ON a.patient_id = p.id
JOIN 
    medical_providers prov ON a.provider_id = prov.id
JOIN 
    medical_users u ON prov.user_id = u.id
JOIN 
    medical_locations l ON a.location_id = l.id
JOIN 
    medical_operatories o ON a.operatory_id = o.id;

-- View: Appointment Services
-- Purpose: Shows all services associated with appointments with financial details
CREATE OR REPLACE VIEW view_appointment_services AS
SELECT 
    a.id AS appointment_id,
    a.appointment_date,
    a.start_time,
    CONCAT(p.last_name, ', ', p.first_name) AS patient_name,
    CONCAT(u.last_name, ', ', u.first_name) AS provider_name,
    s.code AS service_code,
    s.name AS service_name,
    s.category AS service_category,
    aps.fee_charged,
    aps.insurance_coverage,
    aps.patient_portion,
    aps.status AS service_status,
    l.name AS location_name
FROM 
    medical_appointment_services aps
JOIN 
    medical_appointments a ON aps.appointment_id = a.id
JOIN 
    medical_services s ON aps.service_id = s.id
JOIN 
    medical_patients p ON a.patient_id = p.id
JOIN 
    medical_providers prov ON aps.provider_id = prov.id
JOIN 
    medical_users u ON prov.user_id = u.id
JOIN 
    medical_locations l ON a.location_id = l.id;

-- View: Patient Insurance Details
-- Purpose: Combines patient demographics with their insurance information
CREATE OR REPLACE VIEW view_patient_insurance AS
SELECT 
    p.id AS patient_id,
    CONCAT(p.last_name, ', ', p.first_name) AS patient_name,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.email,
    CONCAT(p.address_line1, ', ', p.city, ', ', p.state, ' ', p.postal_code) AS patient_address,
    pi.id AS insurance_id,
    pi.insurance_provider,
    pi.policy_number,
    pi.group_number,
    pi.subscriber_name,
    pi.subscriber_relationship,
    pi.coverage_start_date,
    pi.coverage_end_date,
    pi.is_primary
FROM 
    medical_patients p
LEFT JOIN 
    medical_patient_insurance pi ON p.id = pi.patient_id;

-- View: Provider Schedule
-- Purpose: Shows appointments by provider for scheduling and load balancing
CREATE OR REPLACE VIEW view_provider_schedule AS
SELECT 
    prov.id AS provider_id,
    CONCAT(u.last_name, ', ', u.first_name) AS provider_name,
    u.role,
    prov.provider_type,
    prov.specialty,
    a.id AS appointment_id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    CONCAT(p.last_name, ', ', p.first_name) AS patient_name,
    l.name AS location_name,
    o.name AS operatory_name,
    o.room_number
FROM 
    medical_providers prov
JOIN 
    medical_users u ON prov.user_id = u.id
LEFT JOIN 
    medical_appointments a ON prov.id = a.provider_id
LEFT JOIN 
    medical_patients p ON a.patient_id = p.id
LEFT JOIN 
    medical_locations l ON a.location_id = l.id
LEFT JOIN 
    medical_operatories o ON a.operatory_id = o.id;

-- View: Production Report
-- Purpose: Aggregates financial data for production reports
CREATE OR REPLACE VIEW view_production_report AS
SELECT 
    pl.service_date,
    CONCAT(p.last_name, ', ', p.first_name) AS patient_name,
    CONCAT(u.last_name, ', ', u.first_name) AS provider_name,
    l.name AS location_name,
    pl.transaction_type,
    pl.amount,
    pl.payment_method,
    a.id AS appointment_id,
    a.appointment_date
FROM 
    medical_production_log pl
JOIN 
    medical_patients p ON pl.patient_id = p.id
JOIN 
    medical_providers prov ON pl.provider_id = prov.id
JOIN 
    medical_users u ON prov.user_id = u.id
JOIN 
    medical_locations l ON pl.location_id = l.id
LEFT JOIN 
    medical_appointments a ON pl.appointment_id = a.id;

-- View: Today's Schedule
-- Purpose: Shows specifically today's appointments for quick access
CREATE OR REPLACE VIEW view_todays_schedule AS
SELECT * FROM view_daily_schedule
WHERE appointment_date = CURRENT_DATE
ORDER BY start_time;