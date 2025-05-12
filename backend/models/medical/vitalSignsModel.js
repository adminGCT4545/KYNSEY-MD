/**
 * KYNSEY MD - Vital Signs Model
 * Handles operations related to patient vital signs
 */

import db from '../../utils/db.js';

/**
 * Get vital signs for a patient
 * @param {number} patientId - Patient ID
 * @param {Object} filters - Optional filters
 * @param {Date} filters.startDate - Start date filter
 * @param {Date} filters.endDate - End date filter
 * @param {string} filters.vitalType - Type of vital sign to filter by
 * @returns {Promise<Array>} - Vital signs records
 */
export const getPatientVitalSigns = async (patientId, filters = {}) => {
  try {
    // Build the query with appropriate filters
    const { startDate, endDate, vitalType } = filters;
    let query = `
      SELECT 
        vs.id,
        vs.patient_id,
        vs.vital_type,
        vs.value,
        vs.unit,
        vs.date,
        vs.notes,
        vs.recorded_by,
        vs.recorded_at,
        vs.created_at,
        vs.updated_at
      FROM 
        medical_vital_signs vs
      WHERE 
        vs.patient_id = $1
    `;
    
    const queryParams = [patientId];
    let paramCounter = 2;
    
    if (vitalType) {
      query += ` AND vs.vital_type = $${paramCounter}`;
      queryParams.push(vitalType);
      paramCounter++;
    }
    
    if (startDate) {
      query += ` AND vs.date >= $${paramCounter}`;
      queryParams.push(startDate);
      paramCounter++;
    }
    
    if (endDate) {
      query += ` AND vs.date <= $${paramCounter}`;
      queryParams.push(endDate);
      paramCounter++;
    }
    
    // Order by date descending
    query += " ORDER BY vs.date DESC";
    
    const result = await db.query(query, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error in getPatientVitalSigns:', error);
    throw error;
  }
};

/**
 * Create a new vital sign record for a patient
 * @param {Object} vitalSignData - Vital sign data
 * @param {number} vitalSignData.patient_id - Patient ID
 * @param {string} vitalSignData.vital_type - Type of vital sign
 * @param {number} vitalSignData.value - Measurement value
 * @param {string} vitalSignData.unit - Unit of measurement
 * @param {Date} vitalSignData.date - Date of measurement
 * @param {string} vitalSignData.notes - Optional notes
 * @param {string} vitalSignData.recorded_by - Provider who recorded the vital sign
 * @returns {Promise<Object>} - Created vital sign record
 */
export const createVitalSign = async (vitalSignData) => {
  try {
    const {
      patient_id,
      vital_type,
      value,
      unit,
      date,
      notes,
      recorded_by
    } = vitalSignData;
    
    const query = `
      INSERT INTO medical_vital_signs 
        (patient_id, vital_type, value, unit, date, notes, recorded_by, recorded_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      patient_id,
      vital_type,
      value,
      unit,
      date,
      notes,
      recorded_by
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in createVitalSign:', error);
    throw error;
  }
};

/**
 * Update a vital sign record
 * @param {number} vitalId - Vital sign ID
 * @param {Object} vitalSignData - Updated vital sign data
 * @returns {Promise<Object>} - Updated vital sign record
 */
export const updateVitalSign = async (vitalId, vitalSignData) => {
  try {
    // Ensure the vital sign exists and belongs to the specified patient
    const vitalExists = await db.query(
      'SELECT id FROM medical_vital_signs WHERE id = $1 AND patient_id = $2',
      [vitalId, vitalSignData.patient_id]
    );
    
    if (vitalExists.rows.length === 0) {
      throw new Error(`Vital sign record with ID ${vitalId} not found for this patient`);
    }
    
    const {
      vital_type,
      value,
      unit,
      date,
      notes,
      recorded_by
    } = vitalSignData;
    
    const query = `
      UPDATE medical_vital_signs
      SET 
        vital_type = COALESCE($1, vital_type),
        value = COALESCE($2, value),
        unit = COALESCE($3, unit),
        date = COALESCE($4, date),
        notes = $5,
        recorded_by = COALESCE($6, recorded_by),
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        id = $7 AND patient_id = $8
      RETURNING *
    `;
    
    const result = await db.query(query, [
      vital_type,
      value,
      unit,
      date,
      notes, // Allow setting to null
      recorded_by,
      vitalId,
      vitalSignData.patient_id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateVitalSign:', error);
    throw error;
  }
};

/**
 * Delete a vital sign record
 * @param {number} vitalId - Vital sign ID
 * @param {number} patientId - Patient ID (for verification)
 * @returns {Promise<void>}
 */
export const deleteVitalSign = async (vitalId, patientId) => {
  try {
    // Ensure the vital sign exists and belongs to the specified patient
    const vitalExists = await db.query(
      'SELECT id FROM medical_vital_signs WHERE id = $1 AND patient_id = $2',
      [vitalId, patientId]
    );
    
    if (vitalExists.rows.length === 0) {
      throw new Error(`Vital sign record with ID ${vitalId} not found for this patient`);
    }
    
    await db.query(
      'DELETE FROM medical_vital_signs WHERE id = $1',
      [vitalId]
    );
  } catch (error) {
    console.error('Error in deleteVitalSign:', error);
    throw error;
  }
};

/**
 * Get a specific vital sign by ID
 * @param {number} vitalId - Vital sign ID
 * @returns {Promise<Object>} - Vital sign data
 */
export const getVitalSignById = async (vitalId) => {
  try {
    const result = await db.query(
      'SELECT * FROM medical_vital_signs WHERE id = $1',
      [vitalId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Vital sign with ID ${vitalId} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in getVitalSignById:', error);
    throw error;
  }
};