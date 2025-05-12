/**
 * Clinical Notes Routes
 * RESTful endpoints for clinical notes management
 */

const express = require('express');
const router = express.Router();
const clinicalNotesModel = require('../models/clinicalNotesModel');

/**
 * @route POST /api/medical/clinical-notes
 * @desc Create a new clinical note
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const note = await clinicalNotesModel.createNote(req.body);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error in create clinical note route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/clinical-notes/:id
 * @desc Get clinical note by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const note = await clinicalNotesModel.getNoteById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Clinical note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error in get clinical note route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/clinical-notes/chart/:chartId
 * @desc Get clinical notes by chart ID
 * @access Private
 */
router.get('/chart/:chartId', async (req, res) => {
  try {
    const notes = await clinicalNotesModel.getNotesByChart(req.params.chartId);
    res.json(notes);
  } catch (error) {
    console.error('Error in get notes by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /api/medical/clinical-notes/:id
 * @desc Update a clinical note
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await clinicalNotesModel.updateNote(req.params.id, req.body);
    
    if (!updatedNote) {
      return res.status(404).json({ message: 'Clinical note not found' });
    }
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error in update clinical note route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/medical/clinical-notes/:id/sign
 * @desc Sign a clinical note
 * @access Private
 */
router.post('/:id/sign', async (req, res) => {
  try {
    const { signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ message: 'Signature is required' });
    }
    
    const signedNote = await clinicalNotesModel.signNote(req.params.id, signature);
    
    if (!signedNote) {
      return res.status(404).json({ message: 'Clinical note not found' });
    }
    
    res.json(signedNote);
  } catch (error) {
    console.error('Error in sign clinical note route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route POST /api/medical/clinical-notes/:id/amend
 * @desc Create an amendment to a clinical note
 * @access Private
 */
router.post('/:id/amend', async (req, res) => {
  try {
    const amendment = await clinicalNotesModel.createAmendment(req.params.id, req.body);
    res.status(201).json(amendment);
  } catch (error) {
    console.error('Error in create amendment route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/clinical-notes/patient/:patientId
 * @desc Get clinical notes by patient ID
 * @access Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const notes = await clinicalNotesModel.getNotesByPatient(req.params.patientId);
    res.json(notes);
  } catch (error) {
    console.error('Error in get notes by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/clinical-notes/provider/:providerId
 * @desc Get clinical notes by provider ID
 * @access Private
 */
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const notes = await clinicalNotesModel.getNotesByProvider(
      req.params.providerId,
      start_date,
      end_date
    );
    res.json(notes);
  } catch (error) {
    console.error('Error in get notes by provider route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/clinical-notes/search/:patientId
 * @desc Search clinical notes by content
 * @access Private
 */
router.get('/search/:patientId', async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const notes = await clinicalNotesModel.searchNotes(req.params.patientId, term);
    res.json(notes);
  } catch (error) {
    console.error('Error in search notes route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/clinical-notes/templates/:templateType
 * @desc Get note templates by type
 * @access Private
 */
router.get('/templates/:templateType', async (req, res) => {
  try {
    const templates = await clinicalNotesModel.getNoteTemplates(req.params.templateType);
    res.json(templates);
  } catch (error) {
    console.error('Error in get note templates route:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;