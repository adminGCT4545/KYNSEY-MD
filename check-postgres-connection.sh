#!/bin/bash

# This script checks if the PostgreSQL server is running and accessible
# It also tests the connection with the credentials from .env

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if PostgreSQL service is running
echo "Checking if PostgreSQL service is running..."
if command -v systemctl &> /dev/null && systemctl is-active --quiet postgresql; then
  echo "PostgreSQL service is running."
elif ps -ef | grep -v grep | grep postgres > /dev/null; then
  echo "PostgreSQL process is running."
else
  echo "Warning: PostgreSQL service does not appear to be running."
  echo "Please start the PostgreSQL service before continuing."
  exit 1
fi

# Test connection to PostgreSQL
echo "Testing connection to PostgreSQL database..."
if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "SELECT 1" > /dev/null 2>&1; then
  echo "Connection successful: PostgreSQL server at $PGHOST:$PGPORT is accessible with provided credentials."
else
  echo "Error: Could not connect to PostgreSQL server at $PGHOST:$PGPORT with the provided credentials."
  echo "Please check your PostgreSQL installation and .env file settings."
  exit 1
fi

# If we made it here, all checks passed
echo "All connection checks passed! PostgreSQL is ready for use."