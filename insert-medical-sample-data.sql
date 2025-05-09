-- KYNSEY MD - Medical ERP Sample Data
-- This script inserts sample data for testing and development purposes

-- Insert sample users
INSERT INTO medical_users (username, password_hash, first_name, last_name, email, role, phone)
VALUES 
  ('admin', '$2a$10$xVXgF9dkgRxAjRr/E3Z3ReoHO5VJzwMkgX92ggU6zDXJb/ErR0.Nq', 'Admin', 'User', 'admin@kynsey.md', 'admin', '555-000-0000'),
  ('drjones', '$2a$10$xVXgF9dkgRxAjRr/E3Z3ReoHO5VJzwMkgX92ggU6zDXJb/ErR0.Nq', 'Sarah', 'Jones', 'drjones@kynsey.md', 'doctor', '555-111-1111'),
  ('drsmith', '$2a$10$xVXgF9dkgRxAjRr/E3Z3ReoHO5VJzwMkgX92ggU6zDXJb/ErR0.Nq', 'Michael', 'Smith', 'drsmith@kynsey.md', 'doctor', '555-222-2222'),
  ('hygwang', '$2a$10$xVXgF9dkgRxAjRr/E3Z3ReoHO5VJzwMkgX92ggU6zDXJb/ErR0.Nq', 'Jennifer', 'Wang', 'jwang@kynsey.md', 'hygienist', '555-333-3333'),
  ('reception', '$2a$10$xVXgF9dkgRxAjRr/E3Z3ReoHO5VJzwMkgX92ggU6zDXJb/ErR0.Nq', 'Robert', 'Chen', 'reception@kynsey.md', 'receptionist', '555-444-4444');

-- Insert sample locations
INSERT INTO medical_locations (name, address_line1, city, state, postal_code, phone, email)
VALUES
  ('KYNSEY Main Clinic', '123 Health Street', 'Metropolis', 'NY', '10001', '555-987-6543', 'info@kynsey.md'),
  ('KYNSEY Downtown', '456 Medical Plaza', 'Metropolis', 'NY', '10002', '555-654-3210', 'downtown@kynsey.md'),
  ('KYNSEY Westside', '789 Care Avenue', 'Westville', 'NY', '10003', '555-321-0987', 'westside@kynsey.md');

-- Insert sample providers
INSERT INTO medical_providers (user_id, provider_type, license_number, npi_number, specialty, default_location_id)
VALUES
  (2, 'doctor', 'MD123456', '1234567890', 'General Medicine', 1),
  (3, 'doctor', 'MD789012', '0987654321', 'Cardiology', 1),
  (4, 'hygienist', 'HYG123456', '1122334455', 'General', 2);

-- Insert sample patients
INSERT INTO medical_patients (first_name, last_name, date_of_birth, gender, email, phone, 
                            address_line1, city, state, postal_code, preferred_location_id, preferred_provider_id)
VALUES
  ('John', 'Doe', '1980-05-15', 'Male', 'john.doe@email.com', '555-123-4567',
   '100 Patient Lane', 'Metropolis', 'NY', '10001', 1, 1),
  ('Jane', 'Smith', '1975-11-22', 'Female', 'jane.smith@email.com', '555-234-5678',
   '200 Wellness Road', 'Metropolis', 'NY', '10001', 1, 1),
  ('Robert', 'Johnson', '1990-03-30', 'Male', 'robert.johnson@email.com', '555-345-6789',
   '300 Health Blvd', 'Westville', 'NY', '10003', 3, 2),
  ('Emily', 'Wilson', '1985-07-12', 'Female', 'emily.wilson@email.com', '555-456-7890',
   '400 Care Street', 'Metropolis', 'NY', '10002', 2, 1),
  ('Michael', 'Brown', '1965-09-08', 'Male', 'michael.brown@email.com', '555-567-8901',
   '500 Medical Drive', 'Westville', 'NY', '10003', 3, 2);

-- Insert sample patient insurance
INSERT INTO medical_patient_insurance (patient_id, insurance_provider, policy_number, group_number, 
                                    subscriber_name, coverage_start_date)
VALUES
  (1, 'HealthPlus', 'HP12345678', 'GRP001', 'John Doe', '2025-01-01'),
  (2, 'MediCare Solutions', 'MS98765432', 'GRP002', 'Jane Smith', '2025-01-01'),
  (3, 'BlueHealth Insurance', 'BH56789012', 'GRP003', 'Robert Johnson', '2024-11-15'),
  (4, 'Guardian Medical', 'GM34567890', 'GRP004', 'Emily Wilson', '2025-02-01'),
  (5, 'HealthPlus', 'HP87654321', 'GRP001', 'Michael Brown', '2024-12-01');

