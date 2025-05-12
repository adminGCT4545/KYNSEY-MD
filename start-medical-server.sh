#!/bin/bash
# KYNSEY MD - Medical ERP Server Startup Script
# This script ensures the PostgreSQL database is ready and starts the medical server

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_NAME="kynsey_md_db"
DB_USER="kynsey_app"
DB_PASSWORD="kynsey_secure_password"

echo "========================================="
echo "KYNSEY MD Medical ERP Server"
echo "========================================="

# Ensure the PostgreSQL connection check script is executable
PG_CHECK_SCRIPT="$SCRIPT_DIR/check-postgres-connection.sh"
if [ -f "$PG_CHECK_SCRIPT" ]; then
    echo "Making PostgreSQL connection check script executable..."
    chmod +x "$PG_CHECK_SCRIPT"
    echo "✓ PostgreSQL connection check script is now executable"
fi

# Check if PostgreSQL is running
echo "Checking PostgreSQL server status..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✓ PostgreSQL is running"
else
    echo "✗ PostgreSQL is not running"
    echo "Starting PostgreSQL service..."
    sudo service postgresql start || sudo systemctl start postgresql
    
    # Wait for PostgreSQL to start
    for i in {1..10}; do
        if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            echo "✓ PostgreSQL started successfully"
            break
        fi
        if [ "$i" -eq 10 ]; then
            echo "✗ Failed to start PostgreSQL. Please check your installation."
            exit 1
        fi
        echo "Waiting for PostgreSQL to start... ($i/10)"
        sleep 2
    done
fi

# Check if our database exists
echo "Checking if KYNSEY MD database exists..."
if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U $DB_USER -d $DB_NAME -c '\q' > /dev/null 2>&1; then
    echo "✓ KYNSEY MD database exists"
else
    echo "✗ KYNSEY MD database not found"
    echo "Running database integration script to set up the database..."
    bash "$SCRIPT_DIR/integrate-medical-postgres.sh"
fi

# Now that we've ensured the database is ready, start the server
echo "Starting KYNSEY MD Medical server..."

# Export database connection environment variables for the server
export KYNSEY_DB_HOST="localhost"
export KYNSEY_DB_PORT="5432"
export KYNSEY_DB_NAME="$DB_NAME"
export KYNSEY_DB_USER="$DB_USER"
export KYNSEY_DB_PASSWORD="$DB_PASSWORD"

# Check if we have Node.js
if command -v node > /dev/null; then
    echo "✓ Node.js is installed"
else
    echo "✗ Node.js not found. Please install Node.js to run the server."
    exit 1
fi

# Change to the backend directory
cd "$SCRIPT_DIR/backend" || exit 1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Start the server
echo "========================================="
echo "Starting KYNSEY MD server..."
echo "The server will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo "========================================="

# Start the server
node src/server.js
