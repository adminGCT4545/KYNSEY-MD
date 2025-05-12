/**
 * Vital Signs Model
 * Handles interaction with the medical_vital_signs table
 */

const pool = require('../utils/db');

class VitalSignsModel {
  /**
   * Create a new vital signs record
   * @param {Object} vitalData - Vital signs data
   * @returns {Promise<Object>} Created vital signs record
   */
  async createVitalSigns(vitalData) {
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
      bmi,
      notes
    } = vitalData;

    // Calculate BMI if height and weight provided but BMI not provided
    let calculatedBmi = bmi;
    if (!bmi && height && weight) {
      // BMI = weight(kg) / (height(m))^2
      calculatedBmi = (weight / ((height/100) * (height/100))).toFixed(2);
    }

    const query = `
      INSERT INTO medical_vital_signs (
        chart_id,
        temperature,
        heart_rate,
        respiratory_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        oxygen_saturation,
        height,
        weight,
        bmi,
        notes
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        temperature,
        heart_rate,
        respiratory_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        oxygen_saturation,
        height,
        weight,
        calculatedBmi,
        notes
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating vital signs:', error);
      throw new Error('Failed to create vital signs record');
    }
  }

  /**
   * Get a vital signs record by ID
   * @param {number} vitalId - Vital signs ID
   * @returns {Promise<Object>} Vital signs record
   */
  async getVitalSignsById(vitalId) {
    const query = 'SELECT * FROM medical_vital_signs WHERE vital_id = $1';
    
    try {
      const { rows } = await pool.query(query, [vitalId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting vital signs:', error);
      throw new Error('Failed to get vital signs record');
    }
  }

  /**
   * Get latest vital signs for a patient chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Object>} Latest vital signs record
   */
  async getLatestVitalSigns(chartId) {
    const query = `
      SELECT * FROM medical_vital_signs 
      WHERE chart_id = $1 
      ORDER BY recorded_at DESC 
      LIMIT 1
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting latest vital signs:', error);
      throw new Error('Failed to get latest vital signs');
    }
  }

  /**
   * Get vital signs history for a patient chart
   * @param {number} chartId - Chart ID
   * @param {number} limit - Maximum number of records to return (optional)
   * @returns {Promise<Array>} Array of vital signs records
   */
  async getVitalSignsHistory(chartId, limit = null) {
    let query = `
      SELECT * FROM medical_vital_signs 
      WHERE chart_id = $1 
      ORDER BY recorded_at DESC
    `;
    
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting vital signs history:', error);
      throw new Error('Failed to get vital signs history');
    }
  }

  /**
   * Update a vital signs record
   * @param {number} vitalId - Vital signs ID
   * @param {Object} vitalData - Updated vital signs data
   * @returns {Promise<Object>} Updated vital signs record
   */
  async updateVitalSigns(vitalId, vitalData) {
    const {
      temperature,
      heart_rate,
      respiratory_rate,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      oxygen_saturation,
      height,
      weight,
      bmi,
      notes
    } = vitalData;

    // Calculate BMI if height and weight provided but BMI not provided
    let calculatedBmi = bmi;
    if (!bmi && height && weight) {
      // BMI = weight(kg) / (height(m))^2
      calculatedBmi = (weight / ((height/100) * (height/100))).toFixed(2);
    }

    const query = `
      UPDATE medical_vital_signs 
      SET 
        temperature = $1, 
        heart_rate = $2, 
        respiratory_rate = $3, 
        blood_pressure_systolic = $4, 
        blood_pressure_diastolic = $5, 
        oxygen_saturation = $6, 
        height = $7, 
        weight = $8, 
        bmi = $9, 
        notes = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE vital_id = $11 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        temperature,
        heart_rate,
        respiratory_rate,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        oxygen_saturation,
        height,
        weight,
        calculatedBmi,
        notes,
        vitalId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error updating vital signs:', error);
      throw new Error('Failed to update vital signs record');
    }
  }

  /**
   * Delete a vital signs record
   * @param {number} vitalId - Vital signs ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteVitalSigns(vitalId) {
    const query = 'DELETE FROM medical_vital_signs WHERE vital_id = $1 RETURNING *';
    
    try {
      const { rowCount } = await pool.query(query, [vitalId]);
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting vital signs:', error);
      throw new Error('Failed to delete vital signs record');
    }
  }

  /**
   * Get vital signs by patient ID
   * @param {number} patientId - Patient ID
   * @param {number} limit - Maximum number of records to return (optional)
   * @returns {Promise<Array>} Array of vital signs records
   */
  async getVitalSignsByPatient(patientId, limit = null) {
    let query = `
      SELECT vs.* 
      FROM medical_vital_signs vs
      JOIN medical_charts mc ON vs.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      ORDER BY vs.recorded_at DESC
    `;
    
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient vital signs:', error);
      throw new Error('Failed to get patient vital signs');
    }
  }

  /**
   * Get vital signs trends for specific measurements
   * @param {number} patientId - Patient ID
   * @param {string} measurementType - Type of measurement ('temperature', 'heart_rate', 'blood_pressure', etc.)
   * @param {Date} startDate - Start date for trend data (optional)
   * @param {Date} endDate - End date for trend data (optional)
   * @returns {Promise<Array>} Array of measurement values with dates
   */
  async getVitalTrends(patientId, measurementType, startDate = null, endDate = null) {
    let selectColumns;
    
    switch (measurementType) {
      case 'temperature':
        selectColumns = 'recorded_at, temperature as value';
        break;
      case 'heart_rate':
        selectColumns = 'recorded_at, heart_rate as value';
        break;
      case 'blood_pressure':
        selectColumns = 'recorded_at, blood_pressure_systolic as systolic, blood_pressure_diastolic as diastolic';
        break;
      case 'respiratory_rate':
        selectColumns = 'recorded_at, respiratory_rate as value';
        break;
      case 'oxygen_saturation':
        selectColumns = 'recorded_at, oxygen_saturation as value';
        break;
      case 'weight':
        selectColumns = 'recorded_at, weight as value';
        break;
      case 'bmi':
        selectColumns = 'recorded_at, bmi as value';
        break;
      default:
        selectColumns = 'recorded_at, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, bmi';
    }
    
    let query = `
      SELECT ${selectColumns}
      FROM medical_vital_signs vs
      JOIN medical_charts mc ON vs.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
    `;
    
    const queryParams = [patientId];
    let paramCounter = 2;
    
    if (startDate) {
      query += ` AND vs.recorded_at >= $${paramCounter}`;
      queryParams.push(startDate);
      paramCounter++;
    }
    
    if (endDate) {
      query += ` AND vs.recorded_at <= $${paramCounter}`;
      queryParams.push(endDate);
    }
    
    query += ` ORDER BY vs.recorded_at ASC`;
    
    try {
      const { rows } = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting vital trends:', error);
      throw new Error('Failed to get vital trends');
    }
  }

  /**
   * Flag abnormal vital signs based on age and gender
   * @param {Object} vitalSigns - Vital signs record
   * @param {number} age - Patient's age
   * @param {string} gender - Patient's gender
   * @returns {Object} Vital signs with abnormal flags
   */
  async flagAbnormalVitals(vitalSigns, age, gender) {
    // This is a simplified version - in real life, would use more nuanced ranges based on age/gender
    const abnormalFlags = {
      temperature: false,
      heart_rate: false,
      respiratory_rate: false,
      blood_pressure: false,
      oxygen_saturation: false,
      bmi: false
    };
    
    // Temperature: Normal range is typically 36.5-37.5°C or 97.7-99.5°F
    if (vitalSigns.temperature) {
      abnormalFlags.temperature = vitalSigns.temperature < 36.5 || vitalSigns.temperature > 37.5;
    }
    
    // Heart rate: Varies by age but roughly 60-100 bpm for adults
    if (vitalSigns.heart_rate) {
      if (age < 18) {
        abnormalFlags.heart_rate = vitalSigns.heart_rate < 70 || vitalSigns.heart_rate > 110;
      } else {
        abnormalFlags.heart_rate = vitalSigns.heart_rate < 60 || vitalSigns.heart_rate > 100;
      }
    }
    
    // Respiratory rate: Typically 12-20 breaths per minute for adults
    if (vitalSigns.respiratory_rate) {
      if (age < 18) {
        abnormalFlags.respiratory_rate = vitalSigns.respiratory_rate < 15 || vitalSigns.respiratory_rate > 30;
      } else {
        abnormalFlags.respiratory_rate = vitalSigns.respiratory_rate < 12 || vitalSigns.respiratory_rate > 20;
      }
    }
    
    // Blood pressure: Normal is typically <120/80 mmHg
    if (vitalSigns.blood_pressure_systolic && vitalSigns.blood_pressure_diastolic) {
      abnormalFlags.blood_pressure = vitalSigns.blood_pressure_systolic > 130 || 
                                    vitalSigns.blood_pressure_systolic < 90 || 
                                    vitalSigns.blood_pressure_diastolic > 80 || 
                                    vitalSigns.blood_pressure_diastolic < 60;
    }
    
    // Oxygen saturation: Typically >95%
    if (vitalSigns.oxygen_saturation) {
      abnormalFlags.oxygen_saturation = vitalSigns.oxygen_saturation < 95;
    }
    
    // BMI: Normal range is 18.5-24.9
    if (vitalSigns.bmi) {
      abnormalFlags.bmi = vitalSigns.bmi < 18.5 || vitalSigns.bmi > 24.9;
    }
    
    return {
      ...vitalSigns,
      abnormalFlags
    };
  }
}

module.exports = new VitalSignsModel();