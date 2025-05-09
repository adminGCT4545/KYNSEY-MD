#!/bin/bash

# Use environment variables from .env
source .env

# Export as environment variables for psql
export PGPASSWORD=$PGPASSWORD

# Query the database
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\dt supplier*"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM suppliers LIMIT 2;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_contracts LIMIT 2;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_risk_assessments LIMIT 2;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT * FROM supplier_performance_evaluations LIMIT 2;"

# Reset password environment variable for security
unset PGPASSWORD
