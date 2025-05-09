-- Membership Program Database Schema
-- Created: May 1, 2025

SET search_path TO test2;

-- Set timezone to ensure consistency in timestamp data
SET timezone = 'America/Chicago';

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS membership_types CASCADE;

-- Create enum types for status values
CREATE TYPE member_status AS ENUM ('active', 'expiring', 'expired', 'suspended', 'cancelled');
CREATE TYPE activity_type AS ENUM ('event_attendance', 'purchase', 'referral', 'login', 'webinar', 'volunteer', 'renewal');

-- Membership Types Table
CREATE TABLE membership_types (
    type_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
    type_name VARCHAR(20) UNIQUE NOT NULL,
    monthly_fee DECIMAL(10, 2) NOT NULL CHECK (monthly_fee >= 0),
    annual_fee DECIMAL(10, 2) CHECK (annual_fee >= 0),
    signup_fee DECIMAL(10, 2) DEFAULT 0 CHECK (signup_fee >= 0),
    benefits TEXT,
    points_multiplier DECIMAL(3, 2) DEFAULT 1.00 CHECK (points_multiplier > 0),
    max_family_members SMALLINT DEFAULT 1 CHECK (max_family_members > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index on type_name for faster lookups
CREATE INDEX idx_membership_type_name ON membership_types(type_name);

-- Add comments
COMMENT ON TABLE membership_types IS 'Stores different membership tiers and their associated benefits and costs';
COMMENT ON COLUMN membership_types.type_id IS 'Primary key for membership types';
COMMENT ON COLUMN membership_types.type_name IS 'Name of the membership tier (e.g., standard, premium, family)';
COMMENT ON COLUMN membership_types.monthly_fee IS 'Monthly subscription cost for this membership tier';
COMMENT ON COLUMN membership_types.annual_fee IS 'Annual subscription cost for this membership tier (can be null if monthly only)';
COMMENT ON COLUMN membership_types.benefits IS 'Description of benefits included with this tier';
COMMENT ON COLUMN membership_types.points_multiplier IS 'Multiplier for points earned by members of this tier';
COMMENT ON COLUMN membership_types.max_family_members IS 'Maximum number of family members allowed for family plans';

-- Members Table
CREATE TABLE members (
    member_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(20),
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'United States',
    membership_type VARCHAR(20) NOT NULL REFERENCES membership_types(type_name) ON UPDATE CASCADE,
    join_date DATE NOT NULL,
    expiration_date DATE NOT NULL CHECK (expiration_date > join_date),
    status member_status NOT NULL DEFAULT 'active',
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    last_login TIMESTAMP,
    referral_source VARCHAR(50),
    referred_by INTEGER REFERENCES members(member_id),
    is_primary_account BOOLEAN DEFAULT TRUE,
    primary_account_id INTEGER REFERENCES members(member_id),
    birthdate DATE,
    email_opt_in BOOLEAN DEFAULT TRUE,
    sms_opt_in BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    reset_token VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_member_email ON members(email);
CREATE INDEX idx_member_status ON members(status);
CREATE INDEX idx_member_expiration ON members(expiration_date);
CREATE INDEX idx_member_type ON members(membership_type);
CREATE INDEX idx_member_name ON members(last_name, first_name);
CREATE INDEX idx_member_referral ON members(referred_by);
CREATE INDEX idx_member_primary_account ON members(primary_account_id);

-- Add comments
COMMENT ON TABLE members IS 'Stores all member information including personal details, membership status, and engagement metrics';
COMMENT ON COLUMN members.member_id IS 'Primary key for member identification';
COMMENT ON COLUMN members.email IS 'Unique email address used for account identification and communication';
COMMENT ON COLUMN members.membership_type IS 'References membership_types.type_name for the tier of this member';
COMMENT ON COLUMN members.join_date IS 'Date when the member initially joined';
COMMENT ON COLUMN members.expiration_date IS 'Date when the current membership period expires';
COMMENT ON COLUMN members.status IS 'Current status of the membership (active, expiring, expired, etc.)';
COMMENT ON COLUMN members.points IS 'Loyalty points accumulated by the member';
COMMENT ON COLUMN members.referred_by IS 'References another member who referred this member';
COMMENT ON COLUMN members.is_primary_account IS 'Indicates if this is a primary account (for family memberships)';
COMMENT ON COLUMN members.primary_account_id IS 'References the primary account for family sub-accounts';

-- Activity Log Table
CREATE TABLE activity_log (
    log_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    activity_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    amount_spent DECIMAL(10, 2) CHECK (amount_spent IS NULL OR amount_spent >= 0),
    location VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for analytics queries
CREATE INDEX idx_activity_member ON activity_log(member_id);
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_date ON activity_log(activity_date);

-- Add comments
COMMENT ON TABLE activity_log IS 'Tracks all member activities and engagement for points allocation and analytics';
COMMENT ON COLUMN activity_log.member_id IS 'References the member who performed the activity';
COMMENT ON COLUMN activity_log.activity_type IS 'Type of activity performed (event, purchase, login, etc.)';
COMMENT ON COLUMN activity_log.activity_date IS 'Date and time when the activity occurred';
COMMENT ON COLUMN activity_log.points_earned IS 'Number of points earned from this activity';
COMMENT ON COLUMN activity_log.amount_spent IS 'Optional field for tracking purchase amounts';
COMMENT ON COLUMN activity_log.location IS 'Optional field for tracking where the activity took place';

-- Create a view for member status monitoring (expiring soon)
CREATE OR REPLACE VIEW expiring_memberships AS
SELECT 
    member_id, 
    first_name, 
    last_name, 
    email, 
    phone,
    membership_type, 
    join_date, 
    expiration_date,
    status,
    (expiration_date - CURRENT_DATE) AS days_remaining
FROM 
    members
WHERE 
    status = 'active' 
    AND expiration_date < (CURRENT_DATE + INTERVAL '30 days')
ORDER BY 
    expiration_date ASC;

-- Create a view for member engagement analysis
CREATE OR REPLACE VIEW member_engagement AS
SELECT 
    m.member_id,
    m.first_name,
    m.last_name,
    m.email,
    m.membership_type,
    m.join_date,
    m.status,
    m.points,
    COUNT(al.log_id) AS total_activities,
    MAX(al.activity_date) AS latest_activity,
    (CURRENT_DATE - MAX(al.activity_date::date)) AS days_since_last_activity,
    SUM(CASE WHEN al.activity_type = 'purchase' THEN al.amount_spent ELSE 0 END) AS total_spent,
    COUNT(CASE WHEN al.activity_type = 'event_attendance' THEN 1 END) AS events_attended,
    COUNT(CASE WHEN al.activity_type = 'referral' THEN 1 END) AS referrals_made
FROM 
    members m
LEFT JOIN 
    activity_log al ON m.member_id = al.member_id
GROUP BY 
    m.member_id,
    m.first_name,
    m.last_name,
    m.email,
    m.membership_type,
    m.join_date,
    m.status,
    m.points
ORDER BY 
    total_activities DESC;

-- Create triggers to automatically update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_member_modtime
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_membership_type_modtime
    BEFORE UPDATE ON membership_types
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Create a function to automatically update member status based on expiration date
CREATE OR REPLACE FUNCTION update_member_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If expiration date is within 30 days, set status to 'expiring'
    IF NEW.expiration_date < (CURRENT_DATE + INTERVAL '30 days') AND NEW.expiration_date >= CURRENT_DATE THEN
        NEW.status = 'expiring';
    -- If expiration date has passed, set status to 'expired'
    ELSIF NEW.expiration_date < CURRENT_DATE THEN
        NEW.status = 'expired';
    -- Otherwise, ensure status is 'active' unless manually set otherwise
    ELSIF NEW.status = 'expired' OR NEW.status = 'expiring' THEN
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_member_expiration
    BEFORE INSERT OR UPDATE OF expiration_date ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_member_status();

-- Sample data insert statements would go here
-- (As provided in the previous artifact)
