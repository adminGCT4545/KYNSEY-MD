#!/bin/bash

# Use environment variables from .env
source .env

# Export as environment variables for psql
export PGPASSWORD=$PGPASSWORD

echo "=== Fixing supplier_performance table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f fix_supplier_performance.sql

echo "=== Checking supplier_performance structure ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\d supplier_performance"

echo "=== Sample data from supplier_performance ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_performance LIMIT 3;"

# Reset password environment variable for security
unset PGPASSWORD
