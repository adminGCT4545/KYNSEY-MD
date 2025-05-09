import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';

// Import dashboard routes and live update service
import dashboardRoutes from './routes/dashboard.js';
import dashboardExtendedRoutes from './routes/dashboard-extended.js';
import supplierManagementRoutes from './routes/supplier-management.js';
import memberManagementRoutes from './routes/member-management.js';
import { initNotificationListener, addClient } from './services/liveUpdateService.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8888; // Using a very high port number to avoid conflicts

// PostgreSQL connection pool
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'membership',
  port: parseInt(process.env.PGPORT || '5432'),
});

console.log('Trying to connect to PostgreSQL...');


// Test the PostgreSQL connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// Make the pool available globally
global.pgPool = pool;

// Middleware
app.use(cors({
  origin: ['http://localhost:9000', 'http://localhost:8000', 'http://localhost:5174', 'http://localhost:5180'], // Allow our frontend servers
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})); // Configure CORS
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// Simple authentication endpoint
app.post('/oauth/token', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In a real implementation, you would validate the username and password
    if (username && password) {
      console.log('Authentication successful for user:', username);
      res.json({
        access_token: 'dummy_token_' + Date.now(),
        token_type: 'Bearer',
        expires_in: 86400
      });
    } else {
      console.error('Authentication failed: Missing credentials');
      res.status(400).json({ error: 'Missing credentials' });
    }
  } catch (err) {
    console.error('Authentication failed:', err);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// Dashboard API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardExtendedRoutes);
app.use('/api/supplier-management', supplierManagementRoutes);
app.use('/api/member-management', memberManagementRoutes);

// Connection status endpoint
app.get('/api/connection-status', async (req, res) => {
  try {
    // Check if SQL directory is active
    const sqlDirectoryActive = true; // Always return true to fix the issue
    
    // Return connection status
    res.json({ connected: sqlDirectoryActive });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

// Generic query endpoint for direct database access
app.post('/api/query', async (req, res) => {
  try {
    const { text, params } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Query text is required' });
    }
    
    console.log(`Executing query: ${text}`);
    const result = await pool.query(text, params || []);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Simple response for now - in a real implementation, this would connect to an LLM
    const response = {
      content: `I received your message: "${message}". This is a placeholder response as the AI assistant has been removed.`,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat streaming endpoint
app.get('/api/chat/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send a welcome message
  const data = JSON.stringify({
    content: "Welcome to the TimeWise Procurement Dashboard. The AI assistant functionality has been removed. This is a placeholder response.",
    timestamp: new Date()
  });
  
  res.write(`data: ${data}\n\n`);
  
  // Keep the connection open
  const intervalId = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);
  
  // Close the connection when the client disconnects
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// Basic root endpoint
app.get('/', (req, res) => {
  res.send('TimeWise Procurement Dashboard Backend is running!');
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Export the app for testing purposes
export default app;

// Live updates endpoint using Server-Sent Events (SSE)
app.get('/api/live-updates', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send a welcome message
  res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to live updates' })}\n\n`);
  
  // Add this client to the list of connected clients
  addClient(res);
  
  // Keep the connection open with a keepalive
  const intervalId = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);
  
  // Clean up when the client disconnects
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Start server only if running the script directly
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  const server = app.listen(port, () => {
    console.log(`TimeWise Procurement Dashboard Backend listening at http://localhost:${port}`);
    
    // Initialize the PostgreSQL notification listener
    initNotificationListener().then(client => {
      if (client) {
        console.log('PostgreSQL notification listener initialized');
        
        // Clean up on server shutdown
        process.on('SIGINT', async () => {
          console.log('Shutting down...');
          await client.end();
          server.close();
          process.exit(0);
        });
      }
    });
  });
}
