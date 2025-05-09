# KYNSEY MD - Medical ERP Development Plan

## 1. Overall Project Goal

To transform the existing `Timewise_Procurement-nightly` application (a procurement ERP) into a comprehensive Medical ERP. The new system will feature a user interface inspired by the provided image, while leveraging the core technology stack (React, TypeScript, Node.js, PostgreSQL) of the original application. Business logic will be entirely new and tailored for a medical practice.

## 2. Core Technology Stack

*   **Frontend:** React with TypeScript, styled with Tailwind CSS. Charting libraries like Recharts will be used for data visualization.
*   **Backend:** Node.js (likely with Express.js), using the `pg` library for direct PostgreSQL interaction.
*   **Database:** A new PostgreSQL database with a schema designed specifically for the medical ERP.
*   **LLM Integration:** Connection to a local Ollama instance running Llama 3.2 3B instruct-fp16.

## 3. Key Features Requested

*   **Main Application Tabs:**
    *   Daily (Patient Schedule)
    *   Performance
    *   Planner
    *   Huddle
    *   Worklist
    *   Production Goals
    *   Dashboard (Overall Summary)
*   **Patient Portal:**
    *   Secure messaging between patients and clinic staff.
    *   Sharing of clinical documents.
*   **Patient Base Area:**
    *   A comprehensive patient management section, similar in concept to the "Membership" module of the original codebase, allowing for detailed patient record viewing and management.
*   **"KYNSEY MD" LLM Integration:**
    *   A dedicated sidebar button/panel.
    *   Interface to interact with the Llama 3.2 model via Ollama for medical queries, summarization, etc.

## 4. Phased Development Approach (Frontend-First)

### Phase 1: Core Medical ERP - Foundation & Key Views

**Objective:** Establish the foundational UI, database, and backend APIs for the "Daily" patient schedule and "Production/Collections" tracking.

1.  **Frontend - UI Shell and Static Components (React/TypeScript):**
    *   Create a new directory: `Timewise_Procurement-nightly/src/components/medical/`.
    *   **Main Layout:** Develop the overall application shell (Top navigation bar, Main navigation tabs, Left sidebar area, Main content area).
    *   **"Daily" View Static Components:** Design and build static versions of the location selector, date navigation, status filters, and the appointment grid (using `AppointmentCard.tsx` with mock data).
    *   **"Production/Collections" Sidebar Static Components:** Build the layout for Production, Collections, and Completed Visits sections using placeholder charts and mock data.
    *   Apply Tailwind CSS for styling to match the target UI.
2.  **Database Setup (`setup-medical-db.sql`):**
    *   Create the `setup-medical-db.sql` file.
    *   Define `CREATE TABLE` statements for core entities:
        *   `Users` (clinic staff)
        *   `Locations` (clinic sites)
        *   `Providers` (doctors, hygienists)
        *   `Patients` (demographics, contact, insurance info)
        *   `PatientInsurance`
        *   `Services` (medical/dental procedures)
        *   `Operatories` (treatment rooms)
        *   `Appointments` (scheduling details)
        *   `AppointmentServices` (linking services to appointments)
        *   `ProductionLog` (basic financial transactions)
3.  **Backend - Models & API Routes (Node.js/Express.js):**
    *   Develop backend models (e.g., `patientModel.js`, `appointmentModel.js`) in `Timewise_Procurement-nightly/backend/models/medical/`.
    *   Create API routes (e.g., `patientRoutes.js`, `appointmentRoutes.js`) in `Timewise_Procurement-nightly/backend/routes/medical/` (e.g., under `/api/medical/`).
    *   Initially, API endpoints can return mock data structures.
4.  **Frontend - Data Integration:**
    *   Update frontend components to fetch data from the actual backend APIs.
    *   Implement functionality for creating/updating data (e.g., adding patients, booking appointments).
5.  **Testing and Refinement:**
    *   Thoroughly test frontend-backend integration and UI functionality.

### Phase 2: Expanding Core Functionality & Patient Management

**Objective:** Implement additional main tabs, enhance patient management, and introduce clinical documentation.

1.  **Database Schema Expansion:**
    *   Add tables like `ClinicalNotes`, `MedicalDocuments`, `BillingLedger` (more detailed).
2.  **Backend API Development:**
    *   Create CRUD endpoints for new tables.
    *   Develop APIs to support "Performance," "Planner," "Huddle," and "Worklist" tabs.
    *   Implement more advanced billing data management.
3.  **Frontend Development:**
    *   Build the UI and functionality for "Performance," "Planner," "Huddle," and "Worklist" tabs.
    *   Develop the **Patient Base Area**:
        *   Searchable/filterable patient list.
        *   Detailed patient profile view (demographics, appointment history, clinical notes, documents, communication log, billing summary).

### Phase 3: Patient Portal & LLM Integration

**Objective:** Launch the patient-facing portal and integrate the "KYNSEY MD" LLM assistant.

1.  **Patient Portal:**
    *   **Database Schema:** Add tables like `PatientLogins`, `SecureMessages`.
    *   **Backend API:** Implement patient authentication, secure messaging endpoints, and APIs for patients to view their appointments and documents.
    *   **Frontend (Patient-Facing UI):** Design and build a separate UI for patients (login, dashboard, messaging, document viewing).
2.  **"KYNSEY MD" LLM Integration:**
    *   **Backend Service/Module:** Create API endpoints to receive prompts and proxy requests to the local Ollama instance (Llama 3.2 3B instruct-fp16).
    *   **Frontend Component:** Develop a UI panel (activated by the "KYNSEY MD" sidebar button) for users to input prompts and view LLM responses.
    *   **Setup:** Provide guidance on setting up Ollama and ensuring the model is available.

## 5. Next Immediate Steps (Start of Phase 1)

1.  **Create Frontend Directory:** `Timewise_Procurement-nightly/src/components/medical/`.
2.  **Develop Static Main Layout Components:** (e.g., `MedicalLayout.tsx`, `TopNavBar.tsx`, `MainSideBar.tsx`).
3.  **Develop Static "Daily" View Components:** (e.g., `DailySchedulerView.tsx`, `AppointmentCard.tsx` with mock data).
4.  **Develop Static "Production/Collections" Sidebar Components.**
5.  **Create `setup-medical-db.sql`** with the defined `CREATE TABLE` statements.

This plan will be used as a reference throughout the project.
