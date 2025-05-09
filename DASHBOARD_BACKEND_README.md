# Dashboard Backend for TimeWise Procurement Dashboard

This document provides an overview of the dashboard backend implementation that connects to a PostgreSQL database.

## Overview

The dashboard backend provides API endpoints for the TimeWise Procurement Dashboard. It connects to a PostgreSQL database to fetch supplier data, purchase orders, and statistics.

## Features

- PostgreSQL database connection with fallback to mock data if connection fails
- RESTful API endpoints for dashboard data
- Data transformation for frontend consumption
- Error handling and logging

## Setup

1. Configure PostgreSQL credentials in the `.env` file:
   ```
   PGHOST=localhost
   PGUSER=your_postgres_username
   PGPASSWORD=your_postgres_password
   PGDATABASE=timewise_procurement
   PGPORT=5432
   ```

2. Run the database setup script:
   ```bash
   ./connect-postgres.sh
   ```

3. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## API Endpoints

The backend provides the following API endpoints:

### Dashboard Endpoints

- `GET /api/dashboard/test` - Test if the dashboard API is working
- `GET /api/dashboard/suppliers` - Get all suppliers
- `GET /api/dashboard/purchase-orders` - Get all purchase orders with optional filtering
  - Query parameters:
    - `year` (optional) - Filter by year
    - `supplierId` (optional) - Filter by supplier ID
    - `limit` (optional) - Limit the number of results (default: 100)
- `GET /api/dashboard/upcoming` - Get upcoming deliveries
  - Query parameters:
    - `count` (optional) - Number of deliveries to return (default: 5)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/years` - Get available years in the data

### General Endpoints

- `GET /api/test` - Test if the backend server is running
- `POST /api/query` - Execute a custom SQL query (requires text and optional params in the request body)

## Database Schema

The database consists of the following tables:

### suppliers

- `supplier_id` (INTEGER, PRIMARY KEY) - Supplier ID
- `supplier_name` (VARCHAR) - Supplier name

### procurement_schedules

- `supplier_id` (INTEGER, PRIMARY KEY, REFERENCES suppliers) - Supplier ID
- `scheduled_delivery` (TIME) - Scheduled delivery time
- `default_delay_days` (INTEGER) - Default delay in days

### purchase_orders

- `order_id` (SERIAL, PRIMARY KEY) - Order ID
- `supplier_id` (INTEGER, REFERENCES suppliers) - Supplier ID
- `supplier_location` (VARCHAR) - Supplier location
- `delivery_location` (VARCHAR) - Delivery location
- `order_date` (DATE) - Order date
- `priority` (VARCHAR) - Priority level (High, Medium, Low)
- `total_items` (INTEGER) - Total items ordered
- `fulfilled_items` (INTEGER) - Number of fulfilled items
- `is_delayed` (BOOLEAN) - Whether the order is delayed
- `cost` (DECIMAL) - Cost of this purchase order

## Implementation Details

### Backend Structure

- `backend/server.js` - Main server file with Express setup and PostgreSQL connection
- `backend/routes/dashboard.js` - Dashboard API routes
- `backend/models/supplierModel.js` - Database queries and data transformation

### Frontend Integration

- `src/services/dataService.ts` - Service for fetching and transforming data from the backend
- `src/services/dbService.ts` - Service for making database queries through the backend API
- `vite.config.ts` - Proxy configuration for API requests

## Troubleshooting

If you encounter issues with the PostgreSQL connection:

1. Verify that your PostgreSQL server is running
2. Check that the database exists
3. Ensure your credentials in the `.env` file are correct
4. Check the backend logs for specific error messages

If the database connection fails, the backend will fall back to using mock data, so the dashboard will still function with limited data.
