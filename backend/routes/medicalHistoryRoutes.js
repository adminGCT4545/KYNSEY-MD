/**
 * Medical History Routes
 * RESTful endpoints for medical history management
 */

const express = require('express');
const router = express.Router();
const medicalHistoryModel = require('../models/medicalHistoryModel');

// Medical Conditions History Routes

/**
 * @route POST /api/medical/history/conditions
 * @desc Create a new medical history record
 * @access Private
 */
router.post('/conditions', async (req, res) => {
  try {
    const history = await medicalHistoryModel.createMedicalHistory(req.body);
    res.status(201).json(history);
  } catch (error) {
    console.error('Error in create medical history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/conditions/:id
 * @desc Get medical history record by ID
 * @access Private
 */
router.get('/conditions/:id', async (req, res) => {
  try {
    const history = await medicalHistoryModel.getMedicalHistoryById(req.params.id);
    
    if (!history) {
      return res.status(404).json({ message: 'Medical history record not found' });
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error in get medical history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/conditions/chart/:chartId
 * @desc Get medical history records by chart ID
 * @access Private
 */
router.get('/conditions/chart/:chartId', async (req, res) => {
  try {
    const history = await medicalHistoryModel.getMedicalHistoryByChart(req.params.chartId);
    res.json(history);
  } catch (error) {
    console.error('Error in get medical history by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /api/medical/history/conditions/:id
 * @desc Update a medical history record
 * @access Private
 */
router.put('/conditions/:id', async (req, res) => {
  try {
    const updatedHistory = await medicalHistoryModel.updateMedicalHistory(req.params.id, req.body);
    
    if (!updatedHistory) {
      return res.status(404).json({ message: 'Medical history record not found' });
    }
    
    res.json(updatedHistory);
  } catch (error) {
    console.error('Error in update medical history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /api/medical/history/conditions/:id
 * @desc Delete a medical history record
 * @access Private
 */
router.delete('/conditions/:id', async (req, res) => {
  try {
    const success = await medicalHistoryModel.deleteMedicalHistory(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Medical history record not found' });
    }
    
    res.json({ message: 'Medical history record deleted successfully' });
  } catch (error) {
    console.error('Error in delete medical history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/conditions/patient/:patientId
 * @desc Get medical history records by patient ID
 * @access Private
 */
router.get('/conditions/patient/:patientId', async (req, res) => {
  try {
    const history = await medicalHistoryModel.getMedicalHistoryByPatient(req.params.patientId);
    res.json(history);
  } catch (error) {
    console.error('Error in get medical history by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/conditions/status/:chartId/:status
 * @desc Get medical history records by status
 * @access Private
 */
router.get('/conditions/status/:chartId/:status', async (req, res) => {
  try {
    const history = await medicalHistoryModel.getMedicalHistoryByStatus(
      req.params.chartId,
      req.params.status
    );
    res.json(history);
  } catch (error) {
    console.error('Error in get medical history by status route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/conditions/search/:patientId
 * @desc Search medical history records by condition
 * @access Private
 */
router.get('/conditions/search/:patientId', async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const history = await medicalHistoryModel.searchMedicalHistory(req.params.patientId, term);
    res.json(history);
  } catch (error) {
    console.error('Error in search medical history route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Allergies Routes

/**
 * @route POST /api/medical/history/allergies
 * @desc Create a new allergy record
 * @access Private
 */
router.post('/allergies', async (req, res) => {
  try {
    const allergy = await medicalHistoryModel.createAllergy(req.body);
    res.status(201).json(allergy);
  } catch (error) {
    console.error('Error in create allergy route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/allergies/chart/:chartId
 * @desc Get allergies by chart ID
 * @access Private
 */
router.get('/allergies/chart/:chartId', async (req, res) => {
  try {
    const allergies = await medicalHistoryModel.getAllergiesByChart(req.params.chartId);
    res.json(allergies);
  } catch (error) {
    console.error('Error in get allergies by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/allergies/patient/:patientId
 * @desc Get allergies by patient ID
 * @access Private
 */
router.get('/allergies/patient/:patientId', async (req, res) => {
  try {
    const allergies = await medicalHistoryModel.getAllergiesByPatient(req.params.patientId);
    res.json(allergies);
  } catch (error) {
    console.error('Error in get allergies by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /api/medical/history/allergies/:id
 * @desc Update an allergy record
 * @access Private
 */
router.put('/allergies/:id', async (req, res) => {
  try {
    const updatedAllergy = await medicalHistoryModel.updateAllergy(req.params.id, req.body);
    
    if (!updatedAllergy) {
      return res.status(404).json({ message: 'Allergy record not found' });
    }
    
    res.json(updatedAllergy);
  } catch (error) {
    console.error('Error in update allergy route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /api/medical/history/allergies/:id
 * @desc Delete an allergy record
 * @access Private
 */
router.delete('/allergies/:id', async (req, res) => {
  try {
    const success = await medicalHistoryModel.deleteAllergy(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Allergy record not found' });
    }
    
    res.json({ message: 'Allergy record deleted successfully' });
  } catch (error) {
    console.error('Error in delete allergy route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Family History Routes

/**
 * @route POST /api/medical/history/family
 * @desc Create a new family history record
 * @access Private
 */
router.post('/family', async (req, res) => {
  try {
    const familyHistory = await medicalHistoryModel.createFamilyHistory(req.body);
    res.status(201).json(familyHistory);
  } catch (error) {
    console.error('Error in create family history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/family/chart/:chartId
 * @desc Get family history by chart ID
 * @access Private
 */
router.get('/family/chart/:chartId', async (req, res) => {
  try {
    const familyHistory = await medicalHistoryModel.getFamilyHistoryByChart(req.params.chartId);
    res.json(familyHistory);
  } catch (error) {
    console.error('Error in get family history by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/family/patient/:patientId
 * @desc Get family history by patient ID
 * @access Private
 */
router.get('/family/patient/:patientId', async (req, res) => {
  try {
    const familyHistory = await medicalHistoryModel.getFamilyHistoryByPatient(req.params.patientId);
    res.json(familyHistory);
  } catch (error) {
    console.error('Error in get family history by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Social History Routes

/**
 * @route POST /api/medical/history/social
 * @desc Create a new social history record
 * @access Private
 */
router.post('/social', async (req, res) => {
  try {
    const socialHistory = await medicalHistoryModel.createSocialHistory(req.body);
    res.status(201).json(socialHistory);
  } catch (error) {
    console.error('Error in create social history route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/history/social/chart/:chartId
 * @desc Get social history by chart ID
 * @access Private
 */
router.get('/social/chart/:chartId', async (req, res) => {
  try {
    const socialHistory = await medicalHistoryModel.getSocialHistoryByChart(req.params.chartId);
    res.json(socialHistory);
  } catch (error) {
    console.error('Error in get social history by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;