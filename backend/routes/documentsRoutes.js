/**
 * Patient Documents Routes
 * RESTful endpoints for document management
 */

const express = require('express');
const router = express.Router();
const documentsModel = require('../models/documentsModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

// Configure file storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, TIFF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

/**
 * @route POST /api/medical/documents
 * @desc Upload a new document
 * @access Private
 */
router.post('/', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { chart_id, document_type, title, description } = req.body;

    if (!chart_id || !document_type || !title) {
      // Delete the uploaded file if validation fails
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const documentData = {
      chart_id,
      document_type,
      title,
      file_path: req.file.path,
      description: description || ''
    };

    const document = await documentsModel.createDocument(documentData);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error in upload document route:', error);
    
    // Delete the uploaded file if an error occurs
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/:id
 * @desc Get document metadata by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const document = await documentsModel.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error in get document route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/download/:id
 * @desc Download a document
 * @access Private
 */
router.get('/download/:id', async (req, res) => {
  try {
    const document = await documentsModel.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.download(document.file_path, path.basename(document.file_path), (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  } catch (error) {
    console.error('Error in download document route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/chart/:chartId
 * @desc Get documents by chart ID
 * @access Private
 */
router.get('/chart/:chartId', async (req, res) => {
  try {
    const documents = await documentsModel.getDocumentsByChart(req.params.chartId);
    res.json(documents);
  } catch (error) {
    console.error('Error in get documents by chart route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route PUT /api/medical/documents/:id
 * @desc Update document metadata
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { document_type, title, description } = req.body;
    
    const documentData = { document_type, title, description };
    
    const updatedDocument = await documentsModel.updateDocument(req.params.id, documentData);
    
    if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error in update document route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route DELETE /api/medical/documents/:id
 * @desc Delete a document
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await documentsModel.deleteDocument(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in delete document route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/patient/:patientId
 * @desc Get documents by patient ID
 * @access Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const documents = await documentsModel.getDocumentsByPatient(req.params.patientId);
    res.json(documents);
  } catch (error) {
    console.error('Error in get documents by patient route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/type/:chartId/:documentType
 * @desc Get documents by type
 * @access Private
 */
router.get('/type/:chartId/:documentType', async (req, res) => {
  try {
    const documents = await documentsModel.getDocumentsByType(
      req.params.chartId,
      req.params.documentType
    );
    res.json(documents);
  } catch (error) {
    console.error('Error in get documents by type route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/search/:patientId
 * @desc Search documents by title or description
 * @access Private
 */
router.get('/search/:patientId', async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const documents = await documentsModel.searchDocuments(req.params.patientId, term);
    res.json(documents);
  } catch (error) {
    console.error('Error in search documents route:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /api/medical/documents/stats/:patientId
 * @desc Get document storage statistics
 * @access Private
 */
router.get('/stats/:patientId', async (req, res) => {
  try {
    const stats = await documentsModel.getDocumentStats(req.params.patientId);
    res.json(stats);
  } catch (error) {
    console.error('Error in document stats route:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;