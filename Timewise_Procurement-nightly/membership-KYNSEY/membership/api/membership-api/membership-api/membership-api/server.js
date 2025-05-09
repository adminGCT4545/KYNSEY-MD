const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'membership'
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Define API routes
app.get('/', (req, res) => {
  res.send('Membership API is running');
});

// Get all members
app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM members');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'An error occurred while fetching members' });
  }
});

// Get member by ID
app.get('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM members WHERE member_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'An error occurred while fetching member' });
  }
});

// Get all membership types
app.get('/api/membership-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM membership_types');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching membership types:', error);
    res.status(500).json({ error: 'An error occurred while fetching membership types' });
  }
});

// Get activity log
app.get('/api/activity-log', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_log');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'An error occurred while fetching activity log' });
  }
});

// Get member activities
app.get('/api/members/:id/activities', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM activity_log WHERE member_id = $1', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching member activities:', error);
    res.status(500).json({ error: 'An error occurred while fetching member activities' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - GET /api/members`);
  console.log(`  - GET /api/members/:id`);
  console.log(`  - GET /api/membership-types`);
  console.log(`  - GET /api/activity-log`);
  console.log(`  - GET /api/members/:id/activities`);
});
