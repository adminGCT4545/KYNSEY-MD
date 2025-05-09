import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a client with environment variables
const client = new pg.Client();

async function testDatabaseFunctionality() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Successfully connected to PostgreSQL database!');
    
    // Query to get PostgreSQL version
    const versionRes = await client.query('SELECT version()');
    console.log('PostgreSQL version:', versionRes.rows[0].version);
    
    // Create a test table
    console.log('Creating test table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert a test record
    console.log('Inserting test data...');
    const insertRes = await client.query(
      'INSERT INTO test_table (name) VALUES ($1) RETURNING *',
      ['Test Record ' + new Date().toISOString()]
    );
    console.log('Inserted record:', insertRes.rows[0]);
    
    // Query the test table
    console.log('Querying test data...');
    const selectRes = await client.query('SELECT * FROM test_table ORDER BY id DESC LIMIT 5');
    console.log('Recent records:');
    selectRes.rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.name}, Created: ${row.created_at}`);
    });
    
    // Close the connection
    await client.end();
    console.log('Database test completed successfully!');
  } catch (err) {
    console.error('Error during database test:', err);
  } finally {
    // Ensure connection is closed even if there's an error
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // Ignore error on closing
      }
    }
  }
}

testDatabaseFunctionality();
