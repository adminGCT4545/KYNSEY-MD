-- KYNSEY MD - Medical Charting Tables and Sample Data
-- This script creates tables for vital signs and chart entries and inserts sample data.

-- Drop tables if they exist (for re-running the script)
DROP TABLE IF EXISTS medical_vital_signs CASCADE;
DROP TABLE IF EXISTS medical_chart_entries CASCADE;

-- Create medical_vital_signs table (without foreign key constraints for testing)
CREATE TABLE medical_vital_signs (
  vital_id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  recorded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  vital_type VARCHAR(50) NOT NULL, -- e.g., 'blood_pressure', 'heart_rate', 'temperature', 'respiratory_rate', 'oxygen_saturation', 'height', 'weight', 'bmi'
  value_numeric NUMERIC(10, 2), -- For single numeric values like temperature, heart rate
  value_text VARCHAR(100), -- For text values like blood pressure "120/80"
  unit VARCHAR(25), -- e.g., 'bpm', '°C', 'kg', 'cm'
  notes TEXT,
  recorded_by INTEGER
);

-- Create medical_chart_entries table (without foreign key constraints for testing)
CREATE TABLE medical_chart_entries (
  entry_id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  entry_type VARCHAR(50) NOT NULL DEFAULT 'SOAP Note', -- e.g., 'SOAP Note', 'Progress Note', 'Consultation'
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  additional_notes TEXT,
  created_by INTEGER,
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP WITHOUT TIME ZONE,
  signed_by INTEGER
);

-- Add indexes for performance
CREATE INDEX idx_vital_signs_patient_id ON medical_vital_signs(patient_id);
CREATE INDEX idx_vital_signs_appointment_id ON medical_vital_signs(appointment_id);
CREATE INDEX idx_chart_entries_patient_id ON medical_chart_entries(patient_id);
CREATE INDEX idx_chart_entries_appointment_id ON medical_chart_entries(appointment_id);

-- Sample Data for Vital Signs

-- Patient 1: John Doe (Recent appointments: today, 2 days from now)
-- Vitals for today's appointment (ID: 1)
INSERT INTO medical_vital_signs (patient_id, appointment_id, vital_type, value_text, value_numeric, unit, recorded_by, notes)
VALUES
  (1, 1, 'blood_pressure', '122/78', NULL, 'mmHg', 2, 'Patient seems calm.'),
  (1, 1, 'heart_rate', NULL, 72, 'bpm', 2, NULL),
  (1, 1, 'temperature', NULL, 37.0, '°C', 2, NULL),
  (1, 1, 'respiratory_rate', NULL, 16, 'breaths/min', 2, NULL),
  (1, 1, 'oxygen_saturation', NULL, 98, '%', 2, NULL),
  (1, 1, 'height', NULL, 175, 'cm', 2, 'Measured today'),
  (1, 1, 'weight', NULL, 78.5, 'kg', 2, 'Measured today');

-- Patient 2: Jane Smith (Recent appointment: today)
-- Vitals for today's appointment (ID: 2)
INSERT INTO medical_vital_signs (patient_id, appointment_id, vital_type, value_text, value_numeric, unit, recorded_by)
VALUES
  (2, 2, 'blood_pressure', '130/85', NULL, 'mmHg', 2),
  (2, 2, 'heart_rate', NULL, 80, 'bpm', 2),
  (2, 2, 'temperature', NULL, 37.2, '°C', 2),
  (2, 2, 'oxygen_saturation', NULL, 97, '%', 2);

-- Patient 3: Robert Johnson (Recent appointment: today)
-- Vitals for today's appointment (ID: 3)
INSERT INTO medical_vital_signs (patient_id, appointment_id, vital_type, value_text, value_numeric, unit, recorded_by)
VALUES
  (3, 3, 'blood_pressure', '140/90', NULL, 'mmHg', 3),
  (3, 3, 'heart_rate', NULL, 88, 'bpm', 3),
  (3, 3, 'temperature', NULL, 36.8, '°C', 3);

-- Sample Data for Medical Chart Entries

-- Patient 1: John Doe - Chart entry for today's appointment (ID: 1)
INSERT INTO medical_chart_entries (patient_id, appointment_id, subjective, objective, assessment, plan, created_by, is_signed, signed_at, signed_by)
VALUES
  (1, 1, 
   'Patient reports feeling generally well. Here for routine blood pressure check.',
   'BP 122/78 mmHg, HR 72 bpm. Appears in no acute distress.',
   'Controlled hypertension.',
   'Continue current medication (Lisinopril 10mg daily). Follow up in 3 months or sooner if concerns arise. Advised on continued diet and exercise.',
   2, TRUE, CURRENT_TIMESTAMP - INTERVAL '5 minutes', 2);

-- Patient 2: Jane Smith - Chart entry for today's appointment (ID: 2)
INSERT INTO medical_chart_entries (patient_id, appointment_id, subjective, objective, assessment, plan, created_by)
VALUES
  (2, 2, 
   'Patient here for medication review. Reports occasional mild headaches, unsure if related to medication.',
   'BP 130/85 mmHg, HR 80 bpm. Alert and oriented. Neurological exam grossly intact.',
   'Possible medication side effect (mild headache) vs. tension headache. Blood pressure slightly elevated.',
   'Monitor headaches. Consider adjusting Metformin dosage if headaches persist or worsen. Recheck BP in 1 month. Encourage stress management techniques.',
   2);

-- Patient 3: Robert Johnson - Chart entry for today's appointment (ID: 3, New Patient for Chest Pain)
INSERT INTO medical_chart_entries (patient_id, appointment_id, subjective, objective, assessment, plan, created_by, is_signed, signed_at, signed_by)
VALUES
  (3, 3, 
   'Patient is a 55 y/o male presenting with intermittent, non-exertional chest pain for the past 2 weeks. Describes pain as a dull ache, left-sided, lasting a few minutes. No radiation. No associated SOB, nausea, or diaphoresis. Denies previous cardiac history. Smokes 1 ppd for 20 years.',
   'BP 140/90 mmHg, HR 88 bpm, regular. RR 18. O2 Sat 96% on RA. Lungs clear to auscultation bilaterally. Cardiac exam: RRR, no murmurs, rubs, or gallops. ECG performed (see separate report - shows normal sinus rhythm, no acute ST changes).',
   'Atypical chest pain. Risk factors for CAD include smoking and hypertension. Need to rule out cardiac and other serious causes.',
   '1. Stat ECG (done, normal for now). 
2. Labs: Troponin, CK-MB, Lipid Panel, CBC, CMP. 
3. Chest X-ray to rule out pulmonary pathology. 
4. Prescribe Nitroglycerin SL prn for pain. 
5. Strongly advise smoking cessation. 
6. Schedule stress test. 
7. Follow up in 1 week to discuss results and further management. If pain worsens or becomes constant, go to ER.',
   3, TRUE, CURRENT_TIMESTAMP - INTERVAL '10 minutes', 3);

-- Patient 4: Emily Wilson - General check-up note (no specific appointment linked for this example, could be a summary note)
INSERT INTO medical_chart_entries (patient_id, entry_type, subjective, objective, assessment, plan, created_by)
VALUES
  (4, 'Progress Note',
   'Patient reports good adherence to diet and exercise plan. No new complaints.',
   'Weight stable. BP within normal limits.',
   'Well-managed, healthy adult.',
   'Continue current lifestyle. Routine follow-up in 1 year.',
   2);

SELECT 'Medical charting tables and sample data created successfully.' AS status;
