/**
 * KYNSEY MD - Medication Routes
 * Handles API endpoints for medication management
 */

const express = require('express');
const router = express.Router();
const medicationModel = require('../../models/medical/medicationModel');
const chartModel = require('../../models/medical/chartModel');

/**
 * @route   GET /api/medical/medications
 * @desc    Get all medications with optional filtering
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { search, drugClass, sortBy, sortOrder, limit, offset } = req.query;
    
    const options = {
      searchTerm: search,
      drugClass,
      sortBy,
      sortOrder,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };
    
    const medications = await medicationModel.getMedications(options);
    
    return res.json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    console.error('Error in GET /medications:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/medical/medications/drug-classes
 * @desc    Get all drug classes for filtering
 * @access  Private
 */
router.get('/drug-classes', async (req, res) => {
  try {
    const drugClasses = await medicationModel.getDrugClasses();
    
    return res.json({
      success: true,
      count: drugClasses.length,
      data: drugClasses
    });
  } catch (error) {
    console.error('Error in GET /medications/drug-classes:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/medical/medications/search
 * @desc    Search medications
 * @access  Private
 */
router.get('/search', async (req, res) => {
  try {
    const { term, limit } = req.query;
    
    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const medications = await medicationModel.searchMedications(
      term, 
      limit ? parseInt(limit) : 10
    );
    
    return res.json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    console.error('Error in GET /medications/search:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/medical/medications/:id
 * @desc    Get medication by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const medication = await medicationModel.getMedicationById(req.params.id);
    
    return res.json({
      success: true,
      data: medication
    });
  } catch (error) {
    console.error(`Error in GET /medications/${req.params.id}:`, error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/medical/medications
 * @desc    Create a new medication
 * @access  Private (Admin or Provider)
 */
router.post('/', async (req, res) => {
  try {
    const { name, generic_name, drug_class, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required'
      });
    }
    
    const medication = await medicationModel.createMedication({
      name,
      generic_name,
      drug_class,
      description
    });
    
    return res.status(201).json({
      success: true,
      data: medication
    });
  } catch (error) {
    console.error('Error in POST /medications:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/medical/medications/:id
 * @desc    Update a medication
 * @access  Private (Admin or Provider)
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, generic_name, drug_class, description } = req.body;
    
    const medication = await medicationModel.updateMedication(req.params.id, {
      name,
      generic_name,
      drug_class,
      description
    });
    
    return res.json({
      success: true,
      data: medication,
      message: 'Medication updated successfully'
    });
  } catch (error) {
    console.error(`Error in PUT /medications/${req.params.id}:`, error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/medical/charts/:chartId/medications
 * @desc    Get all medications for a patient chart
 * @access  Private
 */
router.get('/charts/:chartId/medications', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const chartId = parseInt(req.params.chartId);
    
    // Check if chart exists
    try {
      await chartModel.getChartById(chartId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: `Chart with ID ${chartId} not found`
      });
    }
    
    const medications = await medicationModel.getPatientMedications(
      chartId, 
      activeOnly === 'true'
    );
    
    return res.json({
      success: true,
      count: medications.length,
      data: medications
    });
  } catch (error) {
    console.error(`Error in GET /charts/${req.params.chartId}/medications:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/medical/charts/:chartId/medications
 * @desc    Prescribe a medication to a patient
 * @access  Private (Provider)
 */
router.post('/charts/:chartId/medications', async (req, res) => {
  try {
    const chartId = parseInt(req.params.chartId);
    const {
      medication_id,
      dosage,
      frequency,
      route,
      start_date,
      end_date,
      prescribing_provider_id,
      notes
    } = req.body;
    
    // Validate required fields
    if (!medication_id || !dosage || !frequency || !route || !start_date || !prescribing_provider_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required prescription fields'
      });
    }
    
    // Check if chart exists
    try {
      await chartModel.getChartById(chartId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: `Chart with ID ${chartId} not found`
      });
    }
    
    const prescription = await medicationModel.prescribeMedication({
      chart_id: chartId,
      medication_id,
      dosage,
      frequency,
      route,
      start_date,
      end_date,
      prescribing_provider_id,
      notes
    });
    
    return res.status(201).json({
      success: true,
      data: prescription,
      message: 'Medication prescribed successfully'
    });
  } catch (error) {
    console.error(`Error in POST /charts/${req.params.chartId}/medications:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/medical/patient-medications/:id
 * @desc    Update a patient medication prescription
 * @access  Private (Provider)
 */
router.put('/patient-medications/:id', async (req, res) => {
  try {
    const { dosage, frequency, route, end_date, active, notes } = req.body;
    
    const prescription = await medicationModel.updatePrescription(
      req.params.id,
      { dosage, frequency, route, end_date, active, notes }
    );
    
    return res.json({
      success: true,
      data: prescription,
      message: 'Prescription updated successfully'
    });
  } catch (error) {
    console.error(`Error in PUT /patient-medications/${req.params.id}:`, error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/medical/patient-medications/:id/discontinue
 * @desc    Discontinue a patient medication
 * @access  Private (Provider)
 */
router.put('/patient-medications/:id/discontinue', async (req, res) => {
  try {
    const { end_date, reason } = req.body;
    
    const prescription = await medicationModel.discontinueMedication(
      req.params.id,
      end_date || new Date(),
      reason
    );
    
    return res.json({
      success: true,
      data: prescription,
      message: 'Medication discontinued successfully'
    });
  } catch (error) {
    console.error(`Error in PUT /patient-medications/${req.params.id}/discontinue:`, error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;