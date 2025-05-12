/**
 * Lab Results Management Model
 * Handles interaction with the medical_lab_results table
 */

const pool = require('../utils/db');

class LabResultsModel {
  /**
   * Create a new lab result
   * @param {Object} labData - Lab result data
   * @returns {Promise<Object>} Created lab result
   */
  async createLabResult(labData) {
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

    const query = `
      INSERT INTO medical_lab_results (
        chart_id, 
        test_name, 
        test_date, 
        result, 
        reference_range, 
        units, 
        abnormal, 
        notes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        test_name,
        test_date,
        result,
        reference_range,
        units,
        abnormal,
        notes
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating lab result:', error);
      throw new Error('Failed to create lab result');
    }
  }

  /**
   * Get a lab result by ID
   * @param {number} labId - Lab result ID
   * @returns {Promise<Object>} Lab result
   */
  async getLabResultById(labId) {
    const query = 'SELECT * FROM medical_lab_results WHERE lab_id = $1';
    
    try {
      const { rows } = await pool.query(query, [labId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting lab result:', error);
      throw new Error('Failed to get lab result');
    }
  }

  /**
   * Get all lab results for a patient chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of lab results
   */
  async getLabResultsByChart(chartId) {
    const query = 'SELECT * FROM medical_lab_results WHERE chart_id = $1 ORDER BY test_date DESC';
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting lab results:', error);
      throw new Error('Failed to get lab results');
    }
  }

  /**
   * Update a lab result
   * @param {number} labId - Lab result ID
   * @param {Object} labData - Updated lab result data
   * @returns {Promise<Object>} Updated lab result
   */
  async updateLabResult(labId, labData) {
    const {
      test_name,
      test_date,
      result,
      reference_range,
      units,
      abnormal,
      notes
    } = labData;

    const query = `
      UPDATE medical_lab_results 
      SET 
        test_name = $1, 
        test_date = $2, 
        result = $3, 
        reference_range = $4, 
        units = $5, 
        abnormal = $6, 
        notes = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE lab_id = $8 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        test_name,
        test_date,
        result,
        reference_range,
        units,
        abnormal,
        notes,
        labId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error updating lab result:', error);
      throw new Error('Failed to update lab result');
    }
  }

  /**
   * Delete a lab result
   * @param {number} labId - Lab result ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteLabResult(labId) {
    const query = 'DELETE FROM medical_lab_results WHERE lab_id = $1 RETURNING *';
    
    try {
      const { rowCount } = await pool.query(query, [labId]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting lab result:', error);
      throw new Error('Failed to delete lab result');
    }
  }

  /**
   * Get lab results by patient ID
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of lab results
   */
  async getLabResultsByPatient(patientId) {
    const query = `
      SELECT lr.* 
      FROM medical_lab_results lr
      JOIN medical_charts mc ON lr.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      ORDER BY lr.test_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient lab results:', error);
      throw new Error('Failed to get patient lab results');
    }
  }

  /**
   * Get lab trends for a specific test type
   * @param {number} patientId - Patient ID
   * @param {string} testName - Test name
   * @returns {Promise<Array>} Array of lab results for trend analysis
   */
  async getLabTrends(patientId, testName) {
    const query = `
      SELECT lr.test_date, lr.result, lr.units, lr.reference_range, lr.abnormal
      FROM medical_lab_results lr
      JOIN medical_charts mc ON lr.chart_id = mc.chart_id
      WHERE mc.patient_id = $1 AND lr.test_name = $2
      ORDER BY lr.test_date ASC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId, testName]);
      return rows;
    } catch (error) {
      console.error('Error getting lab trends:', error);
      throw new Error('Failed to get lab trends');
    }
  }

  /**
   * Get all abnormal lab results for a patient
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of abnormal lab results
   */
  async getAbnormalResults(patientId) {
    const query = `
      SELECT lr.* 
      FROM medical_lab_results lr
      JOIN medical_charts mc ON lr.chart_id = mc.chart_id
      WHERE mc.patient_id = $1 AND lr.abnormal = true
      ORDER BY lr.test_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting abnormal lab results:', error);
      throw new Error('Failed to get abnormal lab results');
    }
  }
}

module.exports = new LabResultsModel();