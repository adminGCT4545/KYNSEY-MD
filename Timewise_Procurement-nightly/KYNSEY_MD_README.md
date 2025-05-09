# KYNSEY MD - Medical ERP System

## Overview

KYNSEY MD is a comprehensive Medical ERP system built on top of the existing Timewise Procurement application. It provides functionality for managing medical practices, including patient scheduling, appointment management, and financial tracking.

## Features

- **Daily Patient Scheduler**: View and manage patient appointments by location, provider, and operatory
- **Patient Management**: Comprehensive patient record management
- **Appointment Management**: Schedule, update, and track patient appointments
- **Production/Collections Tracking**: Monitor financial metrics for the practice
- **LLM Integration**: Connect to a local Ollama instance running Llama 3.2 for medical queries (planned)

## Technology Stack

- **Frontend**: React with TypeScript, styled with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **LLM Integration**: Connection to Ollama (planned)

## Directory Structure

```
Timewise_Procurement-nightly/
├── src/
│   ├── components/
│   │   └── medical/              # Frontend components for the medical module
│   │       ├── MedicalLayout.tsx # Main layout component
│   │       ├── TopNavBar.tsx     # Top navigation bar
│   │       ├── MainSideBar.tsx   # Left sidebar with navigation
│   │       ├── DailySchedulerView.tsx # Daily appointment scheduler view
│   │       ├── AppointmentCard.tsx    # Appointment card component
│   │       ├── LocationSelector.tsx   # Location selector component
│   │       ├── DateNavigator.tsx      # Date navigation component
│   │       ├── StatusFilter.tsx       # Status filter component
│   │       └── index.tsx              # Exports all components
│   └── services/
│       └── medicalService.ts     # Service layer for API communication
├── backend/
│   ├── models/
│   │   └── medical/              # Backend models for the medical module
│   │       ├── patientModel.js   # Patient model
│   │       └── appointmentModel.js # Appointment model
│   ├── routes/
│   │   ├── medical/              # Backend routes for the medical module
│   │   │   ├── patientRoutes.js  # Patient routes
│   │   │   ├── appointmentRoutes.js # Appointment routes
│   │   │   └── index.js          # Exports all routes
│   │   └── medical-routes.js     # Main medical routes file (ES modules)
│   └── utils/
│       └── db.js                 # Database utility
├── setup-medical-db.sql          # SQL script to set up the database schema
├── setup-medical-db.sh           # Shell script to run the SQL script
├── start-medical-server.sh       # Script to start the backend server
├── insert-medical-sample-data.sql # SQL script with sample data
├── insert-medical-sample-data.sh # Script to insert sample data
├── test-medical-api.js           # Script to test API endpoints
├── MEDICAL_MODULE_README.md      # Detailed setup and testing guide
└── KYNSEY_UPDATES.md             # Development updates and changelog
```

## Setup Instructions

### 1. Database Setup

Run the setup script to create the necessary database tables:

```bash
./Timewise_Procurement-nightly/setup-medical-db.sh
```

This will create the following tables in your PostgreSQL database:

- `medical_users` - Clinic staff
- `medical_locations` - Clinic locations
- `medical_providers` - Doctors, hygienists, etc.
- `medical_patients` - Patient records
- `medical_patient_insurance` - Patient insurance information
- `medical_services` - Medical/dental procedures
- `medical_operatories` - Treatment rooms
- `medical_appointments` - Appointment scheduling
- `medical_appointment_services` - Services linked to appointments
- `medical_production_log` - Financial transactions

### 2. Insert Sample Data (Optional)

To insert sample data for testing purposes, run:

```bash
./Timewise_Procurement-nightly/insert-medical-sample-data.sh
```

### 3. Start the Backend Server

Start the backend server:

```bash
./Timewise_Procurement-nightly/start-medical-server.sh
```

### 4. Start the Frontend Development Server

Start the frontend development server:

```bash
cd Timewise_Procurement-nightly
npm run dev
```

## Testing the System

To test the API endpoints, run:

```bash
node Timewise_Procurement-nightly/test-medical-api.js
```

For more detailed setup and testing instructions, refer to the `MEDICAL_MODULE_README.md` file.

