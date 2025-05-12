/**
 * Patient Model for KYNSEY MD Medical ERP
 * Handles database operations related to patients
 */

import { pool } from '../../utils/db.js';

/**
 * Get all patients with optional filtering
 * @param {Object} filters - Optional filters (e.g., { isActive: true, locationId: 1 })
 * @returns {Promise<Array>} Array of patient objects
 */
const getAllPatients = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        p.*,
        CONCAT(p.first_name, ' ', p.last_name) AS full_name,
        l.name AS preferred_location_name,
        CONCAT(pr.first_name, ' ', pr.last_name) AS preferred_provider_name
      FROM 
        medical_patients p
      LEFT JOIN 
        medical_locations l ON p.preferred_location_id = l.id
      LEFT JOIN 
        medical_providers mp ON p.preferred_provider_id = mp.id
      LEFT JOIN 
        medical_users pr ON mp.user_id = pr.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramIndex = 1;
    
    // Add filters if provided
    if (filters.isActive !== undefined) {
      query += ` AND p.is_active = $${paramIndex++}`;
      values.push(filters.isActive);
    }
    
    if (filters.locationId) {
      query += ` AND p.preferred_location_id = $${paramIndex++}`;
      values.push(filters.locationId);
    }
    
    if (filters.providerId) {
      query += ` AND p.preferred_provider_id = $${paramIndex++}`;
      values.push(filters.providerId);
    }
    
    if (filters.searchTerm) {
      query += ` AND (
        p.first_name ILIKE $${paramIndex} OR 
        p.last_name ILIKE $${paramIndex} OR 
        p.phone ILIKE $${paramIndex} OR 
        p.email ILIKE $${paramIndex}
      )`;
      values.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY p.last_name, p.first_name`;
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllPatients:', error);
    throw error;
  }
};

/**
 * Get a patient by ID
 * @param {number} id - Patient ID
 * @returns {Promise<Object>} Patient object
 */
const getPatientById = async (id) => {
  try {
    const query = `
      SELECT 
        p.*,
        CONCAT(p.first_name, ' ', p.last_name) AS full_name,
        l.name AS preferred_location_name,
        CONCAT(pr.first_name, ' ', pr.last_name) AS preferred_provider_name
      FROM 
        medical_patients p
      LEFT JOIN 
        medical_locations l ON p.preferred_location_id = l.id
      LEFT JOIN 
        medical_providers mp ON p.preferred_provider_id = mp.id
      LEFT JOIN 
        medical_users pr ON mp.user_id = pr.id
      WHERE 
        p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error in getPatientById for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new patient
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} Created patient object
 */
