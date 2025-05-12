/**
 * KYNSEY MD - Chart Model
 * Handles operations related to patient charts and medical records
 */

const db = require('../../utils/db');

/**
 * Chart Model
 * Provides methods for managing patient charts and medical records
 */
const chartModel = {
  /**
   * Create a new patient chart
   * @param {Object} chartData - Chart data
   * @param {number} chartData.patient_id - Patient ID
   * @returns {Promise<Object>} - Created chart
   */
  async createChart(chartData) {
    try {
      const { patient_id } = chartData;
      
      // Check if patient exists
      const patientExists = await db.query(
        'SELECT patient_id FROM medical_patients WHERE patient_id = $1',
        [patient_id]
      );
      
      if (patientExists.rows.length === 0) {
        throw new Error(`Patient with ID ${patient_id} not found`);
      }
      
      // Check if chart already exists for this patient
      const existingChart = await db.query(
        'SELECT chart_id FROM medical_charts WHERE patient_id = $1 AND active = true',
        [patient_id]
      );
      
      if (existingChart.rows.length > 0) {
        return { chart_id: existingChart.rows[0].chart_id, patient_id, message: 'Chart already exists for this patient' };
      }
      
      // Create new chart
      const result = await db.query(
        'INSERT INTO medical_charts (patient_id) VALUES ($1) RETURNING *',
        [patient_id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating chart:', error);
      throw error;
    }
  },
  
  /**
   * Get a chart by ID
   * @param {number} chartId - Chart ID
   * @returns {Promise<Object>} - Chart data
   */
  async getChartById(chartId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_charts WHERE chart_id = $1',
        [chartId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Chart with ID ${chartId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting chart by ID:', error);
      throw error;
    }
  },
  
  /**
   * Get a patient's chart
   * @param {number} patientId - Patient ID
   * @returns {Promise<Object>} - Chart data
   */
  async getChartByPatientId(patientId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_charts WHERE patient_id = $1 AND active = true',
        [patientId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Active chart for patient with ID ${patientId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting chart by patient ID:', error);
      throw error;
    }
  },
  
  /**
   * Update a chart
   * @param {number} chartId - Chart ID
   * @param {Object} chartData - Chart data to update
   * @returns {Promise<Object>} - Updated chart
   */
  async updateChart(chartId, chartData) {
    try {
      const { active } = chartData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chartId]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chartId} not found`);
      }
      
      // Update chart
      const result = await db.query(
        'UPDATE medical_charts SET active = $1, updated_at = CURRENT_TIMESTAMP WHERE chart_id = $2 RETURNING *',
        [active, chartId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
  },
  
  /**
   * Add a note to a chart
   * @param {Object} noteData - Note data
   * @param {number} noteData.chart_id - Chart ID
   * @param {number} noteData.provider_id - Provider ID
   * @param {string} noteData.note_type - Note type (e.g., 'SOAP', 'Progress', 'Initial')
   * @param {string} noteData.subjective - Subjective section
   * @param {string} noteData.objective - Objective section
   * @param {string} noteData.assessment - Assessment section
   * @param {string} noteData.plan - Plan section
   * @param {string} noteData.signature - Provider signature
   * @returns {Promise<Object>} - Created note
   */
  async addChartNote(noteData) {
    try {
      const {
        chart_id,
        provider_id,
        note_type,
        subjective,
        objective,
        assessment,
        plan,
        signature
      } = noteData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Check if provider exists
      const providerExists = await db.query(
        'SELECT provider_id FROM medical_providers WHERE provider_id = $1',
        [provider_id]
      );
      
      if (providerExists.rows.length === 0) {
        throw new Error(`Provider with ID ${provider_id} not found`);
      }
      
      // Add note
      const result = await db.query(
        `INSERT INTO medical_chart_notes 
        (chart_id, provider_id, note_type, subjective, objective, assessment, plan, signature, signed_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
        RETURNING *`,
        [chart_id, provider_id, note_type, subjective, objective, assessment, plan, signature]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding chart note:', error);
      throw error;
    }
  },
  
  /**
   * Get notes for a chart
   * @param {number} chartId - Chart ID
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Field to sort by (default: 'note_date')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {number} options.limit - Maximum number of notes to return
   * @param {number} options.offset - Number of notes to skip
   * @returns {Promise<Array>} - Chart notes
   */
  async getChartNotes(chartId, options = {}) {
    try {
      const {
        sortBy = 'note_date',
        sortOrder = 'desc',
        limit,
        offset
      } = options;
      
      // Validate sort parameters
      const validSortFields = ['note_date', 'note_type', 'provider_id', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        throw new Error(`Invalid sort field: ${sortBy}`);
      }
      
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        throw new Error(`Invalid sort order: ${sortOrder}`);
      }
      
      // Build query
      let query = `
        SELECT n.*, p.first_name as provider_first_name, p.last_name as provider_last_name
        FROM medical_chart_notes n
        JOIN medical_providers p ON n.provider_id = p.provider_id
        WHERE n.chart_id = $1
        ORDER BY n.${sortBy} ${sortOrder}
      `;
      
      const queryParams = [chartId];
      
      // Add limit and offset if provided
      if (limit) {
        query += ' LIMIT $2';
        queryParams.push(limit);
      }
      
      if (offset) {
        query += ' OFFSET $' + (queryParams.length + 1);
        queryParams.push(offset);
      }
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting chart notes:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific note by ID
   * @param {number} noteId - Note ID
   * @returns {Promise<Object>} - Note data
   */
  async getNoteById(noteId) {
    try {
      const result = await db.query(
        `SELECT n.*, p.first_name as provider_first_name, p.last_name as provider_last_name
        FROM medical_chart_notes n
        JOIN medical_providers p ON n.provider_id = p.provider_id
        WHERE n.note_id = $1`,
        [noteId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Note with ID ${noteId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting note by ID:', error);
      throw error;
    }
  },
  
  /**
   * Update a chart note
   * @param {number} noteId - Note ID
   * @param {Object} noteData - Note data to update
   * @returns {Promise<Object>} - Updated note
   */
  async updateChartNote(noteId, noteData) {
    try {
      const {
        subjective,
        objective,
        assessment,
        plan,
        signature
      } = noteData;
      
      // Check if note exists
      const noteExists = await db.query(
        'SELECT note_id FROM medical_chart_notes WHERE note_id = $1',
        [noteId]
      );
      
      if (noteExists.rows.length === 0) {
        throw new Error(`Note with ID ${noteId} not found`);
      }
      
      // Update note
      const result = await db.query(
        `UPDATE medical_chart_notes 
        SET subjective = COALESCE($1, subjective),
            objective = COALESCE($2, objective),
            assessment = COALESCE($3, assessment),
            plan = COALESCE($4, plan),
            signature = COALESCE($5, signature),
            signed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE note_id = $6
        RETURNING *`,
        [subjective, objective, assessment, plan, signature, noteId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating chart note:', error);
      throw error;
    }
  },
  
  /**
   * Add vital signs to a chart
   * @param {Object} vitalData - Vital signs data
   * @param {number} vitalData.chart_id - Chart ID
   * @param {number} vitalData.temperature - Temperature
   * @param {number} vitalData.heart_rate - Heart rate
   * @param {number} vitalData.respiratory_rate - Respiratory rate
   * @param {number} vitalData.blood_pressure_systolic - Systolic blood pressure
   * @param {number} vitalData.blood_pressure_diastolic - Diastolic blood pressure
   * @param {number} vitalData.oxygen_saturation - Oxygen saturation
   * @param {number} vitalData.height - Height
   * @param {number} vitalData.weight - Weight
   * @param {string} vitalData.notes - Notes
   * @returns {Promise<Object>} - Created vital signs record
   */
  async addVitalSigns(vitalData) {
    try {
      const {
        chart_id,
        temperature,
        heart_rate,
        respiratory_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        oxygen_saturation,
        height,
        weight,
        notes
      } = vitalData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Calculate BMI if height and weight are provided
      let bmi = null;
      if (height && weight) {
        // BMI = weight(kg) / height(m)²
        // Assuming height is in cm and weight is in kg
        const heightInMeters = height / 100;
        bmi = weight / (heightInMeters * heightInMeters);
        bmi = parseFloat(bmi.toFixed(2)); // Round to 2 decimal places
      }
      
      // Add vital signs
      const result = await db.query(
        `INSERT INTO medical_vital_signs 
        (chart_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, 
         blood_pressure_diastolic, oxygen_saturation, height, weight, bmi, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          chart_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic,
          blood_pressure_diastolic, oxygen_saturation, height, weight, bmi, notes
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding vital signs:', error);
      throw error;
    }
  },
  
  /**
   * Get vital signs for a chart
   * @param {number} chartId - Chart ID
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Field to sort by (default: 'recorded_at')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Number of records to skip
   * @returns {Promise<Array>} - Vital signs records
   */
  async getVitalSigns(chartId, options = {}) {
    try {
      const {
        sortBy = 'recorded_at',
        sortOrder = 'desc',
        limit,
        offset
      } = options;
      
      // Validate sort parameters
      const validSortFields = ['recorded_at', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        throw new Error(`Invalid sort field: ${sortBy}`);
      }
      
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        throw new Error(`Invalid sort order: ${sortOrder}`);
      }
      
      // Build query
      let query = `
        SELECT * FROM medical_vital_signs
        WHERE chart_id = $1
        ORDER BY ${sortBy} ${sortOrder}
      `;
      
      const queryParams = [chartId];
      
      // Add limit and offset if provided
      if (limit) {
        query += ' LIMIT $2';
        queryParams.push(limit);
      }
      
      if (offset) {
        query += ' OFFSET $' + (queryParams.length + 1);
        queryParams.push(offset);
      }
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting vital signs:', error);
      throw error;
    }
  },
  
  /**
   * Add an allergy to a chart
   * @param {Object} allergyData - Allergy data
   * @param {number} allergyData.chart_id - Chart ID
   * @param {string} allergyData.allergen - Allergen name
   * @param {string} allergyData.reaction - Reaction description
   * @param {string} allergyData.severity - Severity level
   * @param {Date} allergyData.onset_date - Onset date
   * @param {string} allergyData.notes - Notes
   * @returns {Promise<Object>} - Created allergy record
   */
  async addAllergy(allergyData) {
    try {
      const {
        chart_id,
        allergen,
        reaction,
        severity,
        onset_date,
        notes
      } = allergyData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Add allergy
      const result = await db.query(
        `INSERT INTO medical_allergies 
        (chart_id, allergen, reaction, severity, onset_date, notes) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [chart_id, allergen, reaction, severity, onset_date, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding allergy:', error);
      throw error;
    }
  },
  
  /**
   * Get allergies for a chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} - Allergy records
   */
  async getAllergies(chartId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_allergies WHERE chart_id = $1 ORDER BY allergen',
        [chartId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting allergies:', error);
      throw error;
    }
  },
  
  /**
   * Add a medical history item to a chart
   * @param {Object} historyData - Medical history data
   * @param {number} historyData.chart_id - Chart ID
   * @param {string} historyData.condition - Condition name
   * @param {Date} historyData.diagnosis_date - Diagnosis date
   * @param {Date} historyData.resolution_date - Resolution date
   * @param {string} historyData.status - Status
   * @param {string} historyData.notes - Notes
   * @returns {Promise<Object>} - Created medical history record
   */
  async addMedicalHistory(historyData) {
    try {
      const {
        chart_id,
        condition,
        diagnosis_date,
        resolution_date,
        status,
        notes
      } = historyData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Add medical history
      const result = await db.query(
        `INSERT INTO medical_history 
        (chart_id, condition, diagnosis_date, resolution_date, status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [chart_id, condition, diagnosis_date, resolution_date, status, notes]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding medical history:', error);
      throw error;
    }
  },
  
  /**
   * Get medical history for a chart
   * @param {number} chartId - Chart ID
   * @param {string} status - Filter by status (optional)
   * @returns {Promise<Array>} - Medical history records
   */
  async getMedicalHistory(chartId, status = null) {
    try {
      let query = 'SELECT * FROM medical_history WHERE chart_id = $1';
      const queryParams = [chartId];
      
      if (status) {
        query += ' AND status = $2';
        queryParams.push(status);
      }
      
      query += ' ORDER BY diagnosis_date DESC';
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting medical history:', error);
      throw error;
    }
  },
  
  /**
   * Add a lab result to a chart
   * @param {Object} labData - Lab result data
   * @param {number} labData.chart_id - Chart ID
   * @param {string} labData.test_name - Test name
   * @param {Date} labData.test_date - Test date
   * @param {string} labData.result - Test result
   * @param {string} labData.reference_range - Reference range
   * @param {string} labData.units - Units
   * @param {boolean} labData.abnormal - Whether result is abnormal
   * @param {string} labData.notes - Notes
   * @returns {Promise<Object>} - Created lab result record
   */
  async addLabResult(labData) {
    try {
      const {
        chart_id,
        test_name,
        test_date,
        result,
        reference_range,
        units,
        abnormal,
        notes
      } = labData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Add lab result
      const queryResult = await db.query(
        `INSERT INTO medical_lab_results 
        (chart_id, test_name, test_date, result, reference_range, units, abnormal, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [chart_id, test_name, test_date, result, reference_range, units, abnormal, notes]
      );
      
      return queryResult.rows[0];
    } catch (error) {
      console.error('Error adding lab result:', error);
      throw error;
    }
  },
  
  /**
   * Get lab results for a chart
   * @param {number} chartId - Chart ID
   * @param {Object} options - Query options
   * @param {string} options.sortBy - Field to sort by (default: 'test_date')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {boolean} options.abnormalOnly - Filter to abnormal results only
   * @returns {Promise<Array>} - Lab result records
   */
  async getLabResults(chartId, options = {}) {
    try {
      const {
        sortBy = 'test_date',
        sortOrder = 'desc',
        abnormalOnly = false
      } = options;
      
      // Validate sort parameters
      const validSortFields = ['test_date', 'test_name', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        throw new Error(`Invalid sort field: ${sortBy}`);
      }
      
      if (!validSortOrders.includes(sortOrder.toLowerCase())) {
        throw new Error(`Invalid sort order: ${sortOrder}`);
      }
      
      // Build query
      let query = 'SELECT * FROM medical_lab_results WHERE chart_id = $1';
      const queryParams = [chartId];
      
      if (abnormalOnly) {
        query += ' AND abnormal = true';
      }
      
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting lab results:', error);
      throw error;
    }
  },
  
  /**
   * Add a document to a chart
   * @param {Object} documentData - Document data
   * @param {number} documentData.chart_id - Chart ID
   * @param {string} documentData.document_type - Document type
   * @param {string} documentData.title - Document title
   * @param {string} documentData.file_path - File path
   * @param {string} documentData.description - Document description
   * @returns {Promise<Object>} - Created document record
   */
  async addDocument(documentData) {
    try {
      const {
        chart_id,
        document_type,
        title,
        file_path,
        description
      } = documentData;
      
      // Check if chart exists
      const chartExists = await db.query(
        'SELECT chart_id FROM medical_charts WHERE chart_id = $1',
        [chart_id]
      );
      
      if (chartExists.rows.length === 0) {
        throw new Error(`Chart with ID ${chart_id} not found`);
      }
      
      // Add document
      const result = await db.query(
        `INSERT INTO medical_documents 
        (chart_id, document_type, title, file_path, description) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
        [chart_id, document_type, title, file_path, description]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },
  
  /**
   * Get documents for a chart
   * @param {number} chartId - Chart ID
   * @param {string} documentType - Filter by document type (optional)
   * @returns {Promise<Array>} - Document records
   */
  async getDocuments(chartId, documentType = null) {
    try {
      let query = 'SELECT * FROM medical_documents WHERE chart_id = $1';
      const queryParams = [chartId];
      
      if (documentType) {
        query += ' AND document_type = $2';
        queryParams.push(documentType);
      }
      
      query += ' ORDER BY upload_date DESC';
      
      const result = await db.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },
  
  /**
   * Get a document by ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} - Document data
   */
  async getDocumentById(documentId) {
    try {
      const result = await db.query(
        'SELECT * FROM medical_documents WHERE document_id = $1',
        [documentId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Document with ID ${documentId} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting document by ID:', error);
      throw error;
    }
  },

  /**
   * Get patient chart entries
   * @param {number} patientId - Patient ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - Patient chart entries
   */
  async getPatientCharts(patientId, filters = {}) {
    try {
      // Build query to fetch chart entries directly from our new table
      const query = `
        SELECT 
          entry_id as id,
          patient_id,
          appointment_id,
          entry_type,
          created_at as date,
          subjective,
          objective,
          assessment,
          plan,
          additional_notes,
          created_by as provider_id,
          is_signed,
          signed_at,
          updated_at
        FROM 
          medical_chart_entries
        WHERE 
          patient_id = $1
        ORDER BY 
          created_at DESC
      `;
      
      const result = await db.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      console.error(`Error fetching chart entries for patient ${patientId}:`, error);
      throw error;
    }
  }
};

module.exports = chartModel;
