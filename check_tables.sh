#!/bin/bash

# Use environment variables from .env
source .env

# Export as environment variables for psql
export PGPASSWORD=$PGPASSWORD

# Query the database schema
echo "=== Checking supplier tables ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\dt supplier*"

echo "=== Checking columns in suppliers table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\d suppliers"

echo "=== Checking columns in supplier_performance table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\d supplier_performance"

echo "=== Checking columns in supplier_communications table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\d supplier_communications"

echo "=== Sample data from supplier_performance ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_performance LIMIT 3;"

# Check if expected tables exist
echo "=== Checking if expected tables exist ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'supplier_contracts');"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'supplier_risk_assessments');"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'supplier_performance_evaluations');"

# Reset password environment variable for security
unset PGPASSWORD