const createPatient = async (patientData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const insertQuery = `
      INSERT INTO medical_patients (
        first_name, last_name, date_of_birth, gender, email, phone,
        address_line1, address_line2, city, state, postal_code, country,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        preferred_location_id, preferred_provider_id, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `;
    
    const values = [
      patientData.first_name,
      patientData.last_name,
      patientData.date_of_birth,
      patientData.gender,
      patientData.email,
      patientData.phone,
      patientData.address_line1,
      patientData.address_line2,
      patientData.city,
      patientData.state,
      patientData.postal_code,
      patientData.country || 'USA',
      patientData.emergency_contact_name,
      patientData.emergency_contact_phone,
      patientData.emergency_contact_relation,
      patientData.preferred_location_id,
      patientData.preferred_provider_id,
      patientData.notes
    ];
    
    const result = await client.query(insertQuery, values);
    const newPatient = result.rows[0];
    
    // If insurance data is provided, add it
    if (patientData.insurance) {
      const insuranceQuery = `
        INSERT INTO medical_patient_insurance (
          patient_id, insurance_provider, policy_number, group_number,
          subscriber_name, subscriber_relationship, subscriber_dob,
          coverage_start_date, coverage_end_date, is_primary
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *
      `;
      
      const insuranceValues = [
        newPatient.id,
        patientData.insurance.provider,
        patientData.insurance.policy_number,
        patientData.insurance.group_number,
        patientData.insurance.subscriber_name,
        patientData.insurance.subscriber_relationship || 'Self',
        patientData.insurance.subscriber_dob,
        patientData.insurance.coverage_start_date,
        patientData.insurance.coverage_end_date,
        patientData.insurance.is_primary !== undefined ? patientData.insurance.is_primary : true
      ];
      
      await client.query(insuranceQuery, insuranceValues);
    }
    
    await client.query('COMMIT');
    return newPatient;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createPatient:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing patient
 * @param {number} id - Patient ID
 * @param {Object} patientData - Updated patient data
 * @returns {Promise<Object>} Updated patient object
 */
const updatePatient = async (id, patientData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Build the update query dynamically based on provided fields
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    // Add each field that exists in patientData to the update query
    for (const [key, value] of Object.entries(patientData)) {
      // Skip the insurance field as it's handled separately
      if (key !== 'insurance' && value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the patient ID as the last parameter
    values.push(id);
    
    const updateQuery = `
      UPDATE medical_patients
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    const updatedPatient = result.rows[0];
    
    // If insurance data is provided, update or insert it
    if (patientData.insurance) {
      // Check if insurance record exists
      const checkInsuranceQuery = `
        SELECT id FROM medical_patient_insurance
        WHERE patient_id = $1 AND is_primary = true
      `;
      
      const insuranceResult = await client.query(checkInsuranceQuery, [id]);
      
      if (insuranceResult.rows.length > 0) {
        // Update existing insurance
        const insuranceId = insuranceResult.rows[0].id;
        const insuranceUpdateFields = [];
        const insuranceValues = [];
        let insuranceParamIndex = 1;
        
        for (const [key, value] of Object.entries(patientData.insurance)) {
          if (value !== undefined) {
            insuranceUpdateFields.push(`${key} = $${insuranceParamIndex}`);
            insuranceValues.push(value);
            insuranceParamIndex++;
          }
        }
        
        insuranceUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        insuranceValues.push(insuranceId);
        
        const updateInsuranceQuery = `
          UPDATE medical_patient_insurance
          SET ${insuranceUpdateFields.join(', ')}
          WHERE id = $${insuranceParamIndex}
        `;
        
        await client.query(updateInsuranceQuery, insuranceValues);
      } else {
        // Insert new insurance
        const insuranceQuery = `
          INSERT INTO medical_patient_insurance (
            patient_id, insurance_provider, policy_number, group_number,
            subscriber_name, subscriber_relationship, subscriber_dob,
            coverage_start_date, coverage_end_date, is_primary
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
        `;
        
        const insuranceValues = [
          id,
          patientData.insurance.provider,
          patientData.insurance.policy_number,
          patientData.insurance.group_number,
          patientData.insurance.subscriber_name,
          patientData.insurance.subscriber_relationship || 'Self',
          patientData.insurance.subscriber_dob,
          patientData.insurance.coverage_start_date,
          patientData.insurance.coverage_end_date,
          patientData.insurance.is_primary !== undefined ? patientData.insurance.is_primary : true
        ];
        
        await client.query(insuranceQuery, insuranceValues);
      }
    }
    
    await client.query('COMMIT');
    return updatedPatient;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error in updatePatient for ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete a patient (soft delete by setting is_active to false)
 * @param {number} id - Patient ID
 * @returns {Promise<boolean>} True if successful
 */
const deletePatient = async (id) => {
  try {
    const query = `
      UPDATE medical_patients
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Patient with ID ${id} not found`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deletePatient for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get patient appointments
 * @param {number} patientId - Patient ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of appointment objects
 */
const getPatientAppointments = async (patientId, filters = {}) => {
  try {
    let query = `
      SELECT 
        a.*,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        CONCAT(u.first_name, ' ', u.last_name) AS provider_name,
        l.name AS location_name,
        o.name AS operatory_name
      FROM 
        medical_appointments a
      JOIN 
        medical_patients p ON a.patient_id = p.id
      JOIN 
        medical_providers pr ON a.provider_id = pr.id
      JOIN 
        medical_users u ON pr.user_id = u.id
      JOIN 
        medical_locations l ON a.location_id = l.id
      JOIN 
        medical_operatories o ON a.operatory_id = o.id
      WHERE 
        a.patient_id = $1
    `;
    
    const values = [patientId];
    let paramIndex = 2;
    
    // Add date filter if provided
    if (filters.startDate) {
      query += ` AND a.appointment_date >= $${paramIndex++}`;
      values.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ` AND a.appointment_date <= $${paramIndex++}`;
      values.push(filters.endDate);
    }
    
    // Add status filter if provided
    if (filters.status) {
      query += ` AND a.status = $${paramIndex++}`;
      values.push(filters.status);
    }
    
    query += ` ORDER BY a.appointment_date DESC, a.start_time DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error(`Error in getPatientAppointments for patient ID ${patientId}:`, error);
    throw error;
  }
};

export {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments
};
