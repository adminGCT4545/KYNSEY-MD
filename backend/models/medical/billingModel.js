/**
 * KYNSEY MD - Billing Model
 * Handles operations related to medical billing, claims, and payments
 */

const db = require('../../utils/db');

/**
 * Billing Model
 * Provides methods for managing medical billing, claims, and payments
 */
const billingModel = {
  /**
   * Create a new insurance claim
   * @param {Object} claimData - Claim data
   * @param {number} claimData.patient_id - Patient ID
   * @param {number} claimData.appointment_id - Appointment ID (optional)
   * @param {number} claimData.insurance_id - Insurance ID
   * @param {string} claimData.claim_number - Claim number (optional)
   * @param {Date} claimData.date_of_service - Date of service
   * @param {Date} claimData.date_submitted - Date submitted (optional)
   * @param {number} claimData.total_amount - Total amount
   * @param {string} claimData.status - Status (e.g., 'Pending', 'Submitted', 'Paid', 'Denied')
   * @param {string} claimData.notes - Notes (optional)
   * @returns {Promise<Object>} - Created claim
   */
  async createClaim(claimData) {
    try {
      const {
        patient_id,
        appointment_id,
        insurance_id,
        claim_number,
        date_of_service,
        date_submitted,
        total_amount,
        status,
        notes
      } = claimData;
      
      // Check if patient exists
      const patientExists = await db.query(
        'SELECT patient_id FROM medical_patients WHERE patient_id = $1',
        [patient_id]
      );
      
      if (patientExists.rows.length === 0) {
        throw new Error(`Patient with ID ${patient_id} not found`);
      }
      
      // Check if insurance exists
      const insuranceExists = await db.query(
        'SELECT insurance_id FROM medical_patient_insurance WHERE insurance_id = $1',
        [insurance_id]
      );
      
      if (insuranceExists.rows.length === 0) {
        throw new Error(`Insurance with ID ${insurance_id} not found`);
      }
      
      // Create new claim
      const result = await db.query(
        `INSERT INTO medical_claims 
        (patient_id, appointment_id, insurance_id, claim_number, date_of_service, 
         date_submitted, total_amount, status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [
          patient_id, appointment_id, insurance_id, claim_number, date_of_service,
          date_submitted, total_amount, status, notes
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  },
  
  /**
   * Get a claim by ID
   * @param {number} claimId - Claim ID
   * @returns {Promise<Object>} - Claim data
   */
  async getClaimById(claimId) {
    try {
      const result = await db.query(
        `SELECT c.*, 
          p.first_name as patient_first_name, 
          p.last_name as patient_last_name,
          i.payer_name as insurance_name,
          i.policy_number
        FROM medical_claims c
        JOIN medical_patients p ON c.patient_id = p.patient_id
        JOIN medical_patient_insurance i ON c.insurance_id = i.insurance_id
        WHERE c.claim_id = $1`,
        [claimId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting claim by ID:', error);
      throw error;
    }
  },
  
  /**
   * Get claims with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {number} filters.patient_id - Filter by patient ID
   * @param {string} filters.status - Filter by status
   * @param {Date} filters.date_from - Filter by date of service (from)
   * @param {Date} filters.date_to - Filter by date of service (to)
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Field to sort by (default: 'date_of_service')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {number} options.limit - Maximum number of claims to return
   * @param {number} options.offset - Number of claims to skip
   * @returns {Promise<Array>} - Claims
   */
  async getClaims(filters = {}, options = {}) {
    try {
      const {
        patient_id,
        status,
        date_from,
        date_to
      } = filters;
      
      const {
        sortBy = 'date_of_service',
        sortOrder = 'desc',
        limit,
        offset
      } = options;
      
      // Validate sort parameters
      const validSortFields = ['date_of_service', 'date_submitted', 'total_amount', 'status', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        throw new Error(`Invalid sort field: ${sortBy}`);
      }
      
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        throw new Error(`Invalid sort order: ${sortOrder}`);
      }
      
      // Build query
      let query = `
        SELECT c.*, 
          p.first_name as patient_first_name, 
          p.last_name as patient_last_name,
          i.payer_name as insurance_name
        FROM medical_claims c
        JOIN medical_patients p ON c.patient_id = p.patient_id
        JOIN medical_patient_insurance i ON c.insurance_id = i.insurance_id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Add filters
      if (patient_id) {
        queryParams.push(patient_id);
        query += ` AND c.patient_id = $${queryParams.length}`;
      }
      
      if (status) {
        queryParams.push(status);
        query += ` AND c.status = $${queryParams.length}`;
      }
      
      if (date_from) {
        queryParams.push(date_from);
        query += ` AND c.date_of_service >= $${queryParams.length}`;
      }
      
      if (date_to) {
        queryParams.push(date_to);
        query += ` AND c.date_of_service <= $${queryParams.length}`;
      }
      
      // Add sorting
      query += ` ORDER BY c.${sortBy} ${sortOrder}`;
      
      // Add limit and offset
      if (limit) {
        queryParams.push(limit);
        query += ` LIMIT $${queryParams.length}`;
      }
      
      if (offset) {
        queryParams.push(offset);
        query += ` OFFSET $${queryParams.length}`;
      }
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting claims:', error);
      throw error;
    }
  },
  
  /**
   * Update a claim
   * @param {number} claimId - Claim ID
   * @param {Object} claimData - Claim data to update
   * @returns {Promise<Object>} - Updated claim
   */
  async updateClaim(claimId, claimData) {
    try {
      const {
        claim_number,
        date_submitted,
        total_amount,
        status,
        notes
      } = claimData;
      
      // Check if claim exists
      const claimExists = await db.query(
        'SELECT claim_id FROM medical_claims WHERE claim_id = $1',
        [claimId]
      );
      
      if (claimExists.rows.length === 0) {
        throw new Error(`Claim with ID ${claimId} not found`);
      }
      
      // Update claim
      const result = await db.query(
        `UPDATE medical_claims 
        SET claim_number = COALESCE($1, claim_number),
            date_submitted = COALESCE($2, date_submitted),
            total_amount = COALESCE($3, total_amount),
            status = COALESCE($4, status),
            notes = COALESCE($5, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE claim_id = $6
        RETURNING *`,
        [claim_number, date_submitted, total_amount, status, notes, claimId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  },
  
  /**
   * Add a claim line item
   * @param {Object} itemData - Claim line item data
   * @param {number} itemData.claim_id - Claim ID
   * @param {number} itemData.service_id - Service ID
   * @param {string} itemData.procedure_code - Procedure code
   * @param {string} itemData.diagnosis_code - Diagnosis code (optional)
   * @param {string} itemData.modifier - Modifier (optional)
   * @param {number} itemData.units - Units
   * @param {number} itemData.charge_amount - Charge amount
   * @param {number} itemData.allowed_amount - Allowed amount (optional)
   * @param {number} itemData.paid_amount - Paid amount (optional)
   * @param {number} itemData.adjustment_amount - Adjustment amount (optional)
   * @param {number} itemData.patient_responsibility - Patient responsibility (optional)
   * @returns {Promise<Object>} - Created claim line item
   */
  async addClaimItem(itemData) {
    try {
      const {
        claim_id,
        service_id,
        procedure_code,
        diagnosis_code,
        modifier,
        units,
        charge_amount,
        allowed_amount,
        paid_amount,
        adjustment_amount,
        patient_responsibility
      } = itemData;
      
      // Check if claim exists
      const claimExists = await db.query(
        'SELECT claim_id FROM medical_claims WHERE claim_id = $1',
        [claim_id]
      );
      
      if (claimExists.rows.length === 0) {
        throw new Error(`Claim with ID ${claim_id} not found`);
      }
      
      // Check if service exists
      const serviceExists = await db.query(
        'SELECT service_id FROM medical_services WHERE service_id = $1',
        [service_id]
      );
      
      if (serviceExists.rows.length === 0) {
        throw new Error(`Service with ID ${service_id} not found`);
      }
      
      // Add claim item
      const result = await db.query(
        `INSERT INTO medical_claim_items 
        (claim_id, service_id, procedure_code, diagnosis_code, modifier, units, 
         charge_amount, allowed_amount, paid_amount, adjustment_amount, patient_responsibility) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          claim_id, service_id, procedure_code, diagnosis_code, modifier, units,
          charge_amount, allowed_amount, paid_amount, adjustment_amount, patient_responsibility
        ]
      );
      
      // Update claim total amount
      await this.updateClaimTotal(claim_id);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding claim item:', error);
      throw error;
    }
  },
  
  /**
   * Get claim line items
   * @param {number} claimId - Claim ID
   * @returns {Promise<Array>} - Claim line items
   */
  async getClaimItems(claimId) {
    try {
      const result = await db.query(
        `SELECT i.*, s.name as service_name
        FROM medical_claim_items i
        JOIN medical_services s ON i.service_id = s.service_id
        WHERE i.claim_id = $1
        ORDER BY i.item_id`,
        [claimId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting claim items:', error);
      throw error;
    }
  },
  
  /**
   * Update a claim line item
   * @param {number} itemId - Item ID
   * @param {Object} itemData - Item data to update
   * @returns {Promise<Object>} - Updated claim line item
   */
  async updateClaimItem(itemId, itemData) {
    try {
      const {
        procedure_code,
        diagnosis_code,
        modifier,
        units,
        charge_amount,
        allowed_amount,
        paid_amount,
        adjustment_amount,
        patient_responsibility
      } = itemData;
      
      // Check if item exists
      const itemExists = await db.query(
        'SELECT item_id, claim_id FROM medical_claim_items WHERE item_id = $1',
        [itemId]
      );
      
      if (itemExists.rows.length === 0) {
        throw new Error(`Claim item with ID ${itemId} not found`);
      }
      
      const claimId = itemExists.rows[0].claim_id;
      
      // Update claim item
      const result = await db.query(
        `UPDATE medical_claim_items 
        SET procedure_code = COALESCE($1, procedure_code),
            diagnosis_code = COALESCE($2, diagnosis_code),
            modifier = COALESCE($3, modifier),
            units = COALESCE($4, units),
            charge_amount = COALESCE($5, charge_amount),
            allowed_amount = COALESCE($6, allowed_amount),
            paid_amount = COALESCE($7, paid_amount),
            adjustment_amount = COALESCE($8, adjustment_amount),
            patient_responsibility = COALESCE($9, patient_responsibility),
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = $10
        RETURNING *`,
        [
          procedure_code, diagnosis_code, modifier, units, charge_amount,
          allowed_amount, paid_amount, adjustment_amount, patient_responsibility, itemId
        ]
      );
      
      // Update claim total amount
      await this.updateClaimTotal(claimId);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating claim item:', error);
      throw error;
    }
  },
  
  /**
   * Delete a claim line item
   * @param {number} itemId - Item ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteClaimItem(itemId) {
    try {
      // Check if item exists
      const itemExists = await db.query(
        'SELECT item_id, claim_id FROM medical_claim_items WHERE item_id = $1',
        [itemId]
      );
      
      if (itemExists.rows.length === 0) {
        throw new Error(`Claim item with ID ${itemId} not found`);
      }
      
      const claimId = itemExists.rows[0].claim_id;
      
      // Delete claim item
      await db.query(
        'DELETE FROM medical_claim_items WHERE item_id = $1',
        [itemId]
      );
      
      // Update claim total amount
      await this.updateClaimTotal(claimId);
      
      return true;
    } catch (error) {
      console.error('Error deleting claim item:', error);
      throw error;
    }
  },
  
  /**
   * Update claim total amount based on line items
   * @param {number} claimId - Claim ID
   * @returns {Promise<Object>} - Updated claim
   */
  async updateClaimTotal(claimId) {
    try {
      // Calculate total from line items
      const totalResult = await db.query(
        'SELECT SUM(charge_amount) as total FROM medical_claim_items WHERE claim_id = $1',
        [claimId]
      );
      
      const total = totalResult.rows[0].total || 0;
      
      // Update claim total
      const result = await db.query(
        'UPDATE medical_claims SET total_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE claim_id = $2 RETURNING *',
        [total, claimId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating claim total:', error);
      throw error;
    }
  },
  
  /**
   * Add a payment
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.patient_id - Patient ID
   * @param {number} paymentData.claim_id - Claim ID (optional)
   * @param {Date} paymentData.payment_date - Payment date
   * @param {string} paymentData.payment_method - Payment method
   * @param {number} paymentData.payment_amount - Payment amount
   * @param {string} paymentData.reference_number - Reference number (optional)
   * @param {string} paymentData.notes - Notes (optional)
   * @returns {Promise<Object>} - Created payment
   */
  async addPayment(paymentData) {
    try {
      const {
        patient_id,
        claim_id,
        payment_date,
        payment_method,
        payment_amount,
        reference_number,
        notes
      } = paymentData;
      
      // Check if patient exists
      const patientExists = await db.query(
        'SELECT patient_id FROM medical_patients WHERE patient_id = $1',
        [patient_id]
      );
      
      if (patientExists.rows.length === 0) {
        throw new Error(`Patient with ID ${patient_id} not found`);
      }
      
      // If claim_id is provided, check if it exists
      if (claim_id) {
        const claimExists = await db.query(
          'SELECT claim_id FROM medical_claims WHERE claim_id = $1',
          [claim_id]
        );
        
        if (claimExists.rows.length === 0) {
          throw new Error(`Claim with ID ${claim_id} not found`);
        }
      }
      
      // Add payment
      const result = await db.query(
        `INSERT INTO medical_payments 
        (patient_id, claim_id, payment_date, payment_method, payment_amount, reference_number, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [patient_id, claim_id, payment_date, payment_method, payment_amount, reference_number, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },
  
  /**
   * Get payments with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {number} filters.patient_id - Filter by patient ID
   * @param {number} filters.claim_id - Filter by claim ID
   * @param {Date} filters.date_from - Filter by payment date (from)
   * @param {Date} filters.date_to - Filter by payment date (to)
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Field to sort by (default: 'payment_date')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @returns {Promise<Array>} - Payments
   */
  async getPayments(filters = {}, options = {}) {
    try {
      const {
        patient_id,
        claim_id,
        date_from,
        date_to
      } = filters;
      
      const {
        sortBy = 'payment_date',
        sortOrder = 'desc'
      } = options;
      
      // Validate sort parameters
      const validSortFields = ['payment_date', 'payment_amount', 'payment_method', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        throw new Error(`Invalid sort field: ${sortBy}`);
      }
      
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        throw new Error(`Invalid sort order: ${sortOrder}`);
      }
      
      // Build query
      let query = `
        SELECT p.*, 
          pt.first_name as patient_first_name, 
          pt.last_name as patient_last_name
        FROM medical_payments p
        JOIN medical_patients pt ON p.patient_id = pt.patient_id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Add filters
      if (patient_id) {
        queryParams.push(patient_id);
        query += ` AND p.patient_id = $${queryParams.length}`;
      }
      
      if (claim_id) {
        queryParams.push(claim_id);
        query += ` AND p.claim_id = $${queryParams.length}`;
      }
      
      if (date_from) {
        queryParams.push(date_from);
        query += ` AND p.payment_date >= $${queryParams.length}`;
      }
      
      if (date_to) {
        queryParams.push(date_to);
        query += ` AND p.payment_date <= $${queryParams.length}`;
      }
      
      // Add sorting
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  },
  
  /**
   * Add an insurance payment
   * @param {Object} paymentData - Insurance payment data
   * @param {number} paymentData.claim_id - Claim ID
   * @param {Date} paymentData.payment_date - Payment date
   * @param {number} paymentData.payment_amount - Payment amount
   * @param {string} paymentData.check_number - Check number (optional)
   * @param {string} paymentData.eft_reference - EFT reference (optional)
   * @param {string} paymentData.payer_name - Payer name
   * @param {string} paymentData.notes - Notes (optional)
   * @returns {Promise<Object>} - Created insurance payment
   */
  async addInsurancePayment(paymentData) {
    try {
      const {
        claim_id,
        payment_date,
        payment_amount,
        check_number,
        eft_reference,
        payer_name,
        notes
      } = paymentData;
      
      // Check if claim exists
      const claimExists = await db.query(
        'SELECT claim_id FROM medical_claims WHERE claim_id = $1',
        [claim_id]
      );
      
      if (claimExists.rows.length === 0) {
        throw new Error(`Claim with ID ${claim_id} not found`);
      }
      
      // Add insurance payment
      const result = await db.query(
        `INSERT INTO medical_insurance_payments 
        (claim_id, payment_date, payment_amount, check_number, eft_reference, payer_name, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [claim_id, payment_date, payment_amount, check_number, eft_reference, payer_name, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding insurance payment:', error);
      throw error;
    }
  },
  
  /**
   * Get insurance payments for a claim
   * @param {number} claimId - Claim ID
   * @returns {Promise<Array>} - Insurance payments
   */
  async getInsurancePayments(claimId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_insurance_payments WHERE claim_id = $1 ORDER BY payment_date DESC',
        [claimId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting insurance payments:', error);
      throw error;
    }
  },
  
  /**
   * Create a patient statement
   * @param {Object} statementData - Statement data
   * @param {number} statementData.patient_id - Patient ID
   * @param {Date} statementData.statement_date - Statement date
   * @param {Date} statementData.due_date - Due date
   * @param {number} statementData.total_amount - Total amount
   * @param {number} statementData.remaining_amount - Remaining amount
   * @param {string} statementData.status - Status
   * @param {string} statementData.notes - Notes (optional)
   * @returns {Promise<Object>} - Created statement
   */
  async createStatement(statementData) {
    try {
      const {
        patient_id,
        statement_date,
        due_date,
        total_amount,
        remaining_amount,
        status,
        notes
      } = statementData;
      
      // Check if patient exists
      const patientExists = await db.query(
        'SELECT patient_id FROM medical_patients WHERE patient_id = $1',
        [patient_id]
      );
      
      if (patientExists.rows.length === 0) {
        throw new Error(`Patient with ID ${patient_id} not found`);
      }
      
      // Create statement
      const result = await db.query(
        `INSERT INTO medical_patient_statements 
        (patient_id, statement_date, due_date, total_amount, remaining_amount, status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [patient_id, statement_date, due_date, total_amount, remaining_amount, status, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating statement:', error);
      throw error;
    }
  },
  
  /**
   * Get a statement by ID
   * @param {number} statementId - Statement ID
   * @returns {Promise<Object>} - Statement data
   */
  async getStatementById(statementId) {
    try {
      const result = await db.query(
        `SELECT s.*, 
          p.first_name as patient_first_name, 
          p.last_name as patient_last_name,
          p.email as patient_email,
          p.phone as patient_phone,
          p.address as patient_address,
          p.city as patient_city,
          p.state as patient_state,
          p.zip as patient_zip
        FROM medical_patient_statements s
        JOIN medical_patients p ON s.patient_id = p.patient_id
        WHERE s.statement_id = $1`,
        [statementId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Statement with ID ${statementId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting statement by ID:', error);
      throw error;
    }
  },
  
  /**
   * Get statements for a patient
   * @param {number} patientId - Patient ID
   * @param {string} status - Filter by status (optional)
   * @returns {Promise<Array>} - Statements
   */
  async getPatientStatements(patientId, status = null) {
    try {
      let query = 'SELECT * FROM medical_patient_statements WHERE patient_id = $1';
      const queryParams = [patientId];
      
      if (status) {
        query += ' AND status = $2';
        queryParams.push(status);
      }
      
      query += ' ORDER BY statement_date DESC';
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting patient statements:', error);
      throw error;
    }
  },
  
  /**
   * Update a statement
   * @param {number} statementId - Statement ID
   * @param {Object} statementData - Statement data to update
   * @returns {Promise<Object>} - Updated statement
   */
  async updateStatement(statementId, statementData) {
    try {
      const {
        due_date,
        remaining_amount,
        status,
        notes
      } = statementData;
      
      // Check if statement exists
      const statementExists = await db.query(
        'SELECT statement_id FROM medical_patient_statements WHERE statement_id = $1',
        [statementId]
      );
      
      if (statementExists.rows.length === 0) {
        throw new Error(`Statement with ID ${statementId} not found`);
      }
      
      // Update statement
      const result = await db.query(
        `UPDATE medical_patient_statements 
        SET due_date = COALESCE($1, due_date),
            remaining_amount = COALESCE($2, remaining_amount),
            status = COALESCE($3, status),
            notes = COALESCE($4, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE statement_id = $5
        RETURNING *`,
        [due_date, remaining_amount, status, notes, statementId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating statement:', error);
      throw error;
    }
  },
  
  /**
   * Add a statement line item
   * @param {Object} itemData - Statement line item data
   * @param {number} itemData.statement_id - Statement ID
   * @param {number} itemData.claim_id - Claim ID (optional)
   * @param {Date} itemData.service_date - Service date
   * @param {string} itemData.description - Description
   * @param {number} itemData.charge_amount - Charge amount
   * @param {number} itemData.insurance_paid - Insurance paid amount
   * @param {number} itemData.adjustments - Adjustments amount
   * @param {number} itemData.patient_paid - Patient paid amount
   * @param {number} itemData.balance - Balance amount
   * @returns {Promise<Object>} - Created statement line item
   */
  async addStatementItem(itemData) {
    try {
      const {
        statement_id,
        claim_id,
        service_date,
        description,
        charge_amount,
        insurance_paid,
        adjustments,
        patient_paid,
        balance
      } = itemData;
      
      // Check if statement exists
      const statementExists = await db.query(
        'SELECT statement_id FROM medical_patient_statements WHERE statement_id = $1',
        [statement_id]
      );
      
      if (statementExists.rows.length === 0) {
        throw new Error(`Statement with ID ${statement_id} not found`);
      }
      
      // Add statement item
      const result = await db.query(
        `INSERT INTO medical_statement_items 
        (statement_id, claim_id, service_date, description, charge_amount, 
         insurance_paid, adjustments, patient_paid, balance) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [
          statement_id, claim_id, service_date, description, charge_amount,
          insurance_paid, adjustments, patient_paid, balance
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding statement item:', error);
      throw error;
    }
  },
  
  /**
   * Get statement line items
   * @param {number} statementId - Statement ID
   * @returns {Promise<Array>} - Statement line items
   */
  async getStatementItems(statementId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_statement_items WHERE statement_id = $1 ORDER BY service_date',
        [statementId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting statement items:', error);
      throw error;
    }
  },
  
  /**
   * Create a superbill
   * @param {Object} superbillData - Superbill data
   * @param {number} superbillData.appointment_id - Appointment ID
   * @param {number} superbillData.provider_id - Provider ID
   * @param {number} superbillData.patient_id - Patient ID
   * @param {Date} superbillData.date_of_service - Date of service
   * @param {Array} superbillData.diagnosis_codes - Diagnosis codes
   * @param {number} superbillData.total_amount - Total amount
   * @param {string} superbillData.status - Status
   * @param {string} superbillData.notes - Notes (optional)
   * @returns {Promise<Object>} - Created superbill
   */
  async createSuperbill(superbillData) {
    try {
      const {
        appointment_id,
        provider_id,
        patient_id,
        date_of_service,
        diagnosis_codes,
        total_amount,
        status,
        notes
      } = superbillData;
      
      // Check if appointment exists
      const appointmentExists = await db.query(
        'SELECT appointment_id FROM medical_appointments WHERE appointment_id = $1',
        [appointment_id]
      );
      
      if (appointmentExists.rows.length === 0) {
        throw new Error(`Appointment with ID ${appointment_id} not found`);
      }
      
      // Check if provider exists
      const providerExists = await db.query(
        'SELECT provider_id FROM medical_providers WHERE provider_id = $1',
        [provider_id]
      );
      
      if (providerExists.rows.length === 0) {
        throw new Error(`Provider with ID ${provider_id} not found`);
      }
      
      // Check if patient exists
      const patientExists = await db.query(
        'SELECT patient_id FROM medical_patients WHERE patient_id = $1',
        [patient_id]
      );
      
      if (patientExists.rows.length === 0) {
        throw new Error(`Patient with ID ${patient_id} not found`);
      }
      
      // Create superbill
      const result = await db.query(
        `INSERT INTO medical_superbills 
        (appointment_id, provider_id, patient_id, date_of_service, diagnosis_codes, total_amount, status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [appointment_id, provider_id, patient_id, date_of_service, diagnosis_codes, total_amount, status, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating superbill:', error);
      throw error;
    }
  },
  
  /**
   * Get a superbill by ID
   * @param {number} superbillId - Superbill ID
   * @returns {Promise<Object>} - Superbill data
   */
  async getSuperbillById(superbillId) {
    try {
      const result = await db.query(
        `SELECT s.*, 
          p.first_name as provider_first_name, 
          p.last_name as provider_last_name,
          pt.first_name as patient_first_name, 
          pt.last_name as patient_last_name
        FROM medical_superbills s
        JOIN medical_providers p ON s.provider_id = p.provider_id
        JOIN medical_patients pt ON s.patient_id = pt.patient_id
        WHERE s.superbill_id = $1`,
        [superbillId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Superbill with ID ${superbillId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting superbill by ID:', error);
      throw error;
    }
  },
  
  /**
   * Get superbills with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {number} filters.patient_id - Filter by patient ID
   * @param {number} filters.provider_id - Filter by provider ID
   * @param {Date} filters.date_from - Filter by date of service (from)
   * @param {Date} filters.date_to - Filter by date of service (to)
   * @param {string} filters.status - Filter by status
   * @returns {Promise<Array>} - Superbills
   */
  async getSuperbills(filters = {}) {
    try {
      const {
        patient_id,
        provider_id,
        date_from,
        date_to,
        status
      } = filters;
      
      // Build query
      let query = `
        SELECT s.*, 
          p.first_name as provider_first_name, 
          p.last_name as provider_last_name,
          pt.first_name as patient_first_name, 
          pt.last_name as patient_last_name
        FROM medical_superbills s
        JOIN medical_providers p ON s.provider_id = p.provider_id
        JOIN medical_patients pt ON s.patient_id = pt.patient_id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Add filters
      if (patient_id) {
        queryParams.push(patient_id);
        query += ` AND s.patient_id = $${queryParams.length}`;
      }
      
      if (provider_id) {
        queryParams.push(provider_id);
        query += ` AND s.provider_id = $${queryParams.length}`;
      }
      
      if (date_from) {
        queryParams.push(date_from);
        query += ` AND s.date_of_service >= $${queryParams.length}`;
      }
      
      if (date_to) {
        queryParams.push(date_to);
        query += ` AND s.date_of_service <= $${queryParams.length}`;
      }
      
      if (status) {
        queryParams.push(status);
        query += ` AND s.status = $${queryParams.length}`;
      }
      
      // Add sorting
      query += ' ORDER BY s.date_of_service DESC';
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting superbills:', error);
      throw error;
    }
  },
  
  /**
   * Update a superbill
   * @param {number} superbillId - Superbill ID
   * @param {Object} superbillData - Superbill data to update
   * @returns {Promise<Object>} - Updated superbill
   */
  async updateSuperbill(superbillId, superbillData) {
    try {
      const {
        diagnosis_codes,
        total_amount,
        status,
        notes
      } = superbillData;
      
      // Check if superbill exists
      const superbillExists = await db.query(
        'SELECT superbill_id FROM medical_superbills WHERE superbill_id = $1',
        [superbillId]
      );
      
      if (superbillExists.rows.length === 0) {
        throw new Error(`Superbill with ID ${superbillId} not found`);
      }
      
      // Update superbill
      const result = await db.query(
        `UPDATE medical_superbills 
        SET diagnosis_codes = COALESCE($1, diagnosis_codes),
            total_amount = COALESCE($2, total_amount),
            status = COALESCE($3, status),
            notes = COALESCE($4, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE superbill_id = $5
        RETURNING *`,
        [diagnosis_codes, total_amount, status, notes, superbillId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating superbill:', error);
      throw error;
    }
  },
  
  /**
   * Add a superbill line item
   * @param {Object} itemData - Superbill line item data
   * @param {number} itemData.superbill_id - Superbill ID
   * @param {number} itemData.service_id - Service ID
   * @param {string} itemData.procedure_code - Procedure code
   * @param {string} itemData.description - Description
   * @param {number} itemData.units - Units
   * @param {number} itemData.charge_amount - Charge amount
   * @returns {Promise<Object>} - Created superbill line item
   */
  async addSuperbillItem(itemData) {
    try {
      const {
        superbill_id,
        service_id,
        procedure_code,
        description,
        units,
        charge_amount
      } = itemData;
      
      // Check if superbill exists
      const superbillExists = await db.query(
        'SELECT superbill_id FROM medical_superbills WHERE superbill_id = $1',
        [superbill_id]
      );
      
      if (superbillExists.rows.length === 0) {
        throw new Error(`Superbill with ID ${superbill_id} not found`);
      }
      
      // Check if service exists
      const serviceExists = await db.query(
        'SELECT service_id FROM medical_services WHERE service_id = $1',
        [service_id]
      );
      
      if (serviceExists.rows.length === 0) {
        throw new Error(`Service with ID ${service_id} not found`);
      }
      
      // Add superbill item
      const result = await db.query(
        `INSERT INTO medical_superbill_items 
        (superbill_id, service_id, procedure_code, description, units, charge_amount) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [superbill_id, service_id, procedure_code, description, units, charge_amount]
      );
      
      // Update superbill total amount
      await this.updateSuperbillTotal(superbill_id);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding superbill item:', error);
      throw error;
    }
  },
  
  /**
   * Get superbill line items
   * @param {number} superbillId - Superbill ID
   * @returns {Promise<Array>} - Superbill line items
   */
  async getSuperbillItems(superbillId) {
    try {
      const result = await db.query(
        `SELECT i.*, s.name as service_name
        FROM medical_superbill_items i
        JOIN medical_services s ON i.service_id = s.service_id
        WHERE i.superbill_id = $1
        ORDER BY i.superbill_item_id`,
        [superbillId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting superbill items:', error);
      throw error;
    }
  },
  
  /**
   * Update superbill total amount based on line items
   * @param {number} superbillId - Superbill ID
   * @returns {Promise<Object>} - Updated superbill
   */
  async updateSuperbillTotal(superbillId) {
    try {
      // Calculate total from line items
      const totalResult = await db.query(
        'SELECT SUM(charge_amount * units) as total FROM medical_superbill_items WHERE superbill_id = $1',
        [superbillId]
      );
      
      const total = totalResult.rows[0].total || 0;
      
      // Update superbill total
      const result = await db.query(
        'UPDATE medical_superbills SET total_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE superbill_id = $2 RETURNING *',
        [total, superbillId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating superbill total:', error);
      throw error;
    }
  }
};

module.exports = billingModel;
