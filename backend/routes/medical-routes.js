/**
 * Medical Routes for KYNSEY MD Medical ERP
 * Consolidates all medical-related routes
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Import route modules (using dynamic imports since they're CommonJS modules)
const importRoutes = async () => {
  try {
    // Import patient routes
    const patientRoutesPath = path.join(__dirname, 'medical', 'patientRoutes.js');
    const patientRoutes = await import(`file://${patientRoutesPath}`);
    
    // Import appointment routes
    const appointmentRoutesPath = path.join(__dirname, 'medical', 'appointmentRoutes.js');
    const appointmentRoutes = await import(`file://${appointmentRoutesPath}`);
    
    // Import location routes
    const locationRoutesPath = path.join(__dirname, 'medical', 'locationRoutes.js');
    const locationRoutes = await import(`file://${locationRoutesPath}`);
    
    // Import provider routes
    const providerRoutesPath = path.join(__dirname, 'medical', 'providerRoutes.js');
    const providerRoutes = await import(`file://${providerRoutesPath}`);
    
    // Import chart routes
    const chartRoutesPath = path.join(__dirname, 'medical', 'chartRoutes.js');
    const chartRoutes = await import(`file://${chartRoutesPath}`);
    
    // Register routes
    router.use('/patients', patientRoutes.default);
    router.use('/appointments', appointmentRoutes.default);
    router.use('/locations', locationRoutes.default);
    router.use('/providers', providerRoutes.default);
    router.use('/charts', chartRoutes.default);
    
    console.log('Medical routes registered successfully');
  } catch (error) {
    console.error('Error importing medical routes:', error);
  }
};

// Root route for medical API
router.get('/', (req, res) => {
  res.json({
    message: 'KYNSEY MD Medical ERP API',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/medical/patients',
        description: 'Patient management endpoints'
      },
      {
        path: '/api/medical/appointments',
        description: 'Appointment management endpoints'
      },
      {
        path: '/api/medical/locations',
        description: 'Medical locations endpoints'
      },
      {
        path: '/api/medical/providers',
        description: 'Medical providers endpoints'
      },
      {
        path: '/api/medical/charts',
        description: 'Patient charts and medical records endpoints'
      }
    ]
  });
});

// Initialize routes
importRoutes();

export default router;
