/**
 * KYNSEY MD - Medication Model
 * Handles operations related to medications and prescriptions
 */

const db = require('../../utils/db');

/**
 * Medication Model
 * Provides methods for managing medications and prescriptions
 */
const medicationModel = {
  /**
   * Create a new medication
   * @param {Object} medicationData - Medication data
   * @param {string} medicationData.name - Medication name
   * @param {string} medicationData.generic_name - Generic name (optional)
   * @param {string} medicationData.drug_class - Drug class (optional)
   * @param {string} medicationData.description - Description (optional)
   * @returns {Promise<Object>} - Created medication
   */
  async createMedication(medicationData) {
    try {
      const {
        name,
        generic_name,
        drug_class,
        description
      } = medicationData;
      
      // Check if medication with this name already exists
      const existingMedication = await db.query(
        'SELECT medication_id FROM medical_medications WHERE name = $1',
        [name]
      );
      
      if (existingMedication.rows.length > 0) {
        return { 
          medication_id: existingMedication.rows[0].medication_id, 
          message: 'Medication already exists', 
          name 
        };
      }
      
      // Create new medication
      const result = await db.query(
        `INSERT INTO medical_medications 
        (name, generic_name, drug_class, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`,
        [name, generic_name, drug_class, description]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  },
  
  /**
   * Get all medications
   * @param {Object} options - Query options
   * @param {string} options.searchTerm - Search term for medication name (optional)
   * @param {string} options.drugClass - Filter by drug class (optional)
   * @param {string} options.sortBy - Field to sort by (default: 'name')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'asc')
   * @param {number} options.limit - Maximum number of medications to return
   * @param {number} options.offset - Number of medications to skip
   * @returns {Promise<Array>} - Medications
   */
  async getMedications(options = {}) {
    try {
      const {
        searchTerm,
        drugClass,
        sortBy = 'name',
        sortOrder = 'asc',
        limit,
        offset
      } = options;
      
      // Validate sort parameters
      const validSortFields = ['name', 'generic_name', 'drug_class', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        throw new Error(`Invalid sort field: ${sortBy}`);
      }
      
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        throw new Error(`Invalid sort order: ${sortOrder}`);
      }
      
      // Build query
      let query = 'SELECT * FROM medical_medications';
      const whereConditions = [];
      const queryParams = [];
      
      if (searchTerm) {
        whereConditions.push('(name ILIKE $' + (queryParams.length + 1) + ' OR generic_name ILIKE $' + (queryParams.length + 1) + ')');
        queryParams.push(`%${searchTerm}%`);
      }
      
      if (drugClass) {
        whereConditions.push('drug_class = $' + (queryParams.length + 1));
        queryParams.push(drugClass);
      }
      
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Add limit and offset if provided
      if (limit) {
        query += ' LIMIT $' + (queryParams.length + 1);
        queryParams.push(limit);
      }
      
      if (offset) {
        query += ' OFFSET $' + (queryParams.length + 1);
        queryParams.push(offset);
      }
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting medications:', error);
      throw error;
    }
  },
  
  /**
   * Get a medication by ID
   * @param {number} medicationId - Medication ID
   * @returns {Promise<Object>} - Medication data
   */
  async getMedicationById(medicationId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_medications WHERE medication_id = $1',
        [medicationId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Medication with ID ${medicationId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting medication by ID:', error);
      throw error;
    }
  },
  
  /**
   * Update a medication
   * @param {number} medicationId - Medication ID
   * @param {Object} medicationData - Medication data to update
   * @param {string} medicationData.name - Medication name (optional)
   * @param {string} medicationData.generic_name - Generic name (optional)
   * @param {string} medicationData.drug_class - Drug class (optional)
   * @param {string} medicationData.description - Description (optional)
   * @returns {Promise<Object>} - Updated medication
   */
  async updateMedication(medicationId, medicationData) {
    try {
      const {
        name,
        generic_name,
        drug_class,
        description
      } = medicationData;
      
      // Check if medication exists
      const medicationExists = await db.query(
        'SELECT medication_id FROM medical_medications WHERE medication_id = $1',
        [medicationId]
      );
      
      if (medicationExists.rows.length === 0) {
        throw new Error(`Medication with ID ${medicationId} not found`);
      }
      
      // Update medication
      const result = await db.query(
        `UPDATE medical_medications 
        SET name = COALESCE($1, name),
            generic_name = COALESCE($2, generic_name),
            drug_class = COALESCE($3, drug_class),
            description = COALESCE($4, description),
            updated_at = CURRENT_TIMESTAMP
        WHERE medication_id = $5
        RETURNING *`,
        [name, generic_name, drug_class, description, medicationId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },
  
  /**
   * Prescribe a medication to a patient
   * @param {Object} prescriptionData - Prescription data
   * @param {number} prescriptionData.chart_id - Chart ID
   * @param {number} prescriptionData.medication_id - Medication ID
   * @param {string} prescriptionData.dosage - Dosage
   * @param {string} prescriptionData.frequency - Frequency
   * @param {string} prescriptionData.route - Route
   * @param {Date} prescriptionData.start_date - Start date
   * @param {Date} prescriptionData.end_date - End date (optional)
   * @param {number} prescriptionData.prescribing_provider_id - Prescribing provider ID
   * @param {boolean} prescriptionData.active - Whether prescription is active (default: true)
   * @param {string} prescriptionData.notes - Notes (optional)
   * @returns {Promise<Object>} - Created prescription
   */
  async prescribeMedication(prescriptionData) {
    try {
      const {
        chart_id,
        medication_id,
        dosage,
        frequency,
        route,
        start_date,
        end_date,
        prescribing_provider_id,
        active = true,
        notes
      } = prescriptionData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Check if medication exists
      const medicationExists = await db.query(
        'SELECT medication_id FROM medical_medications WHERE medication_id = $1',
        [medication_id]
      );
      
      if (medicationExists.rows.length === 0) {
        throw new Error(`Medication with ID ${medication_id} not found`);
      }
      
      // Check if provider exists
      const providerExists = await db.query(
        'SELECT provider_id FROM medical_providers WHERE provider_id = $1',
        [prescribing_provider_id]
      );
      
      if (providerExists.rows.length === 0) {
        throw new Error(`Provider with ID ${prescribing_provider_id} not found`);
      }
      
      // Add prescription
      const result = await db.query(
        `INSERT INTO medical_patient_medications 
        (chart_id, medication_id, dosage, frequency, route, start_date, end_date, 
         prescribing_provider_id, active, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`,
        [
          chart_id, medication_id, dosage, frequency, route, start_date, end_date,
          prescribing_provider_id, active, notes
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error prescribing medication:', error);
      throw error;
    }
  },
  
  /**
   * Get patient medications
   * @param {number} chartId - Chart ID
   * @param {boolean} activeOnly - Filter to active medications only (optional, default: false)
   * @returns {Promise<Array>} - Medications
   */
  async getPatientMedications(chartId, activeOnly = false) {
    try {
      let query = `
        SELECT pm.*, m.name, m.generic_name, m.drug_class, m.description,
               p.first_name as provider_first_name, p.last_name as provider_last_name
        FROM medical_patient_medications pm
        JOIN medical_medications m ON pm.medication_id = m.medication_id
        LEFT JOIN medical_providers p ON pm.prescribing_provider_id = p.provider_id
        WHERE pm.chart_id = $1
      `;
      
      const queryParams = [chartId];
      
      if (activeOnly) {
        query += ' AND pm.active = TRUE';
      }
      
      query += ' ORDER BY pm.start_date DESC';
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting patient medications:', error);
      throw error;
    }
  },
  
  /**
   * Update a patient medication prescription
   * @param {number} prescriptionId - Prescription ID
   * @param {Object} prescriptionData - Prescription data to update
   * @param {string} prescriptionData.dosage - Dosage (optional)
   * @param {string} prescriptionData.frequency - Frequency (optional)
   * @param {string} prescriptionData.route - Route (optional)
   * @param {Date} prescriptionData.end_date - End date (optional)
   * @param {boolean} prescriptionData.active - Whether prescription is active (optional)
   * @param {string} prescriptionData.notes - Notes (optional)
   * @returns {Promise<Object>} - Updated prescription
   */
  async updatePrescription(prescriptionId, prescriptionData) {
    try {
      const {
        dosage,
        frequency,
        route,
        end_date,
        active,
        notes
      } = prescriptionData;
      
      // Check if prescription exists
      const prescriptionExists = await db.query(
        'SELECT patient_medication_id FROM medical_patient_medications WHERE patient_medication_id = $1',
        [prescriptionId]
      );
      
      if (prescriptionExists.rows.length === 0) {
        throw new Error(`Prescription with ID ${prescriptionId} not found`);
      }
      
      // Update prescription
      const result = await db.query(
        `UPDATE medical_patient_medications 
        SET dosage = COALESCE($1, dosage),
            frequency = COALESCE($2, frequency),
            route = COALESCE($3, route),
            end_date = COALESCE($4, end_date),
            active = COALESCE($5, active),
            notes = COALESCE($6, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE patient_medication_id = $7
        RETURNING *`,
        [dosage, frequency, route, end_date, active, notes, prescriptionId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  },
  
  /**
   * Discontinue a patient medication
   * @param {number} prescriptionId - Prescription ID
   * @param {Date} endDate - End date (defaults to current date)
   * @param {string} discontinuationReason - Reason for discontinuation (optional)
   * @returns {Promise<Object>} - Updated prescription
   */
  async discontinueMedication(prescriptionId, endDate = new Date(), discontinuationReason) {
    try {
      // Check if prescription exists
      const prescriptionExists = await db.query(
        'SELECT patient_medication_id FROM medical_patient_medications WHERE patient_medication_id = $1',
        [prescriptionId]
      );
      
      if (prescriptionExists.rows.length === 0) {
        throw new Error(`Prescription with ID ${prescriptionId} not found`);
      }
      
      // Update prescription to discontinue it
      const result = await db.query(
        `UPDATE medical_patient_medications 
        SET active = FALSE,
            end_date = $1,
            notes = CASE 
                      WHEN notes IS NULL OR notes = '' THEN $2
                      ELSE notes || '. ' || $2
                    END,
            updated_at = CURRENT_TIMESTAMP
        WHERE patient_medication_id = $3
        RETURNING *`,
        [endDate, discontinuationReason ? `Discontinued: ${discontinuationReason}` : 'Discontinued', prescriptionId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error discontinuing medication:', error);
      throw error;
    }
  },
  
  /**
   * Get drug classes for filtering
   * @returns {Promise<Array>} - Drug classes
   */
  async getDrugClasses() {
    try {
      const result = await db.query(
        'SELECT DISTINCT drug_class FROM medical_medications WHERE drug_class IS NOT NULL ORDER BY drug_class',
        []
      );
      
      return result.rows.map(row => row.drug_class);
    } catch (error) {
      console.error('Error getting drug classes:', error);
      throw error;
    }
  },
  
  /**
   * Search medications
   * @param {string} term - Search term
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise<Array>} - Matching medications
   */
  async searchMedications(term, limit = 10) {
    try {
      const result = await db.query(
        `SELECT * FROM medical_medications
        WHERE name ILIKE $1 OR generic_name ILIKE $1
        ORDER BY name
        LIMIT $2`,
        [`%${term}%`, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error searching medications:', error);
      throw error;
    }
  }
};

module.exports = medicationModel;