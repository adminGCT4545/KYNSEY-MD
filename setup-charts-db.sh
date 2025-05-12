#!/bin/bash

# KYNSEY MD - Medical Charts Database Setup Script
# This script sets up the database for the medical charts component testing

echo "===== KYNSEY MD Medical Charts Database Setup ====="

# Default connection parameters - adjust if needed
export PGHOST=${PGHOST:-"localhost"}
export PGUSER=${PGUSER:-"postgres"}
export PGPASSWORD=${PGPASSWORD:-"postgres"}
export PGPORT=${PGPORT:-"5432"}
export PGDATABASE="postgres"

# Step 1: Create the database if it doesn't exist
echo "Creating kynsey_md database if it doesn't exist..."
createdb -h $PGHOST -U $PGUSER kynsey_md 2>/dev/null || echo "Database may already exist, continuing..."

# Switch to the kynsey_md database for all subsequent operations
export PGDATABASE="kynsey_md"

# Step 2: Create basic tables
echo "Creating medical tables from setup-medical-db.sql..."
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f setup-medical-db.sql

if [ $? -eq 0 ]; then
  echo "✓ Basic medical tables created successfully"
else
  echo "⚠️ Some errors occurred when creating basic tables - proceeding anyway"
fi

# Step 3: Insert sample data
echo "Inserting sample data from insert-medical-sample-data.sql..."
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f insert-medical-sample-data.sql

if [ $? -eq 0 ]; then
  echo "✓ Sample data inserted successfully"
else
  echo "⚠️ Some errors occurred when inserting sample data - proceeding anyway"
fi

# Step 4: Create chart tables and insert chart sample data
echo "Creating chart tables and sample data from create-chart-tables-and-sample-data.sql..."
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f create-chart-tables-and-sample-data.sql

if [ $? -eq 0 ]; then
  echo "✓ Chart tables and sample data created successfully"
else
  echo "⚠️ Some errors occurred when creating chart tables - check permissions"
fi

echo "===== Database setup completed ====="

# Check if the vital signs table exists (our key table for charts)
echo "Testing database connectivity for medical charts tables..."
VITAL_SIGNS_EXISTS=$(psql -h $PGHOST -U $PGUSER -d $PGDATABASE -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medical_vital_signs');" | tr -d '[:space:]')
if [ "$VITAL_SIGNS_EXISTS" = "t" ]; then
  echo "✓ Vital signs table exists and is accessible"
else
  echo "✗ Vital signs table does not exist or is not accessible"
fi

# Start the server to test the components
echo "===== Starting the medical server for component testing ====="
echo "The server will be available at http://localhost:8888"
echo "Press Ctrl+C to stop when finished testing"
cd /home/instance-04/Documents/GCT/KYNSEY-MD-nightly && ./start-medical-server.sh