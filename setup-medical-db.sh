#!/bin/bash

# KYNSEY MD - Medical ERP Database Setup Script
# This script sets up the medical database schema for the KYNSEY MD Medical ERP system

# Set default values for PostgreSQL connection
PGHOST=${PGHOST:-"localhost"}
PGUSER=${PGUSER:-"postgres"}
PGPASSWORD=${PGPASSWORD:-"postgres"}
PGDATABASE=${PGDATABASE:-"kynsey_md"}
PGPORT=${PGPORT:-"5432"}

# Display connection information
echo "Setting up KYNSEY MD Medical ERP database schema"
echo "------------------------------------------------"
echo "Host: $PGHOST"
echo "User: $PGUSER"
echo "Database: $PGDATABASE"
echo "Port: $PGPORT"
echo "------------------------------------------------"

# Confirm before proceeding
read -p "Do you want to proceed with the database setup? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Setup cancelled."
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null
then
    echo "Error: PostgreSQL client (psql) is not installed or not in PATH."
    echo "Please install PostgreSQL client tools and try again."
    exit 1
fi

# Run the SQL script
echo "Running setup-medical-db.sql..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -f setup-medical-db.sql

# Check if the script executed successfully
if [ $? -eq 0 ]
then
    echo "------------------------------------------------"
    echo "KYNSEY MD Medical ERP database schema setup completed successfully!"
    echo "The following tables were created:"
    echo "- medical_users"
    echo "- medical_locations"
    echo "- medical_providers"
    echo "- medical_patients"
    echo "- medical_patient_insurance"
    echo "- medical_services"
    echo "- medical_operatories"
    echo "- medical_appointments"
    echo "- medical_appointment_services"
    echo "- medical_production_log"
    echo "------------------------------------------------"
else
    echo "Error: Failed to set up the database schema."
    echo "Please check the PostgreSQL connection parameters and try again."
    exit 1
fi

# Insert sample data if requested
read -p "Do you want to insert sample data for testing? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Inserting main sample data from insert-medical-sample-data.sql..."
    PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -f insert-medical-sample-data.sql
    if [ $? -eq 0 ]; then
        echo "Main sample data inserted successfully."
    else
        echo "Error inserting main sample data. Please check insert-medical-sample-data.sql and permissions."
    fi

    echo "Creating chart-specific tables and inserting sample data from create-chart-tables-and-sample-data.sql..."
    PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -f create-chart-tables-and-sample-data.sql
    if [ $? -eq 0 ]; then
        echo "Chart-specific tables and sample data created successfully."
    else
        echo "Error creating chart-specific tables/data. Please check create-chart-tables-and-sample-data.sql and permissions."
    fi
else
    echo "Sample data insertion skipped."
fi

echo "Setup complete."
