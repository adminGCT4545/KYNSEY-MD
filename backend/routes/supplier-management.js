import express from 'express';
import supplierManagementModel from '../models/supplierManagementModel.js';

const router = express.Router();

/**
 * @route GET /api/supplier-management/suppliers
 * @desc Get all suppliers with optional filtering
 * @access Public
 */
router.get('/suppliers', async (req, res) => {
  try {
    const { status, country, limit } = req.query;
    const suppliers = await supplierManagementModel.getAllSuppliers(status, country, limit);
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/suppliers/:id
 * @desc Get a supplier by ID
 * @access Public
 */
router.get('/suppliers/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await supplierManagementModel.getSupplierById(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (err) {
    console.error('Error fetching supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/suppliers
 * @desc Create a new supplier
 * @access Public
 */
router.post('/suppliers', async (req, res) => {
  try {
    const supplierData = req.body;
    const supplier = await supplierManagementModel.createSupplier(supplierData);
    
    if (!supplier) {
      return res.status(400).json({ error: 'Failed to create supplier' });
    }
    
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PUT /api/supplier-management/suppliers/:id
 * @desc Update a supplier
 * @access Public
 */
router.put('/suppliers/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplierData = req.body;
    const supplier = await supplierManagementModel.updateSupplier(supplierId, supplierData);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/supplier-management/suppliers/:id
 * @desc Delete a supplier
 * @access Public
 */
router.delete('/suppliers/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const deleted = await supplierManagementModel.deleteSupplier(supplierId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/suppliers/:id/certifications
 * @desc Get supplier certifications
 * @access Public
 */
router.get('/suppliers/:id/certifications', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const certifications = await supplierManagementModel.getSupplierCertifications(supplierId);
    res.json(certifications);
  } catch (err) {
    console.error('Error fetching supplier certifications:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/suppliers/:id/certifications
 * @desc Add a certification to a supplier
 * @access Public
 */
router.post('/suppliers/:id/certifications', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const certificationData = {
      ...req.body,
      supplier_id: supplierId
    };
    
    const certification = await supplierManagementModel.addSupplierCertification(certificationData);
    
    if (!certification) {
      return res.status(400).json({ error: 'Failed to add certification' });
    }
    
    res.status(201).json(certification);
  } catch (err) {
    console.error('Error adding supplier certification:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/suppliers/:id/performance
 * @desc Get supplier performance evaluations
 * @access Public
 */
router.get('/suppliers/:id/performance', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const evaluations = await supplierManagementModel.getSupplierPerformanceEvaluations(supplierId);
    res.json(evaluations);
  } catch (err) {
    console.error('Error fetching supplier performance evaluations:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/suppliers/:id/performance
 * @desc Add a performance evaluation for a supplier
 * @access Public
 */
router.post('/suppliers/:id/performance', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const evaluationData = {
      ...req.body,
      supplier_id: supplierId
    };
    
    const evaluation = await supplierManagementModel.addSupplierPerformanceEvaluation(evaluationData);
    
    if (!evaluation) {
      return res.status(400).json({ error: 'Failed to add performance evaluation' });
    }
    
    res.status(201).json(evaluation);
  } catch (err) {
    console.error('Error adding supplier performance evaluation:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/suppliers/:id/risk
 * @desc Get supplier risk assessments
 * @access Public
 */
router.get('/suppliers/:id/risk', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const assessments = await supplierManagementModel.getSupplierRiskAssessments(supplierId);
    res.json(assessments);
  } catch (err) {
    console.error('Error fetching supplier risk assessments:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/suppliers/:id/risk
 * @desc Add a risk assessment for a supplier
 * @access Public
 */
router.post('/suppliers/:id/risk', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const assessmentData = {
      ...req.body,
      supplier_id: supplierId
    };
    
    const assessment = await supplierManagementModel.addSupplierRiskAssessment(assessmentData);
    
    if (!assessment) {
      return res.status(400).json({ error: 'Failed to add risk assessment' });
    }
    
    res.status(201).json(assessment);
  } catch (err) {
    console.error('Error adding supplier risk assessment:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/suppliers/:id/contracts
 * @desc Get supplier contracts
 * @access Public
 */
router.get('/suppliers/:id/contracts', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const contracts = await supplierManagementModel.getSupplierContracts(supplierId);
    res.json(contracts);
  } catch (err) {
    console.error('Error fetching supplier contracts:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/suppliers/:id/contracts
 * @desc Add a contract for a supplier
 * @access Public
 */
router.post('/suppliers/:id/contracts', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const contractData = {
      ...req.body,
      supplier_id: supplierId
    };
    
    const contract = await supplierManagementModel.addSupplierContract(contractData);
    
    if (!contract) {
      return res.status(400).json({ error: 'Failed to add contract' });
    }
    
    res.status(201).json(contract);
  } catch (err) {
    console.error('Error adding supplier contract:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/contracts/:id/milestones
 * @desc Get contract milestones
 * @access Public
 */
router.get('/contracts/:id/milestones', async (req, res) => {
  try {
    const contractId = req.params.id;
    const milestones = await supplierManagementModel.getContractMilestones(contractId);
    res.json(milestones);
  } catch (err) {
    console.error('Error fetching contract milestones:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/contracts/:id/milestones
 * @desc Add a milestone to a contract
 * @access Public
 */
router.post('/contracts/:id/milestones', async (req, res) => {
  try {
    const contractId = req.params.id;
    const milestoneData = {
      ...req.body,
      contract_id: contractId
    };
    
    const milestone = await supplierManagementModel.addContractMilestone(milestoneData);
    
    if (!milestone) {
      return res.status(400).json({ error: 'Failed to add milestone' });
    }
    
    res.status(201).json(milestone);
  } catch (err) {
    console.error('Error adding contract milestone:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/suppliers/:id/documents
 * @desc Get supplier documents
 * @access Public
 */
router.get('/suppliers/:id/documents', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const documents = await supplierManagementModel.getSupplierDocuments(supplierId);
    res.json(documents);
  } catch (err) {
    console.error('Error fetching supplier documents:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/supplier-management/suppliers/:id/documents
 * @desc Add a document for a supplier
 * @access Public
 */
router.post('/suppliers/:id/documents', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const documentData = {
      ...req.body,
      supplier_id: supplierId
    };
    
    const document = await supplierManagementModel.addSupplierDocument(documentData);
    
    if (!document) {
      return res.status(400).json({ error: 'Failed to add document' });
    }
    
    res.status(201).json(document);
  } catch (err) {
    console.error('Error adding supplier document:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/expiring-contracts
 * @desc Get suppliers with expiring contracts
 * @access Public
 */
router.get('/expiring-contracts', async (req, res) => {
  try {
    const { days } = req.query;
    const daysThreshold = days ? parseInt(days) : 90;
    const suppliers = await supplierManagementModel.getSuppliersWithExpiringContracts(daysThreshold);
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers with expiring contracts:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/expiring-certifications
 * @desc Get suppliers with expiring certifications
 * @access Public
 */
router.get('/expiring-certifications', async (req, res) => {
  try {
    const { days } = req.query;
    const daysThreshold = days ? parseInt(days) : 90;
    const suppliers = await supplierManagementModel.getSuppliersWithExpiringCertifications(daysThreshold);
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers with expiring certifications:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/upcoming-risk-assessments
 * @desc Get suppliers with upcoming risk assessments
 * @access Public
 */
router.get('/upcoming-risk-assessments', async (req, res) => {
  try {
    const { days } = req.query;
    const daysThreshold = days ? parseInt(days) : 30;
    const suppliers = await supplierManagementModel.getSuppliersWithUpcomingRiskAssessments(daysThreshold);
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers with upcoming risk assessments:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/high-risk-suppliers
 * @desc Get suppliers with high risk
 * @access Public
 */
router.get('/high-risk-suppliers', async (req, res) => {
  try {
    const suppliers = await supplierManagementModel.getHighRiskSuppliers();
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching high risk suppliers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/top-performing-suppliers
 * @desc Get top performing suppliers
 * @access Public
 */
router.get('/top-performing-suppliers', async (req, res) => {
  try {
    const { limit } = req.query;
    const limitValue = limit ? parseInt(limit) : 10;
    const suppliers = await supplierManagementModel.getTopPerformingSuppliers(limitValue);
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching top performing suppliers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/performance-summary
 * @desc Get supplier performance summary
 * @access Public
 */
router.get('/performance-summary', async (req, res) => {
  try {
    const summary = await supplierManagementModel.getSupplierPerformanceSummary();
    res.json(summary);
  } catch (err) {
    console.error('Error fetching supplier performance summary:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/onboarding-stats
 * @desc Get supplier onboarding statistics
 * @access Public
 */
router.get('/onboarding-stats', async (req, res) => {
  try {
    const { months } = req.query;
    const monthsValue = months ? parseInt(months) : 12;
    const stats = await supplierManagementModel.getSupplierOnboardingStats(monthsValue);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching supplier onboarding statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/contract-stats
 * @desc Get supplier contract statistics
 * @access Public
 */
router.get('/contract-stats', async (req, res) => {
  try {
    const stats = await supplierManagementModel.getSupplierContractStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching supplier contract statistics:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
