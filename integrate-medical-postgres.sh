#!/bin/bash
# KYNSEY MD - PostgreSQL Medical Database Integration Script
# This script orchestrates the complete setup and integration of the medical database with PostgreSQL

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_NAME="kynsey_md_db"
DB_USER="kynsey_app"
DB_PASSWORD="kynsey_secure_password"

echo "========================================="
echo "KYNSEY MD PostgreSQL Integration"
echo "========================================="

# Step 1: Create database and user
echo "[1/5] Creating database and user..."
sudo -u postgres psql -f "$SCRIPT_DIR/create-kynsey-md-database.sql"

# Step 2: Set up medical schema
echo "[2/5] Creating medical database schema..."
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/setup-medical-db.sql"

# Step 3: Insert sample data
echo "[3/5] Inserting sample data..."
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/insert-medical-sample-data.sql"

# Step 4: Create database views
echo "[4/5] Creating database views..."
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -f "$SCRIPT_DIR/create-medical-views.sql"

# Step 5: Verify setup
echo "[5/5] Verifying database setup..."
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -c "
  SELECT 'Database setup complete!' as status;
  SELECT table_name, (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
  FROM (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name LIKE 'medical_%'
  ) AS t
  ORDER BY table_name;"

echo "========================================="
echo "Integration complete! The KYNSEY MD database has been successfully set up."
echo "========================================="