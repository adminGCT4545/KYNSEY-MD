-- Create membership table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'United States',
    membership_type VARCHAR(20) NOT NULL,
    join_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    points INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    referral_source VARCHAR(50),
    notes TEXT
);

-- Insert 25 sample members
INSERT INTO members (
    first_name, last_name, email, phone, 
    address_line1, address_line2, city, state, postal_code, country,
    membership_type, join_date, expiration_date, status, points, 
    last_login, referral_source, notes
) VALUES
    ('John', 'Smith', 'john.smith@example.com', '512-555-1234', 
     '123 Main St', 'Apt 4B', 'Austin', 'TX', '78660', 'United States', 
     'premium', '2024-01-15', '2025-01-15', 'active', 750, 
     '2025-04-28 14:22:36', 'website', 'Interested in weekend events'),
    
    ('Maria', 'Garcia', 'maria.garcia@example.com', '512-555-2345', 
     '456 Oak Ave', NULL, 'Pflugerville', 'TX', '78660', 'United States', 
     'standard', '2024-02-20', '2025-02-20', 'active', 320, 
     '2025-04-29 09:15:22', 'friend', 'Prefers email communications'),
    
    ('Robert', 'Johnson', 'robert.j@example.com', '512-555-3456', 
     '789 Pine St', 'Suite 101', 'Round Rock', 'TX', '78664', 'United States', 
     'premium', '2023-11-10', '2024-11-10', 'active', 1250, 
     '2025-04-30 16:45:10', 'social_media', NULL),
    
    ('Jennifer', 'Williams', 'jen.w@example.com', '512-555-4567', 
     '321 Cedar Rd', NULL, 'Austin', 'TX', '78745', 'United States', 
     'standard', '2024-03-05', '2025-03-05', 'active', 180, 
     '2025-04-25 11:30:45', 'website', 'Interested in family activities'),
    
    ('Michael', 'Brown', 'michael.b@example.com', '512-555-5678', 
     '654 Elm St', 'Apt 12C', 'Pflugerville', 'TX', '78660', 'United States', 
     'premium', '2024-01-30', '2025-01-30', 'active', 890, 
     '2025-04-29 20:18:33', 'event', NULL),
    
    ('Lisa', 'Davis', 'lisa.davis@example.com', '512-555-6789', 
     '987 Maple Dr', NULL, 'Austin', 'TX', '78723', 'United States', 
     'standard', '2023-12-12', '2024-12-12', 'active', 450, 
     '2025-04-27 08:45:12', 'friend', 'Prefers text messages'),
    
    ('David', 'Miller', 'david.m@example.com', '512-555-7890', 
     '147 Birch Ln', 'Unit 3', 'Round Rock', 'TX', '78665', 'United States', 
     'premium', '2024-03-18', '2025-03-18', 'active', 620, 
     '2025-04-30 13:20:55', 'website', NULL),
    
    ('Sarah', 'Wilson', 'sarah.w@example.com', '512-555-8901', 
     '258 Willow Way', NULL, 'Pflugerville', 'TX', '78660', 'United States', 
     'standard', '2023-10-05', '2024-10-05', 'expiring', 710, 
     '2025-04-15 17:30:20', 'social_media', 'Send renewal reminder'),
    
    ('James', 'Taylor', 'james.t@example.com', '512-555-9012', 
     '369 Spruce St', 'Apt 7D', 'Austin', 'TX', '78744', 'United States', 
     'premium', '2024-02-28', '2025-02-28', 'active', 1100, 
     '2025-04-28 19:10:45', 'referral', 'VIP member'),
    
    ('Emma', 'Anderson', 'emma.a@example.com', '512-555-0123', 
     '470 Aspen Ct', NULL, 'Round Rock', 'TX', '78664', 'United States', 
     'standard', '2024-01-22', '2025-01-22', 'active', 280, 
     '2025-04-26 10:05:33', 'website', NULL),
    
    ('Thomas', 'Martinez', 'thomas.m@example.com', '512-556-1234', 
     '581 Hickory St', NULL, 'Austin', 'TX', '78748', 'United States', 
     'premium', '2023-09-15', '2024-09-15', 'expiring', 970, 
     '2025-04-20 14:50:18', 'friend', 'Considering upgrade to family plan'),
    
    ('Patricia', 'Thompson', 'patricia.t@example.com', '512-556-2345', 
     '692 Chestnut Ave', 'Suite 5', 'Pflugerville', 'TX', '78660', 'United States', 
     'family', '2024-03-10', '2025-03-10', 'active', 520, 
     '2025-04-29 16:25:40', 'event', 'Family of 4'),
    
    ('Christopher', 'White', 'chris.w@example.com', '512-556-3456', 
     '703 Walnut Blvd', NULL, 'Round Rock', 'TX', '78665', 'United States', 
     'standard', '2023-11-28', '2024-11-28', 'active', 390, 
     '2025-04-28 11:40:15', 'website', NULL),
    
    ('Jessica', 'Harris', 'jessica.h@example.com', '512-556-4567', 
     '814 Sycamore Dr', 'Apt 10B', 'Austin', 'TX', '78741', 'United States', 
     'family', '2024-02-14', '2025-02-14', 'active', 680, 
     '2025-04-30 09:55:22', 'referral', 'Family of 3'),
    
    ('Daniel', 'Clark', 'daniel.c@example.com', '512-556-5678', 
     '925 Cypress Ln', NULL, 'Pflugerville', 'TX', '78660', 'United States', 
     'standard', '2023-10-20', '2024-10-20', 'expiring', 240, 
     '2025-04-10 15:35:48', 'social_media', 'Send renewal reminder'),
    
    ('Ashley', 'Lewis', 'ashley.l@example.com', '512-556-6789', 
     '136 Redwood Rd', 'Unit 8', 'Round Rock', 'TX', '78664', 'United States', 
     'premium', '2024-01-05', '2025-01-05', 'active', 870, 
     '2025-04-29 13:15:30', 'website', NULL),
    
    ('Matthew', 'Lee', 'matthew.l@example.com', '512-556-7890', 
     '247 Magnolia St', NULL, 'Austin', 'TX', '78722', 'United States', 
     'standard', '2023-12-01', '2024-12-01', 'active', 410, 
     '2025-04-27 17:20:12', 'friend', 'Interested in outdoor events'),
    
    ('Elizabeth', 'Walker', 'elizabeth.w@example.com', '512-556-8901', 
     '358 Juniper Ave', 'Apt 2A', 'Pflugerville', 'TX', '78660', 'United States', 
     'family', '2024-03-22', '2025-03-22', 'active', 590, 
     '2025-04-30 10:40:55', 'event', 'Family of 5'),
    
    ('Ryan', 'Hall', 'ryan.h@example.com', '512-556-9012', 
     '469 Hemlock Ct', NULL, 'Round Rock', 'TX', '78665', 'United States', 
     'standard', '2023-11-15', '2024-11-15', 'active', 320, 
     '2025-04-25 14:30:18', 'website', NULL),
    
    ('Nicole', 'Young', 'nicole.y@example.com', '512-557-0123', 
     '570 Fir Dr', 'Suite 12', 'Austin', 'TX', '78749', 'United States', 
     'premium', '2024-02-08', '2025-02-08', 'active', 760, 
     '2025-04-28 18:50:33', 'social_media', 'Prefers weekend events'),
    
    ('Brandon', 'King', 'brandon.k@example.com', '512-557-1234', 
     '681 Locust Ln', NULL, 'Pflugerville', 'TX', '78660', 'United States', 
     'standard', '2023-09-25', '2024-09-25', 'expired', 190, 
     '2025-03-15 09:10:45', 'friend', 'Contact about renewal'),
    
    ('Samantha', 'Wright', 'samantha.w@example.com', '512-557-2345', 
     '792 Dogwood St', 'Apt 15F', 'Round Rock', 'TX', '78664', 'United States', 
     'premium', '2024-01-18', '2025-01-18', 'active', 930, 
     '2025-04-29 15:25:10', 'website', NULL),
    
    ('Kevin', 'Lopez', 'kevin.l@example.com', '512-557-3456', 
     '803 Acorn Ave', NULL, 'Austin', 'TX', '78704', 'United States', 
     'family', '2023-12-20', '2024-12-20', 'active', 480, 
     '2025-04-27 12:15:38', 'event', 'Family of 2'),
    
    ('Stephanie', 'Hill', 'stephanie.h@example.com', '512-557-4567', 
     '914 Mulberry Dr', 'Unit 6', 'Pflugerville', 'TX', '78660', 'United States', 
     'standard', '2024-03-01', '2025-03-01', 'active', 270, 
     '2025-04-30 08:35:22', 'referral', NULL),
    
    ('Joshua', 'Scott', 'joshua.s@example.com', '512-557-5678', 
     '125 Pecan St', NULL, 'Round Rock', 'TX', '78665', 'United States', 
     'premium', '2023-10-10', '2024-10-10', 'expiring', 840, 
     '2025-04-18 16:40:15', 'social_media', 'Send renewal reminder');

