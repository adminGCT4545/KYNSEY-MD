/**
 * KYNSEY MD - Chart Routes
 * API endpoints for patient charts and medical records
 */

const express = require('express');
const router = express.Router();
const chartModel = require('../../models/medical/chartModel');

/**
 * @route   POST /api/medical/charts
 * @desc    Create a new patient chart
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const chartData = req.body;
    
    // Validate required fields
    if (!chartData.patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    const chart = await chartModel.createChart(chartData);
    res.status(201).json(chart);
  } catch (error) {
    console.error('Error creating chart:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id
 * @desc    Get a chart by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const chartId = req.params.id;
    const chart = await chartModel.getChartById(chartId);
    res.json(chart);
  } catch (error) {
    console.error('Error getting chart:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/patient/:patientId
 * @desc    Get a patient's chart
 * @access  Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const chart = await chartModel.getChartByPatientId(patientId);
    res.json(chart);
  } catch (error) {
    console.error('Error getting patient chart:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/medical/charts/:id
 * @desc    Update a chart
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const chartId = req.params.id;
    const chartData = req.body;
    
    const updatedChart = await chartModel.updateChart(chartId, chartData);
    res.json(updatedChart);
  } catch (error) {
    console.error('Error updating chart:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/charts/:id/notes
 * @desc    Add a note to a chart
 * @access  Private
 */
router.post('/:id/notes', async (req, res) => {
  try {
    const chartId = req.params.id;
    const noteData = {
      ...req.body,
      chart_id: chartId
    };
    
    // Validate required fields
    if (!noteData.provider_id) {
      return res.status(400).json({ message: 'Provider ID is required' });
    }
    
    if (!noteData.note_type) {
      return res.status(400).json({ message: 'Note type is required' });
    }
    
    const note = await chartModel.addChartNote(noteData);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error adding chart note:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id/notes
 * @desc    Get notes for a chart
 * @access  Private
 */
router.get('/:id/notes', async (req, res) => {
  try {
    const chartId = req.params.id;
    const options = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };
    
    const notes = await chartModel.getChartNotes(chartId, options);
    res.json(notes);
  } catch (error) {
    console.error('Error getting chart notes:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/notes/:id
 * @desc    Get a specific note by ID
 * @access  Private
 */
router.get('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await chartModel.getNoteById(noteId);
    res.json(note);
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/medical/notes/:id
 * @desc    Update a chart note
 * @access  Private
 */
router.put('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const noteData = req.body;
    
    const updatedNote = await chartModel.updateChartNote(noteId, noteData);
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating chart note:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/charts/:id/vitals
 * @desc    Add vital signs to a chart
 * @access  Private
 */
router.post('/:id/vitals', async (req, res) => {
  try {
    const chartId = req.params.id;
    const vitalData = {
      ...req.body,
      chart_id: chartId
    };
    
    const vitals = await chartModel.addVitalSigns(vitalData);
    res.status(201).json(vitals);
  } catch (error) {
    console.error('Error adding vital signs:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id/vitals
 * @desc    Get vital signs for a chart
 * @access  Private
 */
router.get('/:id/vitals', async (req, res) => {
  try {
    const chartId = req.params.id;
    const options = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };
    
    const vitals = await chartModel.getVitalSigns(chartId, options);
    res.json(vitals);
  } catch (error) {
    console.error('Error getting vital signs:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/charts/:id/allergies
 * @desc    Add an allergy to a chart
 * @access  Private
 */
router.post('/:id/allergies', async (req, res) => {
  try {
    const chartId = req.params.id;
    const allergyData = {
      ...req.body,
      chart_id: chartId
    };
    
    // Validate required fields
    if (!allergyData.allergen) {
      return res.status(400).json({ message: 'Allergen is required' });
    }
    
    const allergy = await chartModel.addAllergy(allergyData);
    res.status(201).json(allergy);
  } catch (error) {
    console.error('Error adding allergy:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id/allergies
 * @desc    Get allergies for a chart
 * @access  Private
 */
router.get('/:id/allergies', async (req, res) => {
  try {
    const chartId = req.params.id;
    const allergies = await chartModel.getAllergies(chartId);
    res.json(allergies);
  } catch (error) {
    console.error('Error getting allergies:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/charts/:id/history
 * @desc    Add a medical history item to a chart
 * @access  Private
 */
router.post('/:id/history', async (req, res) => {
  try {
    const chartId = req.params.id;
    const historyData = {
      ...req.body,
      chart_id: chartId
    };
    
    // Validate required fields
    if (!historyData.condition) {
      return res.status(400).json({ message: 'Condition is required' });
    }
    
    const history = await chartModel.addMedicalHistory(historyData);
    res.status(201).json(history);
  } catch (error) {
    console.error('Error adding medical history:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id/history
 * @desc    Get medical history for a chart
 * @access  Private
 */
router.get('/:id/history', async (req, res) => {
  try {
    const chartId = req.params.id;
    const status = req.query.status;
    
    const history = await chartModel.getMedicalHistory(chartId, status);
    res.json(history);
  } catch (error) {
    console.error('Error getting medical history:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/charts/:id/labs
 * @desc    Add a lab result to a chart
 * @access  Private
 */
router.post('/:id/labs', async (req, res) => {
  try {
    const chartId = req.params.id;
    const labData = {
      ...req.body,
      chart_id: chartId
    };
    
    // Validate required fields
    if (!labData.test_name) {
      return res.status(400).json({ message: 'Test name is required' });
    }
    
    if (!labData.test_date) {
      return res.status(400).json({ message: 'Test date is required' });
    }
    
    if (!labData.result) {
      return res.status(400).json({ message: 'Result is required' });
    }
    
    const lab = await chartModel.addLabResult(labData);
    res.status(201).json(lab);
  } catch (error) {
    console.error('Error adding lab result:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id/labs
 * @desc    Get lab results for a chart
 * @access  Private
 */
router.get('/:id/labs', async (req, res) => {
  try {
    const chartId = req.params.id;
    const options = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      abnormalOnly: req.query.abnormalOnly === 'true'
    };
    
    const labs = await chartModel.getLabResults(chartId, options);
    res.json(labs);
  } catch (error) {
    console.error('Error getting lab results:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/charts/:id/documents
 * @desc    Add a document to a chart
 * @access  Private
 */
router.post('/:id/documents', async (req, res) => {
  try {
    const chartId = req.params.id;
    const documentData = {
      ...req.body,
      chart_id: chartId
    };
    
    // Validate required fields
    if (!documentData.document_type) {
      return res.status(400).json({ message: 'Document type is required' });
    }
    
    if (!documentData.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!documentData.file_path) {
      return res.status(400).json({ message: 'File path is required' });
    }
    
    const document = await chartModel.addDocument(documentData);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/charts/:id/documents
 * @desc    Get documents for a chart
 * @access  Private
 */
router.get('/:id/documents', async (req, res) => {
  try {
    const chartId = req.params.id;
    const documentType = req.query.type;
    
    const documents = await chartModel.getDocuments(chartId, documentType);
    res.json(documents);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/documents/:id
 * @desc    Get a document by ID
 * @access  Private
 */
router.get('/documents/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await chartModel.getDocumentById(documentId);
    res.json(document);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
