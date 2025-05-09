// KYNSEY MD - Medical Database Connection Test
const { Pool } = require('pg');

// Connection configuration
const pool = new Pool({
  user: 'kynsey_app',
  host: 'localhost',
  database: 'kynsey_md_db',
  password: 'kynsey_secure_password',
  port: 5432,
});

async function testDatabaseConnection() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database successfully!');
    
    // Test basic query - Get table count
    const tableCountQuery = `
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'medical_%'`;
    const tableResult = await client.query(tableCountQuery);
    console.log(`Medical database contains ${tableResult.rows[0].table_count} tables`);
    
    // Get list of tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'medical_%' 
      ORDER BY table_name`;
    const tableList = await client.query(tablesQuery);
    console.log('\nMedical database tables:');
    tableList.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

    // Test a view query - Today's Appointments
    console.log('\nToday\'s appointments:');
    const appointmentsQuery = `SELECT * FROM view_todays_schedule`;
    const appointments = await client.query(appointmentsQuery);
    
    if (appointments.rows.length === 0) {
      console.log('No appointments scheduled for today.');
    } else {
      appointments.rows.forEach(appt => {
        console.log(`${appt.start_time.substr(0, 5)} - ${appt.patient_name} with ${appt.provider_name} (${appt.appointment_type})`);
      });
    }
    
    // Test a join query - Patients with Insurance
    console.log('\nPatient Insurance Information:');
    const insuranceQuery = `SELECT * FROM view_patient_insurance LIMIT 3`;
    const insurance = await client.query(insuranceQuery);
    console.table(insurance.rows.map(row => ({
      'Patient': row.patient_name,
      'DOB': row.date_of_birth.toLocaleDateString(),
      'Insurance': row.insurance_provider,
      'Policy #': row.policy_number,
      'Valid Until': row.coverage_end_date ? row.coverage_end_date.toLocaleDateString() : 'Ongoing'
    })));

    console.log('\nDatabase test completed successfully!');
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testDatabaseConnection()
  .then(() => console.log('Test finished'))
  .catch(err => console.error('Test failed:', err));