#!/bin/bash

# KYNSEY MD - Phase 2 Database Schema Expansion Script
# This script executes the SQL commands to expand the medical database schema for Phase 2

# Set variables
DB_NAME="timewise_procurement"
DB_USER="postgres"
SQL_FILE="expand-medical-db-phase2.sql"

# Display start message
echo "Starting KYNSEY MD Phase 2 database schema expansion..."
echo "Using database: $DB_NAME"
echo "Using SQL file: $SQL_FILE"

# Check if the SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "Error: SQL file $SQL_FILE not found!"
    exit 1
fi

# Execute the SQL script
echo "Executing SQL script..."
psql -U $DB_USER -d $DB_NAME -f $SQL_FILE

# Check if the SQL execution was successful
if [ $? -eq 0 ]; then
    echo "Database schema expansion completed successfully!"
    echo "The following tables and columns have been added:"
    echo "- Medical Charts and Records Tables"
    echo "  - medical_charts"
    echo "  - medical_chart_notes"
    echo "  - medical_vital_signs"
    echo "  - medical_medications"
    echo "  - medical_patient_medications"
    echo "  - medical_allergies"
    echo "  - medical_history"
    echo "  - medical_lab_results"
    echo "  - medical_documents"
    echo "- Expanded Patient Demographics"
    echo "  - Added 15 new columns to medical_patients table"
    echo "- Billing and Insurance Processing Tables"
    echo "  - medical_claims"
    echo "  - medical_claim_items"
    echo "  - medical_payments"
    echo "  - medical_insurance_payments"
    echo "  - medical_patient_statements"
    echo "  - medical_statement_items"
    echo "  - medical_superbills"
    echo "  - medical_superbill_items"
    echo "- Performance Indexes"
    echo "  - Added indexes for all new tables"
else
    echo "Error: Database schema expansion failed!"
    exit 1
fi

echo "KYNSEY MD Phase 2 database setup complete."
