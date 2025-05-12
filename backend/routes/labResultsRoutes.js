/**
 * Lab Results Routes
 * RESTful endpoints for lab results management
 */

const express = require('express');
const router = express.Router();
const labResultsModel = require('../models/labResultsModel');

/**
 * @route POST /api/medical/lab-results
 * @desc Create a new lab result
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const labResult = await labResultsModel.createLabResult(req.body);
    res.status(201).json(labResult);
  } catch (error) {
    console.error('Error in create lab result route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/lab-results/:id
 * @desc Get lab result by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const labResult = await labResultsModel.getLabResultById(req.params.id);
    
    if (!labResult) {
      return res.status(404).json({ message: 'Lab result not found' });
    }
    
    res.json(labResult);
  } catch (error) {
    console.error('Error in get lab result route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/lab-results/chart/:chartId
 * @desc Get lab results by chart ID
 * @access Private
 */
router.get('/chart/:chartId', async (req, res) => {
  try {
    const labResults = await labResultsModel.getLabResultsByChart(req.params.chartId);
    res.json(labResults);
  } catch (error) {
    console.error('Error in get lab results by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /api/medical/lab-results/:id
 * @desc Update a lab result
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedLabResult = await labResultsModel.updateLabResult(req.params.id, req.body);
    
    if (!updatedLabResult) {
      return res.status(404).json({ message: 'Lab result not found' });
    }
    
    res.json(updatedLabResult);
  } catch (error) {
    console.error('Error in update lab result route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /api/medical/lab-results/:id
 * @desc Delete a lab result
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await labResultsModel.deleteLabResult(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Lab result not found' });
    }
    
    res.json({ message: 'Lab result deleted successfully' });
  } catch (error) {
    console.error('Error in delete lab result route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/lab-results/patient/:patientId
 * @desc Get lab results by patient ID
 * @access Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const labResults = await labResultsModel.getLabResultsByPatient(req.params.patientId);
    res.json(labResults);
  } catch (error) {
    console.error('Error in get lab results by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/lab-results/trends/:patientId/:testName
 * @desc Get lab trends for a specific test
 * @access Private
 */
router.get('/trends/:patientId/:testName', async (req, res) => {
  try {
    const trends = await labResultsModel.getLabTrends(
      req.params.patientId, 
      req.params.testName
    );
    res.json(trends);
  } catch (error) {
    console.error('Error in get lab trends route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/lab-results/abnormal/:patientId
 * @desc Get abnormal lab results for a patient
 * @access Private
 */
router.get('/abnormal/:patientId', async (req, res) => {
  try {
    const abnormalResults = await labResultsModel.getAbnormalResults(req.params.patientId);
    res.json(abnormalResults);
  } catch (error) {
    console.error('Error in get abnormal lab results route:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;