## API Endpoints

### Patient Endpoints

- `GET /api/medical/patients` - Get all patients with optional filtering
- `GET /api/medical/patients/:id` - Get a patient by ID
- `POST /api/medical/patients` - Create a new patient
- `PUT /api/medical/patients/:id` - Update an existing patient
- `DELETE /api/medical/patients/:id` - Delete a patient (soft delete)
- `GET /api/medical/patients/:id/appointments` - Get appointments for a patient

### Appointment Endpoints

- `GET /api/medical/appointments` - Get all appointments with optional filtering
- `GET /api/medical/appointments/daily-schedule` - Get daily schedule for a specific date and location
- `GET /api/medical/appointments/:id` - Get an appointment by ID
- `POST /api/medical/appointments` - Create a new appointment
- `PUT /api/medical/appointments/:id` - Update an existing appointment
- `PATCH /api/medical/appointments/:id/status` - Update appointment status
- `DELETE /api/medical/appointments/:id` - Delete an appointment

### Chart Endpoints

- `POST /api/medical/charts` - Create a new patient chart
- `GET /api/medical/charts/:id` - Get a chart by ID
- `GET /api/medical/charts/patient/:patientId` - Get a patient's chart
- `PUT /api/medical/charts/:id` - Update a chart
- `POST /api/medical/charts/:id/notes` - Add a note to a chart
- `GET /api/medical/charts/:id/notes` - Get notes for a chart
- `GET /api/medical/notes/:id` - Get a specific note by ID
- `PUT /api/medical/notes/:id` - Update a chart note
- `POST /api/medical/charts/:id/vitals` - Add vital signs to a chart
- `GET /api/medical/charts/:id/vitals` - Get vital signs for a chart
- `POST /api/medical/charts/:id/allergies` - Add an allergy to a chart
- `GET /api/medical/charts/:id/allergies` - Get allergies for a chart
- `POST /api/medical/charts/:id/history` - Add a medical history item to a chart
- `GET /api/medical/charts/:id/history` - Get medical history for a chart
- `POST /api/medical/charts/:id/labs` - Add a lab result to a chart
- `GET /api/medical/charts/:id/labs` - Get lab results for a chart
- `POST /api/medical/charts/:id/documents` - Add a document to a chart
- `GET /api/medical/charts/:id/documents` - Get documents for a chart
- `GET /api/medical/documents/:id` - Get a document by ID

### Billing Endpoints

- `POST /api/medical/billing/claims` - Create a new insurance claim
- `GET /api/medical/billing/claims/:id` - Get a claim by ID
- `GET /api/medical/billing/claims` - Get claims with optional filtering
- `PUT /api/medical/billing/claims/:id` - Update a claim
- `POST /api/medical/billing/claims/:id/items` - Add a claim line item
- `GET /api/medical/billing/claims/:id/items` - Get claim line items
- `PUT /api/medical/billing/claim-items/:id` - Update a claim line item
- `DELETE /api/medical/billing/claim-items/:id` - Delete a claim line item
- `POST /api/medical/billing/payments` - Add a payment
- `GET /api/medical/billing/payments` - Get payments with optional filtering
- `POST /api/medical/billing/insurance-payments` - Add an insurance payment
- `GET /api/medical/billing/claims/:id/insurance-payments` - Get insurance payments for a claim
- `POST /api/medical/billing/statements` - Create a patient statement
- `GET /api/medical/billing/statements/:id` - Get a statement by ID
- `GET /api/medical/billing/patients/:id/statements` - Get statements for a patient
- `PUT /api/medical/billing/statements/:id` - Update a statement
- `POST /api/medical/billing/statements/:id/items` - Add a statement line item
- `GET /api/medical/billing/statements/:id/items` - Get statement line items
- `POST /api/medical/billing/superbills` - Create a superbill
- `GET /api/medical/billing/superbills/:id` - Get a superbill by ID
- `GET /api/medical/billing/superbills` - Get superbills with optional filtering
- `PUT /api/medical/billing/superbills/:id` - Update a superbill
- `POST /api/medical/billing/superbills/:id/items` - Add a superbill line item
- `GET /api/medical/billing/superbills/:id/items` - Get superbill line items

