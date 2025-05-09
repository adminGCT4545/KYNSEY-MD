#!/bin/bash

# KYNSEY MD - Medical ERP Server Startup Script
# This script starts the backend server for the KYNSEY MD Medical ERP system

# Set environment variables
export PORT=8888
export PGHOST=${PGHOST:-"localhost"}
export PGUSER=${PGUSER:-"postgres"}
export PGPASSWORD=${PGPASSWORD:-"postgres"}
export PGDATABASE=${PGDATABASE:-"timewise_procument"}
export PGPORT=${PGPORT:-"5432"}

# Display server information
echo "Starting KYNSEY MD Medical ERP Backend Server"
echo "--------------------------------------------"
echo "Server Port: $PORT"
echo "Database Host: $PGHOST"
echo "Database User: $PGUSER"
echo "Database Name: $PGDATABASE"
echo "Database Port: $PGPORT"
echo "--------------------------------------------"

# Navigate to the backend directory and start the server
cd backend
echo "Starting server..."
node src/server.js

# This script will keep running until the server is stopped
