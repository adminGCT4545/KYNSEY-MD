#!/bin/bash

# Use environment variables from .env
source .env

# Export as environment variables for psql
export PGPASSWORD=$PGPASSWORD

echo "=== Data in suppliers table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM suppliers LIMIT 5;"

echo "=== Data in supplier_performance table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_performance LIMIT 5;"

echo "=== Data in supplier_communications table ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_communications LIMIT 5;"

# Reset password environment variable for security
unset PGPASSWORD
