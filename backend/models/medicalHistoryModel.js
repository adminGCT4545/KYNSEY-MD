/**
 * Medical History Model
 * Handles interaction with medical history related tables
 */

const pool = require('../utils/db');

class MedicalHistoryModel {
  /**
   * Create a new medical history record
   * @param {Object} historyData - Medical history data
   * @returns {Promise<Object>} Created medical history record
   */
  async createMedicalHistory(historyData) {
    const {
      chart_id,
      condition,
      diagnosis_date,
      resolution_date,
      status,
      notes
    } = historyData;

    const query = `
      INSERT INTO medical_history (
        chart_id,
        condition,
        diagnosis_date,
        resolution_date,
        status,
        notes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        condition,
        diagnosis_date,
        resolution_date,
        status,
        notes
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating medical history:', error);
      throw new Error('Failed to create medical history record');
    }
  }

  /**
   * Get a medical history record by ID
   * @param {number} historyId - Medical history record ID
   * @returns {Promise<Object>} Medical history record
   */
  async getMedicalHistoryById(historyId) {
    const query = 'SELECT * FROM medical_history WHERE history_id = $1';
    
    try {
      const { rows } = await pool.query(query, [historyId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting medical history:', error);
      throw new Error('Failed to get medical history record');
    }
  }

  /**
   * Get all medical history records for a patient chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of medical history records
   */
  async getMedicalHistoryByChart(chartId) {
    const query = `
      SELECT * FROM medical_history 
      WHERE chart_id = $1 
      ORDER BY 
        CASE WHEN status = 'Active' THEN 1
             WHEN status = 'Chronic' THEN 2
             WHEN status = 'Resolved' THEN 3
             ELSE 4 
        END,
        diagnosis_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting medical history:', error);
      throw new Error('Failed to get medical history records');
    }
  }

  /**
   * Update a medical history record
   * @param {number} historyId - Medical history record ID
   * @param {Object} historyData - Updated medical history data
   * @returns {Promise<Object>} Updated medical history record
   */
  async updateMedicalHistory(historyId, historyData) {
    const {
      condition,
      diagnosis_date,
      resolution_date,
      status,
      notes
    } = historyData;

    const query = `
      UPDATE medical_history 
      SET 
        condition = $1, 
        diagnosis_date = $2, 
        resolution_date = $3, 
        status = $4, 
        notes = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE history_id = $6 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        condition,
        diagnosis_date,
        resolution_date,
        status,
        notes,
        historyId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error updating medical history:', error);
      throw new Error('Failed to update medical history record');
    }
  }

  /**
   * Delete a medical history record
   * @param {number} historyId - Medical history record ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMedicalHistory(historyId) {
    const query = 'DELETE FROM medical_history WHERE history_id = $1 RETURNING *';
    
    try {
      const { rowCount } = await pool.query(query, [historyId]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting medical history:', error);
      throw new Error('Failed to delete medical history record');
    }
  }

  /**
   * Get medical history by patient ID
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of medical history records
   */
  async getMedicalHistoryByPatient(patientId) {
    const query = `
      SELECT mh.* 
      FROM medical_history mh
      JOIN medical_charts mc ON mh.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      ORDER BY 
        CASE WHEN mh.status = 'Active' THEN 1
             WHEN mh.status = 'Chronic' THEN 2
             WHEN mh.status = 'Resolved' THEN 3
             ELSE 4 
        END,
        mh.diagnosis_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient medical history:', error);
      throw new Error('Failed to get patient medical history');
    }
  }

  /**
   * Get medical history records by status
   * @param {number} chartId - Chart ID
   * @param {string} status - Status ('Active', 'Resolved', 'Chronic')
   * @returns {Promise<Array>} Array of medical history records
   */
  async getMedicalHistoryByStatus(chartId, status) {
    const query = `
      SELECT * FROM medical_history 
      WHERE chart_id = $1 AND status = $2
      ORDER BY diagnosis_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId, status]);
      return rows;
    } catch (error) {
      console.error('Error getting medical history by status:', error);
      throw new Error('Failed to get medical history by status');
    }
  }

  /**
   * Search medical history records by condition
   * @param {number} patientId - Patient ID
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching medical history records
   */
  async searchMedicalHistory(patientId, searchTerm) {
    const query = `
      SELECT mh.* 
      FROM medical_history mh
      JOIN medical_charts mc ON mh.chart_id = mc.chart_id
      WHERE mc.patient_id = $1 
        AND (
          mh.condition ILIKE $2 
          OR mh.notes ILIKE $2
        )
      ORDER BY mh.diagnosis_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error('Error searching medical history:', error);
      throw new Error('Failed to search medical history');
    }
  }

  /**
   * Create a new allergy record
   * @param {Object} allergyData - Allergy data
   * @returns {Promise<Object>} Created allergy record
   */
  async createAllergy(allergyData) {
    const {
      chart_id,
      allergen,
      reaction,
      severity,
      onset_date,
      notes
    } = allergyData;

    const query = `
      INSERT INTO medical_allergies (
        chart_id,
        allergen,
        reaction,
        severity,
        onset_date,
        notes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        allergen,
        reaction,
        severity,
        onset_date,
        notes
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating allergy:', error);
      throw new Error('Failed to create allergy record');
    }
  }

  /**
   * Get all allergies for a patient chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of allergy records
   */
  async getAllergiesByChart(chartId) {
    const query = `
      SELECT * FROM medical_allergies 
      WHERE chart_id = $1 
      ORDER BY allergen
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting allergies:', error);
      throw new Error('Failed to get allergies');
    }
  }

  /**
   * Get allergies by patient ID
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of allergy records
   */
  async getAllergiesByPatient(patientId) {
    const query = `
      SELECT ma.* 
      FROM medical_allergies ma
      JOIN medical_charts mc ON ma.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      ORDER BY ma.allergen
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient allergies:', error);
      throw new Error('Failed to get patient allergies');
    }
  }

  /**
   * Update an allergy record
   * @param {number} allergyId - Allergy ID
   * @param {Object} allergyData - Updated allergy data
   * @returns {Promise<Object>} Updated allergy record
   */
  async updateAllergy(allergyId, allergyData) {
    const {
      allergen,
      reaction,
      severity,
      onset_date,
      notes
    } = allergyData;

    const query = `
      UPDATE medical_allergies 
      SET 
        allergen = $1, 
        reaction = $2, 
        severity = $3, 
        onset_date = $4, 
        notes = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE allergy_id = $6 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        allergen,
        reaction,
        severity,
        onset_date,
        notes,
        allergyId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error updating allergy:', error);
      throw new Error('Failed to update allergy record');
    }
  }

  /**
   * Delete an allergy record
   * @param {number} allergyId - Allergy ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteAllergy(allergyId) {
    const query = 'DELETE FROM medical_allergies WHERE allergy_id = $1 RETURNING *';
    
    try {
      const { rowCount } = await pool.query(query, [allergyId]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting allergy:', error);
      throw new Error('Failed to delete allergy record');
    }
  }

  /**
   * Create a family history record
   * @param {Object} familyData - Family history data
   * @returns {Promise<Object>} Created family history record
   */
  async createFamilyHistory(familyData) {
    const {
      chart_id,
      relationship,
      condition,
      age_at_diagnosis,
      notes
    } = familyData;

    const query = `
      INSERT INTO medical_family_history (
        chart_id,
        relationship,
        condition,
        age_at_diagnosis,
        notes
      ) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        relationship,
        condition,
        age_at_diagnosis,
        notes
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating family history:', error);
      throw new Error('Failed to create family history record');
    }
  }

  /**
   * Get family history records by chart ID
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of family history records
   */
  async getFamilyHistoryByChart(chartId) {
    const query = `
      SELECT * FROM medical_family_history 
      WHERE chart_id = $1 
      ORDER BY relationship, condition
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting family history:', error);
      throw new Error('Failed to get family history records');
    }
  }

  /**
   * Get family history by patient ID
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of family history records
   */
  async getFamilyHistoryByPatient(patientId) {
    const query = `
      SELECT mfh.* 
      FROM medical_family_history mfh
      JOIN medical_charts mc ON mfh.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      ORDER BY mfh.relationship, mfh.condition
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient family history:', error);
      throw new Error('Failed to get patient family history');
    }
  }

  /**
   * Create a social history record
   * @param {Object} socialData - Social history data
   * @returns {Promise<Object>} Created social history record
   */
  async createSocialHistory(socialData) {
    const {
      chart_id,
      category,
      status,
      details,
      start_date,
      end_date
    } = socialData;

    const query = `
      INSERT INTO medical_social_history (
        chart_id,
        category,
        status,
        details,
        start_date,
        end_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        category,
        status,
        details,
        start_date,
        end_date
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating social history:', error);
      throw new Error('Failed to create social history record');
    }
  }

  /**
   * Get social history records by chart ID
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of social history records
   */
  async getSocialHistoryByChart(chartId) {
    const query = `
      SELECT * FROM medical_social_history 
      WHERE chart_id = $1 
      ORDER BY category
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting social history:', error);
      throw new Error('Failed to get social history records');
    }
  }
}

module.exports = new MedicalHistoryModel();