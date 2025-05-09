#!/bin/bash

# Use environment variables from .env
source .env

# Export as environment variables for psql
export PGPASSWORD=$PGPASSWORD

echo "=== Creating missing tables ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f create_missing_tables.sql

echo "=== Checking all supplier tables after creation ==="
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\dt supplier*"

# Reset password environment variable for security
unset PGPASSWORD