-- Insert sample services
INSERT INTO medical_services (code, name, description, category, default_duration_minutes, default_fee)
VALUES
  ('99203', 'New Patient Office Visit', 'Detailed history and examination of new patient', 'evaluation', 45, 275.00),
  ('99212', 'Established Patient Office Visit', 'Problem-focused evaluation of established patient', 'evaluation', 30, 150.00),
  ('93000', 'ECG Complete', 'Electrocardiogram with interpretation and report', 'diagnostic', 20, 175.00),
  ('90471', 'Immunization Administration', 'Administration of vaccine/toxoid', 'preventive', 15, 95.00),
  ('99396', 'Preventive Visit (40-64 years)', 'Periodic comprehensive preventive visit', 'preventive', 60, 325.00),
  ('96372', 'Therapeutic Injection', 'Therapeutic, prophylactic, or diagnostic injection', 'therapeutic', 15, 85.00);

-- Insert sample operatories
INSERT INTO medical_operatories (location_id, name, room_number)
VALUES
  (1, 'Exam Room 1', 'A101'),
  (1, 'Exam Room 2', 'A102'),
  (1, 'Procedure Room', 'A103'),
  (2, 'Exam Room 1', 'B101'),
  (2, 'Exam Room 2', 'B102'),
  (3, 'Exam Room 1', 'C101'),
  (3, 'Procedure Room', 'C102');

-- Insert sample appointments (for the next week)
INSERT INTO medical_appointments (patient_id, provider_id, location_id, operatory_id, 
                               appointment_date, start_time, end_time, 
                               status, appointment_type, reason_for_visit, created_by)
VALUES
  -- Today
  (1, 1, 1, 1, CURRENT_DATE, '09:00:00', '09:45:00', 
   'scheduled', 'follow-up', 'Blood pressure check', 5),
  (2, 1, 1, 2, CURRENT_DATE, '10:00:00', '10:30:00', 
   'scheduled', 'follow-up', 'Medication review', 5),
  (3, 2, 1, 3, CURRENT_DATE, '14:00:00', '15:00:00', 
   'scheduled', 'new patient', 'Chest pain evaluation', 5),
   
  -- Tomorrow
  (4, 1, 1, 1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:00:00', 
   'scheduled', 'annual', 'Annual physical', 5),
  (5, 2, 3, 6, CURRENT_DATE + INTERVAL '1 day', '13:00:00', '13:30:00', 
   'scheduled', 'follow-up', 'Review test results', 5),
   
  -- Day after tomorrow
  (1, 1, 2, 4, CURRENT_DATE + INTERVAL '2 days', '11:00:00', '11:30:00', 
   'scheduled', 'follow-up', 'Review medication changes', 5),
  (2, 2, 3, 7, CURRENT_DATE + INTERVAL '2 days', '15:00:00', '15:30:00', 
   'scheduled', 'procedure', 'ECG', 5);

-- Insert sample appointment services
INSERT INTO medical_appointment_services (appointment_id, service_id, fee_charged, 
                                       insurance_coverage, patient_portion, status, provider_id)
VALUES
  (1, 2, 150.00, 120.00, 30.00, 'planned', 1),
  (2, 2, 150.00, 120.00, 30.00, 'planned', 1),
  (3, 1, 275.00, 225.00, 50.00, 'planned', 2),
  (3, 3, 175.00, 140.00, 35.00, 'planned', 2),
  (4, 5, 325.00, 275.00, 50.00, 'planned', 1),
  (5, 2, 150.00, 120.00, 30.00, 'planned', 2),
  (6, 2, 150.00, 120.00, 30.00, 'planned', 1),
  (7, 3, 175.00, 140.00, 35.00, 'planned', 2);

-- Insert sample production log entries for completed appointments
INSERT INTO medical_production_log (appointment_id, appointment_service_id, patient_id, provider_id, 
                                 location_id, service_date, transaction_type, amount, 
                                 payment_method, created_by)
VALUES
  -- Completed appointment from yesterday
  (NULL, NULL, 3, 2, 1, CURRENT_DATE - INTERVAL '1 day', 'charge', 325.00, NULL, 5),
  (NULL, NULL, 3, 2, 1, CURRENT_DATE - INTERVAL '1 day', 'payment', 50.00, 'credit card', 5),
  (NULL, NULL, 4, 1, 2, CURRENT_DATE - INTERVAL '2 days', 'charge', 150.00, NULL, 5),
  (NULL, NULL, 4, 1, 2, CURRENT_DATE - INTERVAL '2 days', 'payment', 30.00, 'cash', 5);

-- Set some appointments to completed status to simulate past appointments
UPDATE medical_appointments 
SET status = 'completed' 
WHERE appointment_date < CURRENT_DATE;
