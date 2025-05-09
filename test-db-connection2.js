import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// PostgreSQL connection pool
const { Pool } = pg;
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'your_postgres_username',
  password: process.env.PGPASSWORD || 'your_postgres_password',
  database: process.env.PGDATABASE || 'timewise_procument',
  port: parseInt(process.env.PGPORT || '5432'),
});

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    
    // Test the connection
    const result = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');
    console.log('Current time:', result.rows[0].now);
    
    // Set search path to test2 schema
    await pool.query('SET search_path TO test2');
    
    // Test querying the members table
    console.log('Testing query to members table in test2 schema...');
    try {
      const membersResult = await pool.query('SELECT * FROM members');
      console.log('Successfully queried members table');
      console.log('Number of members:', membersResult.rows.length);
      console.log('First member:', membersResult.rows[0]);
    } catch (error) {
      console.error('Error querying members table:', error);
    }
    
    // Test querying the membership_types table
    console.log('Testing query to membership_types table in test2 schema...');
    try {
      const typesResult = await pool.query('SELECT * FROM membership_types');
      console.log('Successfully queried membership_types table');
      console.log('Number of membership types:', typesResult.rows.length);
      console.log('First membership type:', typesResult.rows[0]);
    } catch (error) {
      console.error('Error querying membership_types table:', error);
    }
    
    // List all tables in the test2 schema
    console.log('Listing all tables in the test2 schema...');
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'test2'
      `);
      console.log('Tables in test2 schema:');
      tablesResult.rows.forEach(row => {
        console.log('- ' + row.table_name);
      });
    } catch (error) {
      console.error('Error listing tables:', error);
    }
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the test
testConnection();
