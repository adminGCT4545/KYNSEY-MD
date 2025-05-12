/**
 * Patient Routes for KYNSEY MD Medical ERP
 * Handles API endpoints related to patients
 */

import express from 'express';
import { getPatientById, getAllPatients, createPatient, updatePatient, deletePatient, getPatientAppointments } from '../../models/medical/patientModel.js';
import { 
  getPatientVitalSigns, 
  createVitalSign, 
  updateVitalSign, 
  deleteVitalSign 
} from '../../models/medical/vitalSignsModel.js';
import { getPatientCharts } from '../../models/medical/chartModel.js';

const router = express.Router();

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
    
    const patients = await getAllPatients(filters);
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
    const patient = await getPatientById(id);
    
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
    
    const newPatient = await createPatient(req.body);
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
    const updatedPatient = await updatePatient(id, req.body);
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
    await deletePatient(id);
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
    const patient = await getPatientById(patientId);
    
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
    
    const appointments = await getPatientAppointments(patientId, filters);
    res.json(appointments);
  } catch (error) {
    console.error(`Error in GET /patients/${req.params.id}/appointments:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/patients/:id/vital-signs
 * @desc    Get vital signs for a patient
 * @access  Private
 */
router.get('/:id/vital-signs', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    
    // Check if patient exists
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Optional filtering by date range, type, etc.
    const filters = {
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      vitalType: req.query.vitalType || null
    };
    
    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const vitalSigns = await getPatientVitalSigns(patientId, filters);
    res.json(vitalSigns);
  } catch (error) {
    console.error(`Error in GET /patients/${req.params.id}/vital-signs:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/medical/patients/:id/vital-signs
 * @desc    Create a new vital sign record for a patient
 * @access  Private
 */
router.post('/:id/vital-signs', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    
    // Check if patient exists
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Validate required fields for vital signs
    const requiredFields = ['vital_type', 'value', 'unit', 'date'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }
    
    const vitalSignData = {
      ...req.body,
      patient_id: patientId
    };
    
    const newVitalSign = await createVitalSign(vitalSignData);
    res.status(201).json(newVitalSign);
  } catch (error) {
    console.error(`Error in POST /patients/${req.params.id}/vital-signs:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/medical/patients/:id/vital-signs/:vitalId
 * @desc    Update a vital sign record
 * @access  Private
 */
router.put('/:id/vital-signs/:vitalId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const vitalId = parseInt(req.params.vitalId);
    
    // Check if patient exists
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const vitalSignData = {
      ...req.body,
      id: vitalId,
      patient_id: patientId
    };
    
    const updatedVitalSign = await updateVitalSign(vitalId, vitalSignData);
    res.json(updatedVitalSign);
  } catch (error) {
    console.error(`Error in PUT /patients/${req.params.id}/vital-signs/${req.params.vitalId}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/medical/patients/:id/vital-signs/:vitalId
 * @desc    Delete a vital sign record
 * @access  Private
 */
router.delete('/:id/vital-signs/:vitalId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const vitalId = parseInt(req.params.vitalId);
    
    // Check if patient exists
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    await deleteVitalSign(vitalId, patientId);
    res.json({ message: 'Vital sign record deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /patients/${req.params.id}/vital-signs/${req.params.vitalId}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/patients/:id/charts
 * @desc    Get charts for a patient
 * @access  Private
 */
router.get('/:id/charts', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    
    // Check if patient exists
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Build filters from query params
    const filters = {
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      type: req.query.type || null
    };
    
    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const charts = await getPatientCharts(patientId, filters);
    res.json(charts);
  } catch (error) {
    console.error(`Error in GET /patients/${req.params.id}/charts:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
