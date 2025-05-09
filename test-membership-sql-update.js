// Test script to verify that adding a new member updates the membership.sql file
import memberModel from './backend/models/memberModel.js';

// Create a test member data
const testMember = {
  first_name: 'Test',
  last_name: 'User',
  email: 'test.user@example.com',
  phone: '512-555-9999',
  address_line1: '789 Test Ave',
  address_line2: 'Unit 42',
  city: 'Austin',
  state: 'TX',
  postal_code: '78701',
  country: 'United States',
  membership_type: 'premium',
  join_date: '2025-05-04',
  expiration_date: '2026-05-04',
  status: 'active',
  points: 50,
  referral_source: 'website',
  notes: 'Test user created via script'
};

// Async function to create the member
async function createTestMember() {
  try {
    console.log('Creating test member...');
    const result = await memberModel.createMember(testMember);
    console.log('Test member created successfully:', result);
    console.log('Check the membership.sql file to verify the SQL statement was appended');
  } catch (error) {
    console.error('Error creating test member:', error);
  }
}

// Execute the test
createTestMember();
