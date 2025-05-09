-- KYNSEY MD - Database Setup Script
-- This script creates a dedicated database and user for the KYNSEY MD application
-- Run as a PostgreSQL superuser (e.g., postgres)

-- Check if the user already exists and drop if needed
DO
$$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'kynsey_app') THEN
      RAISE NOTICE 'User kynsey_app already exists. Dropping user...';
      DROP ROLE kynsey_app;
   END IF;
END
$$;

-- Create the application user with password
CREATE USER kynsey_app WITH PASSWORD 'kynsey_secure_password';
COMMENT ON ROLE kynsey_app IS 'Application user for KYNSEY MD Medical ERP';

-- Check if the database already exists and drop if needed (be careful in production!)
DO
$$
BEGIN
   IF EXISTS (
      SELECT FROM pg_database
      WHERE datname = 'kynsey_md_db') THEN
      RAISE NOTICE 'Database kynsey_md_db already exists. Dropping database...';
      PERFORM pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = 'kynsey_md_db';
      DROP DATABASE kynsey_md_db;
   END IF;
END
$$;

-- Create the application database
CREATE DATABASE kynsey_md_db
    WITH 
    OWNER = kynsey_app
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database to set up permissions
\connect kynsey_md_db

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE kynsey_md_db TO kynsey_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO kynsey_app;

-- Grant privileges on future tables (important for migrations/setup scripts)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO kynsey_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO kynsey_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON FUNCTIONS TO kynsey_app;
