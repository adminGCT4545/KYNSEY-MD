/**
 * Medical Routes Index for KYNSEY MD Medical ERP
 * Consolidates all medical-related routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const patientRoutes = require('./patientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const chartRoutes = require('./chartRoutes');
const billingRoutes = require('./billingRoutes');
const reportingRoutes = require('./reportingRoutes');
const medicationRoutes = require('./medicationRoutes');

// Register routes
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/charts', chartRoutes);
router.use('/billing', billingRoutes);
router.use('/reporting', reportingRoutes);
router.use('/medications', medicationRoutes);

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
        path: '/api/medical/charts',
        description: 'Patient chart and medical records endpoints'
      },
      {
        path: '/api/medical/billing',
        description: 'Medical billing, claims, and payments endpoints'
      },
      {
        path: '/api/medical/reporting',
        description: 'Medical reporting and analytics endpoints'
      },
      {
        path: '/api/medical/medications',
        description: 'Medication and prescription management endpoints'
      }
    ]
  });
});

module.exports = router;
