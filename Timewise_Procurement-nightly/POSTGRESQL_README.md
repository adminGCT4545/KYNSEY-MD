# PostgreSQL Setup and Usage

This document provides information about the PostgreSQL database setup for the Procurement Dashboard project.

## Environment Configuration

The PostgreSQL connection is configured using the following environment variables in the `.env` file:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=timewise_procument
PGPORT=5432
```

## Connection Scripts

### Shell Script

You can connect to the PostgreSQL database using the provided shell script:

```bash
./connect-postgres.sh
```

This script loads the environment variables from the `.env` file and connects to the PostgreSQL database using the `psql` command-line tool.

### Node.js Connection

Two Node.js scripts are provided to test the PostgreSQL connection:

1. `test-postgres-connection.js` - A simple script that connects to the database and displays the PostgreSQL version.
2. `test-db-functionality.js` - A comprehensive script that tests database functionality including:
   - Creating a table
   - Inserting data
   - Querying data

To run these scripts:

```bash
node test-postgres-connection.js
node test-db-functionality.js
```

## Database Schema

The database `timewise_procument` is set up with the following test table:

```sql
CREATE TABLE IF NOT EXISTS test_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

If you encounter connection issues, verify:

1. PostgreSQL service is running: `sudo systemctl status postgresql`
2. Environment variables are correctly set in the `.env` file
3. PostgreSQL user has appropriate permissions
4. PostgreSQL is configured to allow password authentication

To restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

To view PostgreSQL logs:

```bash
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```
