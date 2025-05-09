#!/bin/bash

# KYNSEY MD - Medical ERP Sample Data Insertion Script
# This script inserts sample data for testing the KYNSEY MD Medical ERP system

# Set default values for PostgreSQL connection
PGHOST=${PGHOST:-"localhost"}
PGUSER=${PGUSER:-"postgres"}
PGPASSWORD=${PGPASSWORD:-"postgres"}
PGDATABASE=${PGDATABASE:-"timewise_procument"}
PGPORT=${PGPORT:-"5432"}

# Display connection information
echo "Inserting KYNSEY MD Medical ERP sample data"
echo "-------------------------------------------"
echo "Host: $PGHOST"
echo "User: $PGUSER"
echo "Database: $PGDATABASE"
echo "Port: $PGPORT"
echo "-------------------------------------------"

# Confirm before proceeding
read -p "This will insert sample data into your database. Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Operation cancelled."
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
echo "Running insert-medical-sample-data.sql..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -f insert-medical-sample-data.sql

# Check if the script executed successfully
if [ $? -eq 0 ]
then
    echo "-------------------------------------------"
    echo "Sample data inserted successfully!"
    echo "The following sample data was inserted:"
    echo "- 5 users (doctors, hygienists, staff)"
    echo "- 3 locations"
    echo "- 3 providers"
    echo "- 7 operatories"
    echo "- 8 services"
    echo "- 8 patients"
    echo "- 5 patient insurance records"
    echo "- 10 appointments"
    echo "- 12 appointment services"
    echo "- 2 production log entries"
    echo "-------------------------------------------"
else
    echo "Error: Failed to insert sample data."
    echo "Please check the PostgreSQL connection parameters and try again."
    exit 1
fi

echo "Sample data insertion complete."
