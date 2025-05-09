-- KYNSEY MD - Phase 2 Database Schema Expansion
-- This script adds new tables and columns for medical charts, billing, and expanded patient demographics

-- =============================================
-- 1. Medical Charts and Records Tables
-- =============================================

-- Medical Charts
CREATE TABLE IF NOT EXISTS medical_charts (
    chart_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES medical_patients(patient_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Chart Notes
CREATE TABLE IF NOT EXISTS medical_chart_notes (
    note_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    provider_id INTEGER NOT NULL REFERENCES medical_providers(provider_id),
    note_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note_type VARCHAR(50) NOT NULL, -- e.g., 'SOAP', 'Progress', 'Initial'
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    signature TEXT,
    signed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vital Signs
CREATE TABLE IF NOT EXISTS medical_vital_signs (
    vital_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(5,2),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    oxygen_saturation DECIMAL(5,2),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medications
CREATE TABLE IF NOT EXISTS medical_medications (
    medication_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    drug_class VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Patient Medications
CREATE TABLE IF NOT EXISTS medical_patient_medications (
    patient_medication_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    medication_id INTEGER NOT NULL REFERENCES medical_medications(medication_id),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),
    start_date DATE,
    end_date DATE,
    prescribing_provider_id INTEGER REFERENCES medical_providers(provider_id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Allergies
CREATE TABLE IF NOT EXISTS medical_allergies (
    allergy_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    allergen VARCHAR(255) NOT NULL,
    reaction TEXT,
    severity VARCHAR(50), -- e.g., 'Mild', 'Moderate', 'Severe'
    onset_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Medical History
CREATE TABLE IF NOT EXISTS medical_history (
    history_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    condition VARCHAR(255) NOT NULL,
    diagnosis_date DATE,
    resolution_date DATE,
    status VARCHAR(50), -- e.g., 'Active', 'Resolved', 'Chronic'
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Lab Results
CREATE TABLE IF NOT EXISTS medical_lab_results (
    lab_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    result TEXT NOT NULL,
    reference_range VARCHAR(100),
    units VARCHAR(50),
    abnormal BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS medical_documents (
    document_id SERIAL PRIMARY KEY,
    chart_id INTEGER NOT NULL REFERENCES medical_charts(chart_id),
    document_type VARCHAR(100) NOT NULL, -- e.g., 'Imaging', 'Lab Report', 'Referral'
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. Expanded Patient Demographics
-- =============================================

-- Add columns to medical_patients table
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(100);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(100);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS race VARCHAR(100);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS employment_status VARCHAR(100);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS employer VARCHAR(255);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS preferred_pharmacy VARCHAR(255);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS preferred_pharmacy_phone VARCHAR(20);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS preferred_pharmacy_address TEXT;
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS primary_care_provider VARCHAR(255);
ALTER TABLE medical_patients ADD COLUMN IF NOT EXISTS referral_source VARCHAR(255);

-- =============================================
-- 3. Billing and Insurance Processing Tables
-- =============================================

-- Claims
CREATE TABLE IF NOT EXISTS medical_claims (
    claim_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES medical_patients(patient_id),
    appointment_id INTEGER REFERENCES medical_appointments(appointment_id),
    insurance_id INTEGER REFERENCES medical_patient_insurance(insurance_id),
    claim_number VARCHAR(100),
    date_of_service DATE NOT NULL,
    date_submitted DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Submitted', 'Paid', 'Denied'
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Claim Line Items
CREATE TABLE IF NOT EXISTS medical_claim_items (
    item_id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES medical_claims(claim_id),
    service_id INTEGER NOT NULL REFERENCES medical_services(service_id),
    procedure_code VARCHAR(20) NOT NULL, -- CPT/HCPCS code
    diagnosis_code VARCHAR(20), -- ICD-10 code
    modifier VARCHAR(10),
    units INTEGER NOT NULL DEFAULT 1,
    charge_amount DECIMAL(10,2) NOT NULL,
    allowed_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    adjustment_amount DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS medical_payments (
    payment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES medical_patients(patient_id),
    claim_id INTEGER REFERENCES medical_claims(claim_id),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- e.g., 'Cash', 'Credit Card', 'Check', 'Insurance'
    payment_amount DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Payments
CREATE TABLE IF NOT EXISTS medical_insurance_payments (
    insurance_payment_id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES medical_claims(claim_id),
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    check_number VARCHAR(50),
    eft_reference VARCHAR(100),
    payer_name VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Patient Statements
CREATE TABLE IF NOT EXISTS medical_patient_statements (
    statement_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES medical_patients(patient_id),
    statement_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Open', 'Paid', 'Overdue', 'Collection'
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Statement Line Items
CREATE TABLE IF NOT EXISTS medical_statement_items (
    statement_item_id SERIAL PRIMARY KEY,
    statement_id INTEGER NOT NULL REFERENCES medical_patient_statements(statement_id),
    claim_id INTEGER REFERENCES medical_claims(claim_id),
    service_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    charge_amount DECIMAL(10,2) NOT NULL,
    insurance_paid DECIMAL(10,2) DEFAULT 0,
    adjustments DECIMAL(10,2) DEFAULT 0,
    patient_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Superbills
CREATE TABLE IF NOT EXISTS medical_superbills (
    superbill_id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES medical_appointments(appointment_id),
    provider_id INTEGER NOT NULL REFERENCES medical_providers(provider_id),
    patient_id INTEGER NOT NULL REFERENCES medical_patients(patient_id),
    date_of_service DATE NOT NULL,
    diagnosis_codes TEXT[], -- Array of ICD-10 codes
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Draft', 'Finalized', 'Billed'
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Superbill Line Items
CREATE TABLE IF NOT EXISTS medical_superbill_items (
    superbill_item_id SERIAL PRIMARY KEY,
    superbill_id INTEGER NOT NULL REFERENCES medical_superbills(superbill_id),
    service_id INTEGER NOT NULL REFERENCES medical_services(service_id),
    procedure_code VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    units INTEGER NOT NULL DEFAULT 1,
    charge_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. Create Indexes for Performance
-- =============================================

-- Chart indexes
CREATE INDEX IF NOT EXISTS idx_medical_charts_patient_id ON medical_charts(patient_id);

-- Chart notes indexes
CREATE INDEX IF NOT EXISTS idx_medical_chart_notes_chart_id ON medical_chart_notes(chart_id);
CREATE INDEX IF NOT EXISTS idx_medical_chart_notes_provider_id ON medical_chart_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_medical_chart_notes_note_date ON medical_chart_notes(note_date);

-- Vital signs indexes
CREATE INDEX IF NOT EXISTS idx_medical_vital_signs_chart_id ON medical_vital_signs(chart_id);
CREATE INDEX IF NOT EXISTS idx_medical_vital_signs_recorded_at ON medical_vital_signs(recorded_at);

-- Patient medications indexes
CREATE INDEX IF NOT EXISTS idx_medical_patient_medications_chart_id ON medical_patient_medications(chart_id);
CREATE INDEX IF NOT EXISTS idx_medical_patient_medications_medication_id ON medical_patient_medications(medication_id);
CREATE INDEX IF NOT EXISTS idx_medical_patient_medications_active ON medical_patient_medications(active);

-- Allergies indexes
CREATE INDEX IF NOT EXISTS idx_medical_allergies_chart_id ON medical_allergies(chart_id);

-- Medical history indexes
CREATE INDEX IF NOT EXISTS idx_medical_history_chart_id ON medical_history(chart_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_status ON medical_history(status);

-- Lab results indexes
CREATE INDEX IF NOT EXISTS idx_medical_lab_results_chart_id ON medical_lab_results(chart_id);
CREATE INDEX IF NOT EXISTS idx_medical_lab_results_test_date ON medical_lab_results(test_date);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_medical_documents_chart_id ON medical_documents(chart_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_document_type ON medical_documents(document_type);

-- Claims indexes
CREATE INDEX IF NOT EXISTS idx_medical_claims_patient_id ON medical_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_claims_appointment_id ON medical_claims(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_claims_insurance_id ON medical_claims(insurance_id);
CREATE INDEX IF NOT EXISTS idx_medical_claims_date_of_service ON medical_claims(date_of_service);
CREATE INDEX IF NOT EXISTS idx_medical_claims_status ON medical_claims(status);

-- Claim items indexes
CREATE INDEX IF NOT EXISTS idx_medical_claim_items_claim_id ON medical_claim_items(claim_id);
CREATE INDEX IF NOT EXISTS idx_medical_claim_items_service_id ON medical_claim_items(service_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_medical_payments_patient_id ON medical_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_payments_claim_id ON medical_payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_medical_payments_payment_date ON medical_payments(payment_date);

-- Insurance payments indexes
CREATE INDEX IF NOT EXISTS idx_medical_insurance_payments_claim_id ON medical_insurance_payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_medical_insurance_payments_payment_date ON medical_insurance_payments(payment_date);

-- Patient statements indexes
CREATE INDEX IF NOT EXISTS idx_medical_patient_statements_patient_id ON medical_patient_statements(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_patient_statements_statement_date ON medical_patient_statements(statement_date);
CREATE INDEX IF NOT EXISTS idx_medical_patient_statements_status ON medical_patient_statements(status);

-- Statement items indexes
CREATE INDEX IF NOT EXISTS idx_medical_statement_items_statement_id ON medical_statement_items(statement_id);
CREATE INDEX IF NOT EXISTS idx_medical_statement_items_claim_id ON medical_statement_items(claim_id);

-- Superbills indexes
CREATE INDEX IF NOT EXISTS idx_medical_superbills_appointment_id ON medical_superbills(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_superbills_provider_id ON medical_superbills(provider_id);
CREATE INDEX IF NOT EXISTS idx_medical_superbills_patient_id ON medical_superbills(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_superbills_date_of_service ON medical_superbills(date_of_service);
CREATE INDEX IF NOT EXISTS idx_medical_superbills_status ON medical_superbills(status);

-- Superbill items indexes
CREATE INDEX IF NOT EXISTS idx_medical_superbill_items_superbill_id ON medical_superbill_items(superbill_id);
CREATE INDEX IF NOT EXISTS idx_medical_superbill_items_service_id ON medical_superbill_items(service_id);
