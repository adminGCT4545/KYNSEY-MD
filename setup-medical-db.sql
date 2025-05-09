-- KYNSEY MD - Medical ERP Database Schema
-- This script creates the initial database schema for the KYNSEY MD Medical ERP system

-- Users (clinic staff)
CREATE TABLE IF NOT EXISTS medical_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'admin', 'doctor', 'hygienist', 'assistant', 'receptionist', etc.
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Locations (clinic sites)
CREATE TABLE IF NOT EXISTS medical_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address_line1 VARCHAR(100) NOT NULL,
  address_line2 VARCHAR(100),
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) DEFAULT 'USA',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  tax_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Providers (doctors, hygienists)
CREATE TABLE IF NOT EXISTS medical_providers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES medical_users(id),
  provider_type VARCHAR(50) NOT NULL, -- 'doctor', 'hygienist', etc.
  license_number VARCHAR(50),
  npi_number VARCHAR(20), -- National Provider Identifier
  specialty VARCHAR(100),
  default_location_id INTEGER REFERENCES medical_locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Patients
CREATE TABLE IF NOT EXISTS medical_patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(100),
  address_line2 VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'USA',
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  preferred_location_id INTEGER REFERENCES medical_locations(id),
  preferred_provider_id INTEGER REFERENCES medical_providers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_visit_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Patient Insurance
CREATE TABLE IF NOT EXISTS medical_patient_insurance (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES medical_patients(id) NOT NULL,
  insurance_provider VARCHAR(100) NOT NULL,
  policy_number VARCHAR(50) NOT NULL,
  group_number VARCHAR(50),
  subscriber_name VARCHAR(100),
  subscriber_relationship VARCHAR(50) DEFAULT 'Self',
  subscriber_dob DATE,
  coverage_start_date DATE,
  coverage_end_date DATE,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services (medical/dental procedures)
CREATE TABLE IF NOT EXISTS medical_services (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL, -- CPT/CDT code
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'diagnostic', 'preventive', 'restorative', etc.
  default_duration_minutes INTEGER NOT NULL DEFAULT 30,
  default_fee DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Operatories (treatment rooms)
CREATE TABLE IF NOT EXISTS medical_operatories (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES medical_locations(id) NOT NULL,
  name VARCHAR(50) NOT NULL,
  room_number VARCHAR(20),
  equipment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Appointments
CREATE TABLE IF NOT EXISTS medical_appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES medical_patients(id) NOT NULL,
  provider_id INTEGER REFERENCES medical_providers(id) NOT NULL,
  location_id INTEGER REFERENCES medical_locations(id) NOT NULL,
  operatory_id INTEGER REFERENCES medical_operatories(id) NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'arrived', 'completed', 'cancelled', 'noshow'
  appointment_type VARCHAR(50) NOT NULL, -- 'new patient', 'recall', 'emergency', etc.
  reason_for_visit TEXT,
  notes TEXT,
  created_by INTEGER REFERENCES medical_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointment Services (linking services to appointments)
CREATE TABLE IF NOT EXISTS medical_appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES medical_appointments(id) NOT NULL,
  service_id INTEGER REFERENCES medical_services(id) NOT NULL,
  fee_charged DECIMAL(10, 2) NOT NULL,
  insurance_coverage DECIMAL(10, 2),
  patient_portion DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'completed', 'billed', 'paid'
  provider_id INTEGER REFERENCES medical_providers(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production Log (basic financial transactions)
CREATE TABLE IF NOT EXISTS medical_production_log (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES medical_appointments(id),
  appointment_service_id INTEGER REFERENCES medical_appointment_services(id),
  patient_id INTEGER REFERENCES medical_patients(id) NOT NULL,
  provider_id INTEGER REFERENCES medical_providers(id) NOT NULL,
  location_id INTEGER REFERENCES medical_locations(id) NOT NULL,
  service_date DATE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'charge', 'payment', 'adjustment', 'refund'
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20), -- 'cash', 'credit card', 'insurance', etc.
  insurance_claim_id VARCHAR(50),
  insurance_payment_date DATE,
  notes TEXT,
  created_by INTEGER REFERENCES medical_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON medical_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON medical_appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON medical_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON medical_appointments(status);
CREATE INDEX IF NOT EXISTS idx_production_log_service_date ON medical_production_log(service_date);
CREATE INDEX IF NOT EXISTS idx_production_log_patient_id ON medical_production_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_production_log_provider_id ON medical_production_log(provider_id);
