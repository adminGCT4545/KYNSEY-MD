# KYNSEY MD Medical Module - Setup and Testing Guide

This guide provides detailed instructions for setting up, testing, and using the KYNSEY MD Medical ERP module.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
4. [Testing the System](#testing-the-system)
5. [Using the System](#using-the-system)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

## Overview

KYNSEY MD is a comprehensive Medical ERP system built on top of the existing Timewise Procurement application. It provides functionality for managing medical practices, including patient scheduling, appointment management, and financial tracking.

## Prerequisites

Before setting up the KYNSEY MD Medical ERP module, ensure you have the following:

- PostgreSQL 12 or higher installed and running
- Node.js 14 or higher installed
- npm 6 or higher installed
- Access to the Timewise Procurement codebase

## Setup Instructions

Follow these steps to set up the KYNSEY MD Medical ERP module:

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

This will insert sample data including:
- 5 users (doctors, hygienists, staff)
- 3 locations
- 3 providers
- 7 operatories
- 8 services
- 8 patients
- 5 patient insurance records
- 10 appointments
- 12 appointment services
- 2 production log entries

### 3. Start the Backend Server

Start the backend server:

```bash
./Timewise_Procurement-nightly/start-medical-server.sh
```

This will start the backend server on port 8888.

### 4. Start the Frontend Development Server

Start the frontend development server:

```bash
cd Timewise_Procurement-nightly
npm run dev
```

This will start the frontend development server, typically on port 5173 or 5174.

## Testing the System

### Testing the API

To test the API endpoints, run:

```bash
node Timewise_Procurement-nightly/test-medical-api.js
```

This will test the following endpoints:
- Root endpoint (`/api/medical`)
- Patients endpoint (`/api/medical/patients`)
- Appointments endpoint (`/api/medical/appointments`)

### Testing the Frontend

1. Start the backend server and frontend development server as described above.
2. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).
3. Navigate to the Medical module.
4. Test the following features:
   - Daily Scheduler view
   - Location selection
   - Date navigation
   - Status filtering
   - Appointment viewing

## Using the System

### Daily Scheduler

The Daily Scheduler view allows you to:
- View appointments for a specific date and location
- Filter appointments by status
- Navigate between dates
- Switch between locations

### Patient Management

The Patient Management view allows you to:
- View patient information
- Add new patients
- Edit existing patients
- View patient appointment history

### Appointment Management

The Appointment Management view allows you to:
- Schedule new appointments
- Edit existing appointments
- Update appointment status
- Add services to appointments

## API Documentation

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

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Ensure PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. Check the database connection parameters in the scripts:
   - `setup-medical-db.sh`
   - `start-medical-server.sh`
   - `insert-medical-sample-data.sh`

3. Verify the database exists:
   ```bash
   psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='timewise_procument';"
   ```

### API Connection Issues

If the API tests fail:

1. Ensure the backend server is running:
   ```bash
   ./Timewise_Procurement-nightly/start-medical-server.sh
   ```

2. Check the server logs for any errors.

3. Verify the API base URL in `test-medical-api.js` matches the server port.

### Frontend Issues

If the frontend doesn't display correctly:

1. Check the browser console for any errors.

2. Ensure the frontend is making requests to the correct API endpoint.

3. Verify that the frontend development server is running.

4. Clear your browser cache and reload the page.