## Database Schema

The database schema has been expanded in Phase 2 to include:

### Medical Charts and Records

- `medical_charts` - Patient charts
- `medical_chart_notes` - SOAP notes and progress notes
- `medical_vital_signs` - Patient vital signs
- `medical_medications` - Medication database
- `medical_patient_medications` - Patient medications
- `medical_allergies` - Patient allergies
- `medical_history` - Patient medical history
- `medical_lab_results` - Lab test results
- `medical_documents` - Patient documents

### Expanded Patient Demographics

The `medical_patients` table has been expanded with additional fields:
- Demographic information (marital status, language, ethnicity, race)
- Employment information
- Emergency contact information
- Preferred pharmacy information
- Primary care provider and referral source

### Billing and Insurance Processing

- `medical_claims` - Insurance claims
- `medical_claim_items` - Claim line items
- `medical_payments` - Patient payments
- `medical_insurance_payments` - Insurance payments
- `medical_patient_statements` - Patient statements
- `medical_statement_items` - Statement line items
- `medical_superbills` - Superbills
- `medical_superbill_items` - Superbill line items

## Development Roadmap

### Phase 1: Core Medical ERP - Foundation & Key Views (Completed)

- [x] Frontend UI Shell and Static Components
- [x] Database Schema Setup
- [x] Backend Models & API Routes
- [x] Frontend-Backend Integration
- [x] Backend Server Implementation
- [x] Testing and Refinement

### Phase 2: Expanding Core Functionality & Patient Management (In Progress)

- [x] Database Schema Expansion
  - ~~Add medical charts and records tables~~
  - ~~Expand patient demographics~~
  - ~~Add billing and insurance processing tables~~
- [x] Additional Backend API Development
  - ~~Create patient chart API~~
  - ~~Implement billing and claims processing~~
  - Add reporting endpoints
- [ ] Frontend Development for Additional Tabs
  - Create Patient Management view
  - Implement Billing & Claims view
  - Add Reports & Analytics view
- [ ] Patient Base Area Development
  - Create patient profile view
  - Implement patient history timeline
  - Add patient documents management

### Phase 3: Patient Portal & LLM Integration (Planned)

- [ ] Patient Portal Development
  - Create patient login system
  - Implement appointment booking interface
  - Add secure messaging system
  - Create patient records access
- [ ] "KYNSEY MD" LLM Integration
  - Connect to Ollama instance
  - Implement medical query processing
  - Create medical knowledge base
  - Add AI-assisted diagnosis support

## Phase 2 Setup Instructions

### 1. Expand the Database Schema

Run the Phase 2 database expansion script:

```bash
./Timewise_Procurement-nightly/execute-phase2-expansion.sh
```

This will add all the new tables and columns required for Phase 2 features:
- Medical charts and records tables
- Expanded patient demographics
- Billing and insurance processing tables
- Performance indexes

### 2. Restart the Backend Server

After expanding the database schema, restart the backend server to apply the changes:

```bash
./Timewise_Procurement-nightly/start-medical-server.sh
```

### 3. Using the Chart API

The Chart API allows you to manage patient medical records:

- Create a patient chart: `POST /api/medical/charts`
- Add chart notes (SOAP notes): `POST /api/medical/charts/:id/notes`
- Record vital signs: `POST /api/medical/charts/:id/vitals`
- Manage allergies: `POST /api/medical/charts/:id/allergies`
- Track medical history: `POST /api/medical/charts/:id/history`
- Store lab results: `POST /api/medical/charts/:id/labs`
- Upload documents: `POST /api/medical/charts/:id/documents`

### 4. Using the Billing API

The Billing API provides comprehensive medical billing functionality:

- Create insurance claims: `POST /api/medical/billing/claims`
- Process payments: `POST /api/medical/billing/payments`
- Generate patient statements: `POST /api/medical/billing/statements`
- Create superbills: `POST /api/medical/billing/superbills`
- Track insurance payments: `POST /api/medical/billing/insurance-payments`

## Contributing

1. Create a feature branch from the main branch
2. Make your changes
3. Submit a pull request

## License

Proprietary - All rights reserved
