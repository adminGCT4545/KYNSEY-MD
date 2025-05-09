#!/bin/bash

# Use environment variables from .env
source .env

# Export as environment variables for psql
export PGPASSWORD=$PGPASSWORD

echo "=== Creating and populating supplier tables ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f create_supplier_tables.sql

echo "=== Verifying tables ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\dt supplier*"

echo "=== Sample data from supplier_contracts ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_contracts LIMIT 3;"

echo "=== Sample data from supplier_risk_assessments ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_risk_assessments LIMIT 3;"

echo "=== Sample data from supplier_certifications ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_certifications LIMIT 3;"

echo "=== Sample data from supplier_performance ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_performance LIMIT 3;"

# Reset password environment variable for security
unset PGPASSWORD
