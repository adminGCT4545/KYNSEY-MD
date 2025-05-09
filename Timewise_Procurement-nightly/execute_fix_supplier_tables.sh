#!/bin/bash

# Script to execute the fix_supplier_tables.sql script
# Assumes psql is installed and database connection details are set via environment variables
# or available in the .env file

SQL_SCRIPT="fix_supplier_tables.sql"

# Source environment variables from .env file if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Use environment variables loaded from .env or defaults if not set
DB_NAME="${PGDATABASE:-timewise_procument}"
USERNAME="${PGUSER:-postgres}"

echo "Attempting to execute $SQL_SCRIPT on database $DB_NAME as user $USERNAME..."

# Execute the SQL script using psql
# The -f flag specifies the file to execute
# The -v ON_ERROR_STOP=1 ensures the script stops if any error occurs
psql -v ON_ERROR_STOP=1 -U "$USERNAME" -d "$DB_NAME" -f "$SQL_SCRIPT"

# Check the exit status of psql
if [ $? -eq 0 ]; then
  echo "SQL script $SQL_SCRIPT executed successfully."
else
  echo "Error executing SQL script $SQL_SCRIPT."
  exit 1 # Exit with an error code
fi

echo "Supplier tables have been fixed to match expected column names."

exit 0
