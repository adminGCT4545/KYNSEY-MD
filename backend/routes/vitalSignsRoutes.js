/**
 * Vital Signs Routes
 * RESTful endpoints for vital signs tracking
 */

const express = require('express');
const router = express.Router();
const vitalSignsModel = require('../models/vitalSignsModel');

/**
 * @route POST /api/medical/vital-signs
 * @desc Create a new vital signs record
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const vitalSigns = await vitalSignsModel.createVitalSigns(req.body);
    res.status(201).json(vitalSigns);
  } catch (error) {
    console.error('Error in create vital signs route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/vital-signs/:id
 * @desc Get vital signs record by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const vitalSigns = await vitalSignsModel.getVitalSignsById(req.params.id);
    
    if (!vitalSigns) {
      return res.status(404).json({ message: 'Vital signs record not found' });
    }
    
    res.json(vitalSigns);
  } catch (error) {
    console.error('Error in get vital signs route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/vital-signs/latest/:chartId
 * @desc Get latest vital signs for a chart
 * @access Private
 */
router.get('/latest/:chartId', async (req, res) => {
  try {
    const vitalSigns = await vitalSignsModel.getLatestVitalSigns(req.params.chartId);
    
    if (!vitalSigns) {
      return res.status(404).json({ message: 'No vital signs records found' });
    }
    
    res.json(vitalSigns);
  } catch (error) {
    console.error('Error in get latest vital signs route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/vital-signs/history/:chartId
 * @desc Get vital signs history for a chart
 * @access Private
 */
router.get('/history/:chartId', async (req, res) => {
  try {
    const { limit } = req.query;
    const vitalSigns = await vitalSignsModel.getVitalSignsHistory(
      req.params.chartId,
      limit
    );
    res.json(vitalSigns);
  } catch (error) {
    console.error('Error in get vital signs history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /api/medical/vital-signs/:id
 * @desc Update a vital signs record
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedVitalSigns = await vitalSignsModel.updateVitalSigns(req.params.id, req.body);
    
    if (!updatedVitalSigns) {
      return res.status(404).json({ message: 'Vital signs record not found' });
    }
    
    res.json(updatedVitalSigns);
  } catch (error) {
    console.error('Error in update vital signs route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /api/medical/vital-signs/:id
 * @desc Delete a vital signs record
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await vitalSignsModel.deleteVitalSigns(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Vital signs record not found' });
    }
    
    res.json({ message: 'Vital signs record deleted successfully' });
  } catch (error) {
    console.error('Error in delete vital signs route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/vital-signs/patient/:patientId
 * @desc Get vital signs by patient ID
 * @access Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { limit } = req.query;
    const vitalSigns = await vitalSignsModel.getVitalSignsByPatient(
      req.params.patientId,
      limit
    );
    res.json(vitalSigns);
  } catch (error) {
    console.error('Error in get vital signs by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/vital-signs/trends/:patientId/:measurementType
 * @desc Get vital signs trends for a specific measurement
 * @access Private
 */
router.get('/trends/:patientId/:measurementType', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const trends = await vitalSignsModel.getVitalTrends(
      req.params.patientId,
      req.params.measurementType,
      start_date,
      end_date
    );
    
    res.json(trends);
  } catch (error) {
    console.error('Error in get vital trends route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/medical/vital-signs/flag-abnormal
 * @desc Flag abnormal vital signs
 * @access Private
 */
router.post('/flag-abnormal', async (req, res) => {
  try {
    const { vital_signs, age, gender } = req.body;
    
    if (!vital_signs || !age) {
      return res.status(400).json({ message: 'Vital signs and age are required' });
    }
    
    const flaggedVitals = await vitalSignsModel.flagAbnormalVitals(
      vital_signs,
      age,
      gender || 'unknown'
    );
    
    res.json(flaggedVitals);
  } catch (error) {
    console.error('Error in flag abnormal vitals route:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;