// Test script for dashboard API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8888';

// Test function
async function testEndpoint(endpoint, description) {
  try {
    console.log(`Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${description} - Success`);
    console.log(JSON.stringify(data, null, 2).substring(0, 200) + '...');
    console.log('-----------------------------------');
    return data;
  } catch (error) {
    console.error(`❌ ${description} - Failed:`, error.message);
    console.log('-----------------------------------');
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🔍 Starting Dashboard API Tests');
  console.log('===================================');
  
  // Test general API endpoint
  await testEndpoint('/api/test', 'Backend server status');
  
  // Test dashboard-specific endpoints
  await testEndpoint('/api/dashboard/test', 'Dashboard API status');
  await testEndpoint('/api/dashboard/trains', 'Get all trains');
  await testEndpoint('/api/dashboard/journeys?limit=3', 'Get train journeys (limited to 3)');
  await testEndpoint('/api/dashboard/upcoming?count=3', 'Get upcoming departures (limited to 3)');
  await testEndpoint('/api/dashboard/years', 'Get available years');
  await testEndpoint('/api/dashboard/stats', 'Get dashboard statistics');
  
  console.log('✨ All tests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});
