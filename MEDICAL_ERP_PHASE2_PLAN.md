# KYNSEY MD - Phase 2 Implementation Plan

## Overview

This document outlines the detailed implementation plan for Phase 2 of the KYNSEY MD Medical ERP system. Phase 2 will focus on expanding core functionality and patient management capabilities, building upon the foundation established in Phase 1.

## Phase 2 Goals

1. Expand the database schema for medical charts and billing
2. Develop additional backend APIs for patient charts and billing
3. Create new frontend views for patient management and billing
4. Implement the patient base area for comprehensive patient information management

## 1. Database Schema Expansion

### 1.1 Medical Charts and Records Tables

```sql
-- Medical Charts
CREATE TABLE medical_charts (
    chart_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES medical_patients(patient_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Chart Notes
CREATE TABLE medical_chart_notes (
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
CREATE TABLE medical_vital_signs (
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
CREATE TABLE medical_medications (
    medication_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    drug_class VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Patient Medications
CREATE TABLE medical_patient_medications (
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
CREATE TABLE medical_allergies (
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
CREATE TABLE medical_history (
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
CREATE TABLE medical_lab_results (
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
CREATE TABLE medical_documents (
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
```

### 1.2 Expanded Patient Demographics

```sql
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
```

### 1.3 Billing and Insurance Processing Tables

```sql
-- Claims
CREATE TABLE medical_claims (
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
CREATE TABLE medical_claim_items (
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
CREATE TABLE medical_payments (
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
CREATE TABLE medical_insurance_payments (
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
CREATE TABLE medical_patient_statements (
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
CREATE TABLE medical_statement_items (
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
CREATE TABLE medical_superbills (
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
CREATE TABLE medical_superbill_items (
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
```

## 2. Additional Backend API Development

### 2.1 Patient Chart API

#### 2.1.1 Models

Create the following models:

- `chartModel.js` - For managing patient charts and medical records
- `medicationModel.js` - For managing medications and prescriptions
- `vitalSignsModel.js` - For tracking patient vital signs
- `labResultsModel.js` - For managing lab test results
- `documentsModel.js` - For handling patient documents and files

#### 2.1.2 Routes

Create the following route files:

- `chartRoutes.js` - Endpoints for patient chart operations
- `medicationRoutes.js` - Endpoints for medication management
- `vitalSignsRoutes.js` - Endpoints for vital signs tracking
- `labResultsRoutes.js` - Endpoints for lab results management
- `documentsRoutes.js` - Endpoints for document management

### 2.2 Billing and Claims Processing

#### 2.2.1 Models

Create the following models:

- `claimModel.js` - For managing insurance claims
- `paymentModel.js` - For tracking payments
- `statementModel.js` - For generating patient statements
- `superbillModel.js` - For creating and managing superbills

#### 2.2.2 Routes

Create the following route files:

- `claimRoutes.js` - Endpoints for claim operations
- `paymentRoutes.js` - Endpoints for payment processing
- `statementRoutes.js` - Endpoints for statement generation
- `superbillRoutes.js` - Endpoints for superbill management

### 2.3 Reporting Endpoints

Create a reporting module with the following endpoints:

- `GET /api/medical/reports/financial` - Financial reports
- `GET /api/medical/reports/clinical` - Clinical metrics
- `GET /api/medical/reports/operational` - Operational statistics
- `GET /api/medical/reports/custom` - Custom report generation

## 3. Frontend Development for Additional Tabs

### 3.1 Patient Management View

Create the following components:

- `PatientManagementView.tsx` - Main component for patient management
- `PatientList.tsx` - Component for displaying and filtering patients
- `PatientSearchBar.tsx` - Search functionality for patients
- `PatientCard.tsx` - Card component for displaying patient summary
- `PatientForm.tsx` - Form for adding/editing patient information

### 3.2 Billing & Claims View

Create the following components:

- `BillingView.tsx` - Main component for billing management
- `ClaimsList.tsx` - Component for displaying and filtering claims
- `ClaimDetails.tsx` - Detailed view of a claim
- `PaymentEntry.tsx` - Form for entering payments
- `StatementGenerator.tsx` - Interface for generating statements
- `SuperbillCreator.tsx` - Interface for creating superbills

### 3.3 Reports & Analytics View

Create the following components:

- `ReportsView.tsx` - Main component for reports and analytics
- `ReportSelector.tsx` - Interface for selecting report types
- `FinancialDashboard.tsx` - Dashboard for financial metrics
- `ClinicalMetrics.tsx` - Dashboard for clinical metrics
- `OperationalStats.tsx` - Dashboard for operational statistics
- `CustomReportBuilder.tsx` - Interface for building custom reports

## 4. Patient Base Area Development

### 4.1 Patient Profile View

Create the following components:

- `PatientProfileView.tsx` - Main component for patient profile
- `PatientDemographics.tsx` - Display and edit patient demographics
- `PatientInsurance.tsx` - Display and manage insurance information
- `PatientContacts.tsx` - Display and edit contact information
- `PatientPreferences.tsx` - Manage patient preferences

### 4.2 Patient History Timeline

Create the following components:

- `PatientHistoryTimeline.tsx` - Main component for patient history
- `TimelineEntry.tsx` - Component for individual timeline entries
- `AppointmentHistory.tsx` - Display past appointments
- `TreatmentHistory.tsx` - Display treatment history
- `MedicationHistory.tsx` - Display medication history

### 4.3 Patient Documents Management

Create the following components:

- `PatientDocumentsView.tsx` - Main component for document management
- `DocumentUploader.tsx` - Interface for uploading documents
- `DocumentViewer.tsx` - Component for viewing documents
- `DocumentList.tsx` - List of patient documents
- `DocumentCategories.tsx` - Categorization of documents

## Implementation Timeline

### Week 1-2: Database Schema Expansion
- Implement all new database tables
- Update existing tables with new columns
- Create indexes for performance optimization
- Test database schema with sample data

### Week 3-4: Backend API Development
- Implement chart and medical record APIs
- Develop billing and claims processing APIs
- Create reporting endpoints
- Test all API endpoints

### Week 5-6: Frontend Patient Management
- Develop Patient Management View components
- Implement patient search and filtering
- Create patient form for adding/editing patients
- Connect to backend APIs

### Week 7-8: Frontend Billing & Claims
- Develop Billing View components
- Implement claims management interface
- Create payment entry forms
- Develop statement and superbill generators

### Week 9-10: Frontend Reports & Analytics
- Develop Reports View components
- Implement dashboards for different metrics
- Create custom report builder
- Connect to reporting APIs

### Week 11-12: Patient Base Area
- Develop Patient Profile View
- Implement Patient History Timeline
- Create Patient Documents Management
- Test and refine all patient-focused features

## Testing Strategy

1. **Unit Testing**
   - Test individual components and functions
   - Verify API endpoints with mock data
   - Test database models with test database

2. **Integration Testing**
   - Test frontend-backend integration
   - Verify data flow between components
   - Test API chains and dependencies

3. **End-to-End Testing**
   - Test complete user workflows
   - Verify system behavior with real data
   - Test performance under load

4. **User Acceptance Testing**
   - Gather feedback from stakeholders
   - Verify system meets requirements
   - Identify areas for improvement

## Conclusion

This implementation plan outlines the tasks required to complete Phase 2 of the KYNSEY MD Medical ERP system. By following this plan, we will expand the core functionality of the system and implement comprehensive patient management features, setting the stage for Phase 3 which will focus on the Patient Portal and LLM Integration.
