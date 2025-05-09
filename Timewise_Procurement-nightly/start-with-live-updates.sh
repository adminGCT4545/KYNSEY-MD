#!/bin/bash

# Comprehensive start script for BOOKSL Train System with live updates

# Check if PostgreSQL is running
pg_status=$(sudo service postgresql status | grep "active (running)")
if [ -z "$pg_status" ]; then
  echo "PostgreSQL is not running. Starting PostgreSQL..."
  sudo service postgresql start
  sleep 2
fi

# Set up the database if it doesn't exist
echo "Setting up the database..."
./setup-database.sh

# Set up live updates
echo "Setting up live updates..."
./setup-live-updates.sh

# Start the backend server in the background
echo "Starting the backend server..."
cd backend && node src/server.js &
BACKEND_PID=$!

# Wait for the backend to start
echo "Waiting for the backend to start..."
sleep 5

# Start the frontend in the background
echo "Starting the frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

# Wait for the frontend to start
echo "Waiting for the frontend to start..."
sleep 5

echo "BOOKSL Train System is now running with live updates!"
echo "Backend server is running on http://localhost:8888"
echo "Frontend is running on http://localhost:5174"
echo ""
echo "To test live updates, open a new terminal and run:"
echo "./test-live-updates.sh"
echo ""
echo "Press Ctrl+C to stop all services."

# Handle cleanup on exit
cleanup() {
  echo "Shutting down..."
  kill $FRONTEND_PID
  kill $BACKEND_PID
  echo "Services stopped."
  exit 0
}

trap cleanup SIGINT

# Keep the script running
while true; do
  sleep 1
done
