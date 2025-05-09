import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection for listening to notifications
const createNotificationClient = () => {
  const client = new pg.Client({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'your_postgres_username',
    password: process.env.PGPASSWORD || 'your_postgres_password',
    database: process.env.PGDATABASE || 'procurement',
    port: parseInt(process.env.PGPORT || '5432'),
  });
  
  return client;
};

// Store all active SSE clients
const clients = new Set();

// Add a new client
const addClient = (client) => {
  clients.add(client);
  console.log(`Client connected. Total clients: ${clients.size}`);
  
  // Remove client when connection is closed
  client.on('close', () => {
    clients.delete(client);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });
};

// Send data to all connected clients
const sendToAllClients = (data) => {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

// Initialize the notification listener
const initNotificationListener = async () => {
  const client = createNotificationClient();
  
  try {
    await client.connect();
    console.log('Notification listener connected to PostgreSQL');
    
    // Listen for notifications from all tables
    await client.query('LISTEN journey_changes');
    await client.query('LISTEN schedule_changes');
    await client.query('LISTEN train_changes');
    
    // Handle notifications
    client.on('notification', async (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        console.log(`Received notification on channel ${msg.channel}:`, payload);
        
        // Send the notification to all connected clients
        sendToAllClients({
          type: msg.channel,
          data: payload
        });
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    });
    
    // Handle errors
    client.on('error', (err) => {
      console.error('Error in notification client:', err);
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect notification client...');
        initNotificationListener();
      }, 5000);
    });
    
    return client;
  } catch (error) {
    console.error('Error connecting notification client:', error);
    // Try to reconnect after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect notification client...');
      initNotificationListener();
    }, 5000);
    return null;
  }
};

export { initNotificationListener, addClient, sendToAllClients };
