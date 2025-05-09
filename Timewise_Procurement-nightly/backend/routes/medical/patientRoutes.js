/**
 * Patient Routes for KYNSEY MD Medical ERP
 * Handles API endpoints related to patients
 */

const express = require('express');
const router = express.Router();
const patientModel = require('../../models/medical/patientModel');

/**
 * @route   GET /api/medical/patients
 * @desc    Get all patients with optional filtering
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true',
      locationId: req.query.locationId ? parseInt(req.query.locationId) : null,
      providerId: req.query.providerId ? parseInt(req.query.providerId) : null,
      searchTerm: req.query.searchTerm || null
    };
    
    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const patients = await patientModel.getAllPatients(filters);
    res.json(patients);
  } catch (error) {
    console.error('Error in GET /patients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/patients/:id
 * @desc    Get a patient by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const patient = await patientModel.getPatientById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error(`Error in GET /patients/${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/medical/patients
 * @desc    Create a new patient
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'phone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }
    
    const newPatient = await patientModel.createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error in POST /patients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/medical/patients/:id
 * @desc    Update an existing patient
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedPatient = await patientModel.updatePatient(id, req.body);
    res.json(updatedPatient);
  } catch (error) {
    console.error(`Error in PUT /patients/${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/medical/patients/:id
 * @desc    Delete a patient (soft delete)
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await patientModel.deletePatient(id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /patients/${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/patients/:id/appointments
 * @desc    Get appointments for a patient
 * @access  Private
 */
router.get('/:id/appointments', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    
    // Check if patient exists
    const patient = await patientModel.getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Build filters from query params
    const filters = {
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      status: req.query.status || null
    };
    
    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const appointments = await patientModel.getPatientAppointments(patientId, filters);
    res.json(appointments);
  } catch (error) {
    console.error(`Error in GET /patients/${req.params.id}/appointments:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
