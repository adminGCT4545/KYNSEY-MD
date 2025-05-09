/**
 * KYNSEY MD - Billing Routes
 * API endpoints for medical billing, claims, and payments
 */

const express = require('express');
const router = express.Router();
const billingModel = require('../../models/medical/billingModel');

/**
 * @route   POST /api/medical/billing/claims
 * @desc    Create a new insurance claim
 * @access  Private
 */
router.post('/claims', async (req, res) => {
  try {
    const claimData = req.body;
    
    // Validate required fields
    if (!claimData.patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    if (!claimData.insurance_id) {
      return res.status(400).json({ message: 'Insurance ID is required' });
    }
    
    if (!claimData.date_of_service) {
      return res.status(400).json({ message: 'Date of service is required' });
    }
    
    if (!claimData.total_amount) {
      return res.status(400).json({ message: 'Total amount is required' });
    }
    
    if (!claimData.status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const claim = await billingModel.createClaim(claimData);
    res.status(201).json(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/claims/:id
 * @desc    Get a claim by ID
 * @access  Private
 */
router.get('/claims/:id', async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await billingModel.getClaimById(claimId);
    res.json(claim);
  } catch (error) {
    console.error('Error getting claim:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/claims
 * @desc    Get claims with optional filtering
 * @access  Private
 */
router.get('/claims', async (req, res) => {
  try {
    const filters = {
      patient_id: req.query.patient_id,
      status: req.query.status,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };
    
    const options = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
      offset: req.query.offset ? parseInt(req.query.offset) : null
    };
    
    const claims = await billingModel.getClaims(filters, options);
    res.json(claims);
  } catch (error) {
    console.error('Error getting claims:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/medical/billing/claims/:id
 * @desc    Update a claim
 * @access  Private
 */
router.put('/claims/:id', async (req, res) => {
  try {
    const claimId = req.params.id;
    const claimData = req.body;
    
    const updatedClaim = await billingModel.updateClaim(claimId, claimData);
    res.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/claims/:id/items
 * @desc    Add a claim line item
 * @access  Private
 */
router.post('/claims/:id/items', async (req, res) => {
  try {
    const claimId = req.params.id;
    const itemData = {
      ...req.body,
      claim_id: claimId
    };
    
    // Validate required fields
    if (!itemData.service_id) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    
    if (!itemData.procedure_code) {
      return res.status(400).json({ message: 'Procedure code is required' });
    }
    
    if (!itemData.charge_amount) {
      return res.status(400).json({ message: 'Charge amount is required' });
    }
    
    const item = await billingModel.addClaimItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding claim item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/claims/:id/items
 * @desc    Get claim line items
 * @access  Private
 */
router.get('/claims/:id/items', async (req, res) => {
  try {
    const claimId = req.params.id;
    const items = await billingModel.getClaimItems(claimId);
    res.json(items);
  } catch (error) {
    console.error('Error getting claim items:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/medical/billing/claim-items/:id
 * @desc    Update a claim line item
 * @access  Private
 */
router.put('/claim-items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemData = req.body;
    
    const updatedItem = await billingModel.updateClaimItem(itemId, itemData);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating claim item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/medical/billing/claim-items/:id
 * @desc    Delete a claim line item
 * @access  Private
 */
router.delete('/claim-items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    await billingModel.deleteClaimItem(itemId);
    res.json({ message: 'Claim item deleted successfully' });
  } catch (error) {
    console.error('Error deleting claim item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/payments
 * @desc    Add a payment
 * @access  Private
 */
router.post('/payments', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validate required fields
    if (!paymentData.patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    if (!paymentData.payment_date) {
      return res.status(400).json({ message: 'Payment date is required' });
    }
    
    if (!paymentData.payment_method) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    if (!paymentData.payment_amount) {
      return res.status(400).json({ message: 'Payment amount is required' });
    }
    
    const payment = await billingModel.addPayment(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/payments
 * @desc    Get payments with optional filtering
 * @access  Private
 */
router.get('/payments', async (req, res) => {
  try {
    const filters = {
      patient_id: req.query.patient_id,
      claim_id: req.query.claim_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };
    
    const options = {
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    
    const payments = await billingModel.getPayments(filters, options);
    res.json(payments);
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/insurance-payments
 * @desc    Add an insurance payment
 * @access  Private
 */
router.post('/insurance-payments', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validate required fields
    if (!paymentData.claim_id) {
      return res.status(400).json({ message: 'Claim ID is required' });
    }
    
    if (!paymentData.payment_date) {
      return res.status(400).json({ message: 'Payment date is required' });
    }
    
    if (!paymentData.payment_amount) {
      return res.status(400).json({ message: 'Payment amount is required' });
    }
    
    if (!paymentData.payer_name) {
      return res.status(400).json({ message: 'Payer name is required' });
    }
    
    const payment = await billingModel.addInsurancePayment(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error adding insurance payment:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/claims/:id/insurance-payments
 * @desc    Get insurance payments for a claim
 * @access  Private
 */
router.get('/claims/:id/insurance-payments', async (req, res) => {
  try {
    const claimId = req.params.id;
    const payments = await billingModel.getInsurancePayments(claimId);
    res.json(payments);
  } catch (error) {
    console.error('Error getting insurance payments:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/statements
 * @desc    Create a patient statement
 * @access  Private
 */
router.post('/statements', async (req, res) => {
  try {
    const statementData = req.body;
    
    // Validate required fields
    if (!statementData.patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    if (!statementData.statement_date) {
      return res.status(400).json({ message: 'Statement date is required' });
    }
    
    if (!statementData.due_date) {
      return res.status(400).json({ message: 'Due date is required' });
    }
    
    if (!statementData.total_amount) {
      return res.status(400).json({ message: 'Total amount is required' });
    }
    
    if (!statementData.remaining_amount) {
      return res.status(400).json({ message: 'Remaining amount is required' });
    }
    
    if (!statementData.status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const statement = await billingModel.createStatement(statementData);
    res.status(201).json(statement);
  } catch (error) {
    console.error('Error creating statement:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/statements/:id
 * @desc    Get a statement by ID
 * @access  Private
 */
router.get('/statements/:id', async (req, res) => {
  try {
    const statementId = req.params.id;
    const statement = await billingModel.getStatementById(statementId);
    res.json(statement);
  } catch (error) {
    console.error('Error getting statement:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/patients/:id/statements
 * @desc    Get statements for a patient
 * @access  Private
 */
router.get('/patients/:id/statements', async (req, res) => {
  try {
    const patientId = req.params.id;
    const status = req.query.status;
    
    const statements = await billingModel.getPatientStatements(patientId, status);
    res.json(statements);
  } catch (error) {
    console.error('Error getting patient statements:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/medical/billing/statements/:id
 * @desc    Update a statement
 * @access  Private
 */
router.put('/statements/:id', async (req, res) => {
  try {
    const statementId = req.params.id;
    const statementData = req.body;
    
    const updatedStatement = await billingModel.updateStatement(statementId, statementData);
    res.json(updatedStatement);
  } catch (error) {
    console.error('Error updating statement:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/statements/:id/items
 * @desc    Add a statement line item
 * @access  Private
 */
router.post('/statements/:id/items', async (req, res) => {
  try {
    const statementId = req.params.id;
    const itemData = {
      ...req.body,
      statement_id: statementId
    };
    
    // Validate required fields
    if (!itemData.service_date) {
      return res.status(400).json({ message: 'Service date is required' });
    }
    
    if (!itemData.description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!itemData.charge_amount) {
      return res.status(400).json({ message: 'Charge amount is required' });
    }
    
    if (itemData.insurance_paid === undefined) {
      return res.status(400).json({ message: 'Insurance paid amount is required' });
    }
    
    if (itemData.adjustments === undefined) {
      return res.status(400).json({ message: 'Adjustments amount is required' });
    }
    
    if (itemData.patient_paid === undefined) {
      return res.status(400).json({ message: 'Patient paid amount is required' });
    }
    
    if (!itemData.balance) {
      return res.status(400).json({ message: 'Balance is required' });
    }
    
    const item = await billingModel.addStatementItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding statement item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/statements/:id/items
 * @desc    Get statement line items
 * @access  Private
 */
router.get('/statements/:id/items', async (req, res) => {
  try {
    const statementId = req.params.id;
    const items = await billingModel.getStatementItems(statementId);
    res.json(items);
  } catch (error) {
    console.error('Error getting statement items:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/superbills
 * @desc    Create a superbill
 * @access  Private
 */
router.post('/superbills', async (req, res) => {
  try {
    const superbillData = req.body;
    
    // Validate required fields
    if (!superbillData.appointment_id) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }
    
    if (!superbillData.provider_id) {
      return res.status(400).json({ message: 'Provider ID is required' });
    }
    
    if (!superbillData.patient_id) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    if (!superbillData.date_of_service) {
      return res.status(400).json({ message: 'Date of service is required' });
    }
    
    if (!superbillData.diagnosis_codes) {
      return res.status(400).json({ message: 'Diagnosis codes are required' });
    }
    
    if (!superbillData.total_amount) {
      return res.status(400).json({ message: 'Total amount is required' });
    }
    
    if (!superbillData.status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const superbill = await billingModel.createSuperbill(superbillData);
    res.status(201).json(superbill);
  } catch (error) {
    console.error('Error creating superbill:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/superbills/:id
 * @desc    Get a superbill by ID
 * @access  Private
 */
router.get('/superbills/:id', async (req, res) => {
  try {
    const superbillId = req.params.id;
    const superbill = await billingModel.getSuperbillById(superbillId);
    res.json(superbill);
  } catch (error) {
    console.error('Error getting superbill:', error);
    res.status(404).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/superbills
 * @desc    Get superbills with optional filtering
 * @access  Private
 */
router.get('/superbills', async (req, res) => {
  try {
    const filters = {
      patient_id: req.query.patient_id,
      provider_id: req.query.provider_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      status: req.query.status
    };
    
    const superbills = await billingModel.getSuperbills(filters);
    res.json(superbills);
  } catch (error) {
    console.error('Error getting superbills:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/medical/billing/superbills/:id
 * @desc    Update a superbill
 * @access  Private
 */
router.put('/superbills/:id', async (req, res) => {
  try {
    const superbillId = req.params.id;
    const superbillData = req.body;
    
    const updatedSuperbill = await billingModel.updateSuperbill(superbillId, superbillData);
    res.json(updatedSuperbill);
  } catch (error) {
    console.error('Error updating superbill:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/medical/billing/superbills/:id/items
 * @desc    Add a superbill line item
 * @access  Private
 */
router.post('/superbills/:id/items', async (req, res) => {
  try {
    const superbillId = req.params.id;
    const itemData = {
      ...req.body,
      superbill_id: superbillId
    };
    
    // Validate required fields
    if (!itemData.service_id) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    
    if (!itemData.procedure_code) {
      return res.status(400).json({ message: 'Procedure code is required' });
    }
    
    if (!itemData.description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!itemData.units) {
      return res.status(400).json({ message: 'Units are required' });
    }
    
    if (!itemData.charge_amount) {
      return res.status(400).json({ message: 'Charge amount is required' });
    }
    
    const item = await billingModel.addSuperbillItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding superbill item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/medical/billing/superbills/:id/items
 * @desc    Get superbill line items
 * @access  Private
 */
router.get('/superbills/:id/items', async (req, res) => {
  try {
    const superbillId = req.params.id;
    const items = await billingModel.getSuperbillItems(superbillId);
    res.json(items);
  } catch (error) {
    console.error('Error getting superbill items:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
