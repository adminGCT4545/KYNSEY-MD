#!/bin/bash

# This script runs SQL scripts against the PostgreSQL database
# Usage: ./run-sql-script.sh <path-to-sql-file>

# Exit on error
set -e

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if a SQL file was provided
if [ -z "$1" ]; then
  echo "Error: No SQL file provided"
  echo "Usage: $0 <path-to-sql-file>"
  exit 1
fi

SQL_FILE="$1"

# Check if the SQL file exists
if [ ! -f "$SQL_FILE" ]; then
  echo "Error: SQL file '$SQL_FILE' not found"
  exit 1
fi

echo "Executing SQL file: $SQL_FILE"
echo "Using database: $PGDATABASE on $PGHOST:$PGPORT as $PGUSER"

# Execute the SQL file
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$SQL_FILE"

echo "SQL execution completed"