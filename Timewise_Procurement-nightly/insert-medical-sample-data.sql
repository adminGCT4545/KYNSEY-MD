-- KYNSEY MD - Medical ERP Sample Data
-- This script inserts sample data for testing the KYNSEY MD Medical ERP system

-- Insert sample users
INSERT INTO medical_users (username, password_hash, first_name, last_name, email, role, phone)
VALUES
  ('drsmith', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'John', 'Smith', 'drsmith@kynsey.md', 'doctor', '555-123-4567'),
  ('drbrown', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Emily', 'Brown', 'drbrown@kynsey.md', 'doctor', '555-234-5678'),
  ('hygwilson', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Sarah', 'Wilson', 'swilson@kynsey.md', 'hygienist', '555-345-6789'),
  ('recjohnson', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Michael', 'Johnson', 'mjohnson@kynsey.md', 'receptionist', '555-456-7890'),
  ('adminuser', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Admin', 'User', 'admin@kynsey.md', 'admin', '555-567-8901');

-- Insert sample locations
INSERT INTO medical_locations (name, address_line1, city, state, postal_code, phone)
VALUES
  ('Main Clinic', '123 Main Street', 'Springfield', 'IL', '62701', '555-111-0000'),
  ('Downtown Office', '456 Market Street', 'Springfield', 'IL', '62701', '555-222-0000'),
  ('Westside Branch', '789 West Avenue', 'Springfield', 'IL', '62702', '555-333-0000');

-- Insert sample providers
INSERT INTO medical_providers (user_id, provider_type, license_number, npi_number, specialty, default_location_id)
VALUES
  (1, 'doctor', 'MD12345', '1234567890', 'General Dentistry', 1),
  (2, 'doctor', 'MD67890', '0987654321', 'Orthodontics', 2),
  (3, 'hygienist', 'HYG12345', '1122334455', 'Dental Hygiene', 1);

-- Insert sample operatories
INSERT INTO medical_operatories (location_id, name, room_number)
VALUES
  (1, 'Operatory 1', 'A101'),
  (1, 'Operatory 2', 'A102'),
  (1, 'Operatory 3', 'A103'),
  (2, 'Operatory 1', 'B101'),
  (2, 'Operatory 2', 'B102'),
  (3, 'Operatory 1', 'C101'),
  (3, 'Operatory 2', 'C102');

-- Insert sample services
INSERT INTO medical_services (code, name, description, category, default_duration_minutes, default_fee)
VALUES
  ('D0150', 'Comprehensive Oral Evaluation', 'New or established patient', 'diagnostic', 30, 95.00),
  ('D0120', 'Periodic Oral Evaluation', 'Established patient', 'diagnostic', 15, 52.00),
  ('D0220', 'Intraoral X-ray', 'First film', 'diagnostic', 10, 35.00),
  ('D1110', 'Prophylaxis - Adult', 'Cleaning', 'preventive', 60, 98.00),
  ('D1120', 'Prophylaxis - Child', 'Cleaning', 'preventive', 45, 79.00),
  ('D2150', 'Amalgam - Two Surfaces', 'Primary or permanent', 'restorative', 45, 175.00),
  ('D2330', 'Resin-Based Composite', 'One surface, anterior', 'restorative', 45, 185.00),
  ('D2740', 'Crown - Porcelain/Ceramic', 'Full crown', 'restorative', 90, 1250.00);

-- Insert sample patients
INSERT INTO medical_patients (first_name, last_name, date_of_birth, gender, email, phone, address_line1, city, state, postal_code, preferred_location_id, preferred_provider_id)
VALUES
  ('Robert', 'Anderson', '1975-06-15', 'Male', 'randerson@email.com', '555-111-2222', '123 Oak Street', 'Springfield', 'IL', '62704', 1, 1),
  ('Jennifer', 'Taylor', '1982-09-23', 'Female', 'jtaylor@email.com', '555-222-3333', '456 Maple Avenue', 'Springfield', 'IL', '62704', 1, 1),
  ('William', 'Martinez', '1990-03-10', 'Male', 'wmartinez@email.com', '555-333-4444', '789 Pine Road', 'Springfield', 'IL', '62702', 2, 2),
  ('Elizabeth', 'Johnson', '1968-11-30', 'Female', 'ejohnson@email.com', '555-444-5555', '101 Cedar Lane', 'Springfield', 'IL', '62703', 1, 3),
  ('David', 'Wilson', '1995-07-22', 'Male', 'dwilson@email.com', '555-555-6666', '202 Birch Boulevard', 'Springfield', 'IL', '62704', 3, 1),
  ('Patricia', 'Garcia', '1988-01-05', 'Female', 'pgarcia@email.com', '555-666-7777', '303 Elm Street', 'Springfield', 'IL', '62701', 2, 2),
  ('Michael', 'Brown', '1972-04-18', 'Male', 'mbrown@email.com', '555-777-8888', '404 Walnut Drive', 'Springfield', 'IL', '62702', 1, 1),
  ('Linda', 'Davis', '1980-12-12', 'Female', 'ldavis@email.com', '555-888-9999', '505 Spruce Court', 'Springfield', 'IL', '62703', 3, 3);

-- Insert sample patient insurance
INSERT INTO medical_patient_insurance (patient_id, insurance_provider, policy_number, group_number, subscriber_name, subscriber_relationship, subscriber_dob, coverage_start_date)
VALUES
  (1, 'Delta Dental', 'DD123456', 'GRP001', 'Robert Anderson', 'Self', '1975-06-15', '2025-01-01'),
  (2, 'MetLife', 'ML789012', 'GRP002', 'Jennifer Taylor', 'Self', '1982-09-23', '2025-01-01'),
  (3, 'Cigna Dental', 'CD345678', 'GRP003', 'William Martinez', 'Self', '1990-03-10', '2025-01-01'),
  (4, 'Aetna', 'AE901234', 'GRP004', 'Elizabeth Johnson', 'Self', '1968-11-30', '2025-01-01'),
  (5, 'Guardian', 'GD567890', 'GRP005', 'David Wilson', 'Self', '1995-07-22', '2025-01-01');

-- Insert sample appointments for today and upcoming days
INSERT INTO medical_appointments (patient_id, provider_id, location_id, operatory_id, appointment_date, start_time, end_time, status, appointment_type, reason_for_visit, created_by)
VALUES
  -- Today's appointments
  (1, 1, 1, 1, CURRENT_DATE, '09:00:00', '10:00:00', 'confirmed', 'recall', 'Regular checkup and cleaning', 4),
  (2, 1, 1, 2, CURRENT_DATE, '10:30:00', '11:30:00', 'confirmed', 'emergency', 'Tooth pain', 4),
  (3, 2, 2, 4, CURRENT_DATE, '09:30:00', '10:30:00', 'confirmed', 'new patient', 'Initial consultation', 4),
  (4, 3, 1, 3, CURRENT_DATE, '13:00:00', '14:00:00', 'confirmed', 'recall', 'Regular cleaning', 4),
  (5, 1, 3, 6, CURRENT_DATE, '14:30:00', '15:30:00', 'confirmed', 'procedure', 'Filling', 4),
  
  -- Tomorrow's appointments
  (6, 2, 2, 5, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:00:00', 'scheduled', 'recall', 'Regular checkup', 4),
  (7, 1, 1, 1, CURRENT_DATE + INTERVAL '1 day', '11:00:00', '12:00:00', 'scheduled', 'procedure', 'Crown preparation', 4),
  (8, 3, 3, 7, CURRENT_DATE + INTERVAL '1 day', '14:00:00', '15:00:00', 'scheduled', 'recall', 'Regular cleaning', 4),
  
  -- Day after tomorrow's appointments
  (1, 1, 1, 2, CURRENT_DATE + INTERVAL '2 days', '09:30:00', '10:30:00', 'scheduled', 'procedure', 'Filling', 4),
  (3, 2, 2, 4, CURRENT_DATE + INTERVAL '2 days', '13:30:00', '14:30:00', 'scheduled', 'follow-up', 'Treatment planning', 4);

-- Insert sample appointment services
INSERT INTO medical_appointment_services (appointment_id, service_id, fee_charged, insurance_coverage, patient_portion, status, provider_id)
VALUES
  (1, 2, 52.00, 41.60, 10.40, 'planned', 1),
  (1, 4, 98.00, 78.40, 19.60, 'planned', 3),
  (2, 1, 95.00, 76.00, 19.00, 'planned', 1),
  (2, 3, 35.00, 28.00, 7.00, 'planned', 1),
  (3, 1, 95.00, 76.00, 19.00, 'planned', 2),
  (4, 4, 98.00, 78.40, 19.60, 'planned', 3),
  (5, 6, 175.00, 140.00, 35.00, 'planned', 1),
  (6, 2, 52.00, 41.60, 10.40, 'planned', 2),
  (7, 8, 1250.00, 1000.00, 250.00, 'planned', 1),
  (8, 4, 98.00, 78.40, 19.60, 'planned', 3),
  (9, 6, 175.00, 140.00, 35.00, 'planned', 1),
  (10, 2, 52.00, 41.60, 10.40, 'planned', 2);

-- Insert sample production log entries
INSERT INTO medical_production_log (appointment_id, appointment_service_id, patient_id, provider_id, location_id, service_date, transaction_type, amount, created_by)
VALUES
  (1, 1, 1, 1, 1, CURRENT_DATE, 'charge', 52.00, 4),
  (1, 2, 1, 3, 1, CURRENT_DATE, 'charge', 98.00, 4);
