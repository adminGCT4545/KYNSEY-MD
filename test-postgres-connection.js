import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a client with environment variables
const client = new pg.Client();

async function testConnection() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Successfully connected to PostgreSQL database!');
    
    // Query to get PostgreSQL version
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    // Close the connection
    await client.end();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

testConnection();