-- Create a membership_types table for reference
CREATE TABLE membership_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(20) UNIQUE NOT NULL,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    benefits TEXT,
    points_multiplier DECIMAL(3, 2) DEFAULT 1.00
);

-- Insert membership types
INSERT INTO membership_types (type_name, monthly_fee, benefits, points_multiplier) VALUES
    ('standard', 9.99, 'Basic access to facilities, online resources', 1.00),
    ('premium', 19.99, 'Full access to facilities, priority booking, exclusive events', 1.50),
    ('family', 29.99, 'All premium benefits for up to 5 family members', 2.00);

-- Create activity log table to track member engagement
CREATE TABLE activity_log (
    log_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(member_id),
    activity_type VARCHAR(50) NOT NULL,
    activity_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    points_earned INTEGER DEFAULT 0,
    details TEXT
);

-- Sample activity data for a few members
INSERT INTO activity_log (member_id, activity_type, activity_date, points_earned, details) VALUES
    (1, 'event_attendance', '2025-04-15 18:00:00', 50, 'Spring Member Mixer'),
    (1, 'referral', '2025-03-20 14:30:00', 100, 'Referred new member Maria Garcia'),
    (3, 'purchase', '2025-04-22 10:15:00', 75, 'Pro Shop purchase - $150'),
    (5, 'event_attendance', '2025-04-15 18:00:00', 50, 'Spring Member Mixer'),
    (9, 'webinar', '2025-04-10 19:00:00', 25, 'Online workshop participation'),
    (12, 'event_attendance', '2025-04-15 18:00:00', 50, 'Spring Member Mixer'),
    (14, 'volunteer', '2025-04-05 09:00:00', 100, 'Community outreach program'),
    (17, 'purchase', '2025-04-18 15:45:00', 35, 'Cafe purchase - $70'),
    (20, 'webinar', '2025-04-10 19:00:00', 25, 'Online workshop participation'),
    (22, 'referral', '2025-04-02 11:20:00', 100, 'Referred new member Ryan Hall');
