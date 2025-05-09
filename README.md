# BOOKSL Train System

## Overview

The BOOKSL Train System is a comprehensive train management solution that integrates:
- Dashboard for train management and analytics with live updates
- PostgreSQL database for data storage
- OAuth2 authentication for secure access
- Real-time data updates from the database to the dashboard

## Server Consolidation

The project has been consolidated to use a single server implementation. The consolidated server file is:

- `backend/src/server.js`

This consolidated server now includes:
1. The main backend server (port 8888)
2. OAuth2 authentication functionality
3. Dashboard API endpoints with PostgreSQL integration
4. Frontend proxy configuration (Vite server on port 5174)

## Starting the Server

You can start the server using one of the following methods:

### Method 1: Using the comprehensive start script with live updates

```bash
./start-with-live-updates.sh
```

This script will:
1. Set up the database if it doesn't exist
2. Set up the live updates feature
3. Start the backend server
4. Start the frontend
5. Provide instructions for testing live updates

### Method 2: Using the standard start script

```bash
./start-server.sh
```

### Method 3: Using npm from the backend directory

```bash
cd backend
npm run dev
```

The server will start on port 8888 by default (or the port specified in your .env file).

## PostgreSQL Connection

The consolidated server connects to PostgreSQL using the credentials specified in the `.env` file. Make sure your PostgreSQL server is running and the credentials in the `.env` file are correct.

You can test the PostgreSQL connection by running:

```bash
./connect-postgres.sh
```

To set up the database with the required tables and sample data, run:

```bash
./setup-database.sh
```

## Server Features

The consolidated server provides the following features:

### Dashboard Features
- Train management and tracking
- Journey analytics and statistics with live updates
- Schedule management
- Revenue tracking and analysis
- Occupancy rate monitoring
- Real-time data updates using Server-Sent Events (SSE)

### Authentication
- OAuth2 authentication
- Token-based access control
- Secure API endpoints

### Database Features
- PostgreSQL integration
- Direct database query endpoint
- Data transformation for frontend consumption

## API Endpoints

### Dashboard Endpoints
- `GET /api/dashboard/test` - Test if the dashboard API is working
- `GET /api/dashboard/trains` - Get all trains
- `GET /api/dashboard/journeys` - Get train journeys with optional filtering
- `GET /api/dashboard/upcoming` - Get upcoming train departures
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/years` - Get available years in the data
- `GET /api/live-updates` - Server-Sent Events endpoint for real-time updates

### Authentication Endpoints
- `POST /oauth/token` - Authenticate and get access token

### General Endpoints
- `GET /` - Basic endpoint to check if the server is running
- `GET /api/test` - Test if the API is working
- `GET /api/connection-status` - Check if SQL directory is active
- `POST /api/query` - Execute a custom SQL query

## Frontend Configuration

The frontend (Vite) server is configured to proxy all API requests to the consolidated server. The frontend runs on port 5174 and can be started with:

```bash
npm run dev
```

The frontend includes:
- Main dashboard interface
- Train management interface
- Analytics and reporting tools

## Data Model

The database consists of the following tables:

### trains
- `train_id` (INTEGER, PRIMARY KEY) - Train ID
- `train_name` (VARCHAR) - Train name

### train_schedules
- `train_id` (INTEGER, PRIMARY KEY, REFERENCES trains) - Train ID
- `scheduled_time` (TIME) - Scheduled departure time
- `default_delay_minutes` (INTEGER) - Default delay in minutes

### train_journeys
- `journey_id` (SERIAL, PRIMARY KEY) - Journey ID
- `train_id` (INTEGER, REFERENCES trains) - Train ID
- `departure_city` (VARCHAR) - Departure city
- `arrival_city` (VARCHAR) - Arrival city
- `journey_date` (DATE) - Journey date
- `class` (VARCHAR) - Travel class (First, Second, Third)
- `total_seats` (INTEGER) - Total seats available
- `reserved_seats` (INTEGER) - Number of reserved seats
- `is_delayed` (BOOLEAN) - Whether the train is delayed
- `revenue` (DECIMAL) - Revenue generated from this journey

## Live Updates Feature

The BOOKSL Train System now includes a real-time live updates feature that ensures the dashboard data is always up-to-date with the PostgreSQL database. This feature uses PostgreSQL's notification system and Server-Sent Events (SSE) to push updates to the frontend in real-time.

### Setting Up Live Updates

To enable the live updates feature, run the setup script:

```bash
./setup-live-updates.sh
```

This script will:
1. Create PostgreSQL triggers and functions that send notifications when data changes
2. Set up the notification channels for train, schedule, and journey changes

### How Live Updates Work

1. **Database Triggers**: When data in the PostgreSQL database changes (INSERT, UPDATE, DELETE), triggers fire and send notifications through PostgreSQL's notification system.
2. **Backend Listener**: The backend server listens for these notifications and forwards them to connected clients using Server-Sent Events (SSE).
3. **Frontend Updates**: The frontend subscribes to these events and automatically updates the dashboard when data changes.

### Benefits of Live Updates

- Real-time data visualization without manual refreshing
- Immediate visibility of train delays, schedule changes, and new journeys
- Improved operational awareness with up-to-date analytics
- Better decision-making with current data

### Testing Live Updates

To test the live updates feature, you can use the provided test script:

```bash
./test-live-updates.sh
```

This script will:
1. Make random changes to the database (updating train journeys and schedules)
2. Demonstrate how the dashboard updates in real-time without refreshing
3. Run continuously until stopped with Ctrl+C

To see the live updates in action:
1. Start the backend server: `cd backend && node src/server.js`
2. Start the frontend: `npm run dev`
3. Open the dashboard in your browser
4. Run the test script in a separate terminal: `./test-live-updates.sh`
5. Watch as the dashboard updates automatically when database changes occur

## Troubleshooting

### PostgreSQL Connection Issues
If you encounter issues with the PostgreSQL connection:

1. Verify that your PostgreSQL server is running:
   ```bash
   sudo service postgresql status
   ```

2. Check that the database exists:
   ```bash
   psql -U your_postgres_username -l
   ```

3. Ensure your credentials in the `.env` file are correct

4. Check the backend logs for specific error messages

If the database connection fails, the backend will fall back to using mock data, so the dashboard will still function with limited data.

## Development

### Frontend Development
The frontend is built with React and TypeScript. To start the development server:

```bash
npm run dev
```

### Backend Development
The backend is built with Express.js. To start the development server:

```bash
cd backend
npm run dev
```

### Testing
To run the tests:

```bash
npm test
# Timewise_Procurement
