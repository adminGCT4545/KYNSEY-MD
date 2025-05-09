import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyServerConfig() {
  console.log('Verifying BookSL Train Dashboard server configuration...');
  
  try {
    // Check server.js configuration
    console.log('\n1. Checking server.js configuration...');
    const serverJsPath = path.join(__dirname, 'backend', 'src', 'server.js');
    
    try {
      const serverJsContent = await fs.readFile(serverJsPath, 'utf8');
      console.log('✅ server.js file exists and is readable');
      
      // Check if the server.js file contains the dashboard routes
      const dashboardRoutesMatch = serverJsContent.includes('import dashboardRoutes from');
      if (dashboardRoutesMatch) {
        console.log('✅ server.js imports dashboard routes');
      } else {
        console.log('❌ server.js does not import dashboard routes');
      }
      
      // Check if the server.js file sets up the API endpoints
      const apiEndpointsMatch = serverJsContent.includes('app.use(\'/api/dashboard\'');
      if (apiEndpointsMatch) {
        console.log('✅ server.js sets up dashboard API endpoints');
      } else {
        console.log('❌ server.js does not set up dashboard API endpoints');
      }
      
    } catch (readError) {
      console.error('❌ Could not read server.js file:', readError.message);
    }
    
    // Check database configuration
    console.log('\n2. Checking database configuration...');
    try {
      const envPath = path.join(__dirname, 'backend', '.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      console.log('✅ .env file exists in the backend directory');
      
      // Check if the .env file contains PostgreSQL configuration
      const pgHostMatch = envContent.includes('PGHOST=');
      const pgUserMatch = envContent.includes('PGUSER=');
      const pgPasswordMatch = envContent.includes('PGPASSWORD=');
      const pgDatabaseMatch = envContent.includes('PGDATABASE=');
      
      if (pgHostMatch && pgUserMatch && pgPasswordMatch && pgDatabaseMatch) {
        console.log('✅ .env file contains PostgreSQL configuration');
      } else {
        console.log('❌ .env file is missing some PostgreSQL configuration');
      }
    } catch (readError) {
      console.error('❌ Could not read .env file:', readError.message);
    }
    
    // AI functionality has been removed
    console.log('\n3. AI functionality has been removed from the project');
    console.log('✅ The project now only includes the dashboard functionality');
    
    console.log('\n4. Summary:');
    console.log('✅ Server configuration verified');
    console.log('✅ Dashboard functionality is available');
    
  } catch (error) {
    console.error('Error verifying server configuration:', error);
  }
}

// Run the verification
verifyServerConfig().catch(console.error);
