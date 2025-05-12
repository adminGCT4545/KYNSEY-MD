const { Client } = require('pg');
const axios = require('axios');
const assert = require('assert');

// Database configuration
const dbConfig = {
  host: 'localhost',
  database: 'kynsey_md',
  port: 5432
};

// API endpoint configuration
const API_BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('Starting Medical System Tests...\n');
  
  // Test Section 1: Database Connectivity and Schema
  console.log('1. Testing Database Connectivity and Schema:');
  try {
    const client = new Client(dbConfig);
    await client.connect();
    console.log('✓ Database connection successful');

    // Check medical tables
    const tables = [
      'medical_users',
      'medical_locations',
      'medical_providers',
      'medical_patients',
      'medical_patient_insurance',
      'medical_services',
      'medical_operatories',
      'medical_appointments',
      'medical_appointment_services',
      'medical_production_log',
      'medical_vital_signs', // Added for chart components
      'medical_chart_entries' // Added for chart components
    ];

    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`, [table]);
      console.log(`✓ Table '${table}' exists: ${result.rows[0].exists}`);
    }

    // Validate foreign key relationships
    const fkQuery = `
      SELECT 
        tc.table_name, kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    
    const fkResult = await client.query(fkQuery, tables);
    console.log(`✓ Found ${fkResult.rowCount} foreign key relationships`);
    
    await client.end();
  } catch (err) {
    console.error('× Database tests failed:', err.message);
    process.exit(1);
  }

  // Test Section 2: API Endpoints
  console.log('\n2. Testing API Endpoints:');
  try {
    // Test patient charts endpoints
    const chartsResponse = await axios.get(`${API_BASE_URL}/medical/charts`);
    console.log('✓ Charts endpoint accessible');
    assert(Array.isArray(chartsResponse.data), 'Charts response should be an array');

    // Test vital signs endpoints
    const vitalsResponse = await axios.get(`${API_BASE_URL}/medical/vitals`);
    console.log('✓ Vitals endpoint accessible');
    assert(Array.isArray(vitalsResponse.data), 'Vitals response should be an array');

    // Test error handling
    try {
      await axios.get(`${API_BASE_URL}/medical/invalid-endpoint`);
    } catch (err) {
      console.log('✓ Error handling working as expected');
      assert(err.response.status === 404, 'Invalid endpoint should return 404');
    }
  } catch (err) {
    console.error('× API endpoint tests failed:', err.message);
    process.exit(1);
  }

  // Test Section 3: Frontend Integration
  console.log('\n3. Testing Frontend Integration:');
  try {
    // We'll simulate frontend testing by checking API responses match expected format
    const patientSearchResponse = await axios.get(`${API_BASE_URL}/medical/patients/search?query=test`);
    console.log('✓ Patient search endpoint functioning');
    assert(patientSearchResponse.data.hasOwnProperty('results'), 'Search response should have results property');

    const chartUpdateResponse = await axios.post(`${API_BASE_URL}/medical/charts/test-update`, {
      patientId: 'test-id',
      updateData: { status: 'updated' }
    });
    console.log('✓ Chart update endpoint functioning');
    assert(chartUpdateResponse.data.success, 'Chart update should return success status');

    // Test network recovery by simulating a failed request then retry
    try {
      await axios.get(`${API_BASE_URL}/medical/charts`, { timeout: 1 });
    } catch (err) {
      const retryResponse = await axios.get(`${API_BASE_URL}/medical/charts`);
      console.log('✓ Network recovery functioning');
      assert(retryResponse.status === 200, 'Retry should succeed');
    }
  } catch (err) {
    console.error('× Frontend integration tests failed:', err.message);
    process.exit(1);
  }

  console.log('\nAll tests completed successfully!');
}

// Run the tests
runTests().catch(console.error);