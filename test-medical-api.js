/**
 * Test script for KYNSEY MD Medical ERP API
 * This script tests the connection to the backend server and API endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888/api/medical';

// Test API endpoints
async function testApi() {
  console.log('Testing KYNSEY MD Medical ERP API...');
  console.log('-------------------------------------');

  try {
    // Test root endpoint
    console.log('Testing root endpoint...');
    const rootResponse = await axios.get(API_BASE_URL);
    console.log('Root endpoint response:', rootResponse.data);
    console.log('✅ Root endpoint test passed');
    console.log('-------------------------------------');

    // Test patients endpoint
    console.log('Testing patients endpoint...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients`);
    console.log(`Retrieved ${patientsResponse.data.length} patients`);
    console.log('✅ Patients endpoint test passed');
    console.log('-------------------------------------');

    // Test appointments endpoint
    console.log('Testing appointments endpoint...');
    const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`);
    console.log(`Retrieved ${appointmentsResponse.data.length} appointments`);
    console.log('✅ Appointments endpoint test passed');
    console.log('-------------------------------------');

    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Error testing API:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    }
    
    console.log('❌ API test failed');
  }
}

// Run the tests
testApi();
