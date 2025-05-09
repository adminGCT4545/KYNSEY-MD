/**
 * Appointment Model for KYNSEY MD Medical ERP
 * Handles database operations related to appointments
 */

const { pool } = require('../../utils/db');

/**
 * Get all appointments with optional filtering
 * @param {Object} filters - Optional filters (e.g., { date: '2025-05-08', locationId: 1 })
 * @returns {Promise<Array>} Array of appointment objects
 */
const getAllAppointments = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        a.*,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        p.phone AS patient_phone,
        p.email AS patient_email,
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
      WHERE 1=1
    `;
    
    const values = [];
    let paramIndex = 1;
    
    // Add date filter if provided
    if (filters.date) {
      query += ` AND a.appointment_date = $${paramIndex++}`;
      values.push(filters.date);
    } else if (filters.startDate && filters.endDate) {
      query += ` AND a.appointment_date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
      values.push(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      query += ` AND a.appointment_date >= $${paramIndex++}`;
      values.push(filters.startDate);
    } else if (filters.endDate) {
      query += ` AND a.appointment_date <= $${paramIndex++}`;
      values.push(filters.endDate);
    }
    
    // Add location filter if provided
    if (filters.locationId) {
      query += ` AND a.location_id = $${paramIndex++}`;
      values.push(filters.locationId);
    }
    
    // Add provider filter if provided
    if (filters.providerId) {
      query += ` AND a.provider_id = $${paramIndex++}`;
      values.push(filters.providerId);
    }
    
    // Add operatory filter if provided
    if (filters.operatoryId) {
      query += ` AND a.operatory_id = $${paramIndex++}`;
      values.push(filters.operatoryId);
    }
    
    // Add status filter if provided
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query += ` AND a.status = ANY($${paramIndex++})`;
        values.push(filters.status);
      } else {
        query += ` AND a.status = $${paramIndex++}`;
        values.push(filters.status);
      }
    }
    
    // Add patient filter if provided
    if (filters.patientId) {
      query += ` AND a.patient_id = $${paramIndex++}`;
      values.push(filters.patientId);
    }
    
    // Add search term filter if provided
    if (filters.searchTerm) {
      query += ` AND (
        p.first_name ILIKE $${paramIndex} OR 
        p.last_name ILIKE $${paramIndex} OR 
        p.phone ILIKE $${paramIndex} OR 
        p.email ILIKE $${paramIndex} OR
        a.reason_for_visit ILIKE $${paramIndex} OR
        a.notes ILIKE $${paramIndex}
      )`;
      values.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }
    
    // Order by date and time
    query += ` ORDER BY a.appointment_date, a.start_time`;
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    throw error;
  }
};

/**
 * Get an appointment by ID
 * @param {number} id - Appointment ID
 * @returns {Promise<Object>} Appointment object
 */
const getAppointmentById = async (id) => {
  try {
    const query = `
      SELECT 
        a.*,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        p.phone AS patient_phone,
        p.email AS patient_email,
        p.date_of_birth AS patient_dob,
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
        a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Get services associated with this appointment
    const servicesQuery = `
      SELECT 
        as.*,
        s.code,
        s.name,
        s.description,
        s.category
      FROM 
        medical_appointment_services as
      JOIN 
        medical_services s ON as.service_id = s.id
      WHERE 
        as.appointment_id = $1
    `;
    
    const servicesResult = await pool.query(servicesQuery, [id]);
    
    // Combine appointment with services
    const appointment = result.rows[0];
    appointment.services = servicesResult.rows;
    
    return appointment;
  } catch (error) {
    console.error(`Error in getAppointmentById for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment object
 */
const createAppointment = async (appointmentData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const insertQuery = `
      INSERT INTO medical_appointments (
        patient_id, provider_id, location_id, operatory_id,
        appointment_date, start_time, end_time, status,
        appointment_type, reason_for_visit, notes, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *
    `;
    
    const values = [
      appointmentData.patient_id,
      appointmentData.provider_id,
      appointmentData.location_id,
      appointmentData.operatory_id,
      appointmentData.appointment_date,
      appointmentData.start_time,
      appointmentData.end_time,
      appointmentData.status || 'scheduled',
      appointmentData.appointment_type,
      appointmentData.reason_for_visit,
      appointmentData.notes,
      appointmentData.created_by
    ];
    
    const result = await client.query(insertQuery, values);
    const newAppointment = result.rows[0];
    
    // If services are provided, add them
    if (appointmentData.services && appointmentData.services.length > 0) {
      for (const service of appointmentData.services) {
        const serviceQuery = `
          INSERT INTO medical_appointment_services (
            appointment_id, service_id, fee_charged,
            insurance_coverage, patient_portion, status,
            provider_id, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
        `;
        
        const serviceValues = [
          newAppointment.id,
          service.service_id,
          service.fee_charged,
          service.insurance_coverage,
          service.patient_portion,
          service.status || 'planned',
          service.provider_id || appointmentData.provider_id,
          service.notes
        ];
        
        await client.query(serviceQuery, serviceValues);
      }
    }
    
    await client.query('COMMIT');
    
    // Return the newly created appointment with full details
    return await getAppointmentById(newAppointment.id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createAppointment:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing appointment
 * @param {number} id - Appointment ID
 * @param {Object} appointmentData - Updated appointment data
 * @returns {Promise<Object>} Updated appointment object
 */
const updateAppointment = async (id, appointmentData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Build the update query dynamically based on provided fields
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    // Add each field that exists in appointmentData to the update query
    for (const [key, value] of Object.entries(appointmentData)) {
      // Skip the services field as it's handled separately
      if (key !== 'services' && value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the appointment ID as the last parameter
    values.push(id);
    
    const updateQuery = `
      UPDATE medical_appointments
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    // If services are provided, update them
    if (appointmentData.services && appointmentData.services.length > 0) {
      // First, delete any existing services not in the new list
      const serviceIds = appointmentData.services
        .filter(s => s.id)
        .map(s => s.id);
      
      if (serviceIds.length > 0) {
        const deleteQuery = `
          DELETE FROM medical_appointment_services
          WHERE appointment_id = $1 AND id NOT IN (${serviceIds.map((_, i) => `$${i + 2}`).join(', ')})
        `;
        
        await client.query(deleteQuery, [id, ...serviceIds]);
      } else {
        // If no service IDs provided, delete all existing services
        await client.query(
          'DELETE FROM medical_appointment_services WHERE appointment_id = $1',
          [id]
        );
      }
      
      // Then, insert or update services
      for (const service of appointmentData.services) {
        if (service.id) {
          // Update existing service
          const serviceUpdateFields = [];
          const serviceValues = [];
          let serviceParamIndex = 1;
          
          for (const [key, value] of Object.entries(service)) {
            if (key !== 'id' && value !== undefined) {
              serviceUpdateFields.push(`${key} = $${serviceParamIndex}`);
              serviceValues.push(value);
              serviceParamIndex++;
            }
          }
          
          serviceUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          serviceValues.push(service.id);
          
          const updateServiceQuery = `
            UPDATE medical_appointment_services
            SET ${serviceUpdateFields.join(', ')}
            WHERE id = $${serviceParamIndex}
          `;
          
          await client.query(updateServiceQuery, serviceValues);
        } else {
          // Insert new service
          const serviceQuery = `
            INSERT INTO medical_appointment_services (
              appointment_id, service_id, fee_charged,
              insurance_coverage, patient_portion, status,
              provider_id, notes
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8
            )
          `;
          
          const serviceValues = [
            id,
            service.service_id,
            service.fee_charged,
            service.insurance_coverage,
            service.patient_portion,
            service.status || 'planned',
            service.provider_id || appointmentData.provider_id,
            service.notes
          ];
          
          await client.query(serviceQuery, serviceValues);
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Return the updated appointment with full details
    return await getAppointmentById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error in updateAppointment for ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete an appointment
 * @param {number} id - Appointment ID
 * @returns {Promise<boolean>} True if successful
 */
const deleteAppointment = async (id) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First delete associated services
    await client.query(
      'DELETE FROM medical_appointment_services WHERE appointment_id = $1',
      [id]
    );
    
    // Then delete the appointment
    const result = await client.query(
      'DELETE FROM medical_appointments WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error in deleteAppointment for ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update appointment status
 * @param {number} id - Appointment ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated appointment object
 */
const updateAppointmentStatus = async (id, status) => {
  try {
    const query = `
      UPDATE medical_appointments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error in updateAppointmentStatus for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get daily schedule
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} locationId - Location ID
 * @returns {Promise<Object>} Schedule object with appointments grouped by operatory
 */
const getDailySchedule = async (date, locationId) => {
  try {
    // Get all operatories for the location
    const operatoriesQuery = `
      SELECT * FROM medical_operatories
      WHERE location_id = $1 AND is_active = true
      ORDER BY name
    `;
    
    const operatoriesResult = await pool.query(operatoriesQuery, [locationId]);
    const operatories = operatoriesResult.rows;
    
    // Get all appointments for the date and location
    const appointmentsQuery = `
      SELECT 
        a.*,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        p.phone AS patient_phone,
        CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN true ELSE false END AS is_new_patient,
        CONCAT(u.first_name, ' ', u.last_name) AS provider_name,
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
        medical_operatories o ON a.operatory_id = o.id
      WHERE 
        a.appointment_date = $1 AND a.location_id = $2
      ORDER BY 
        a.start_time
    `;
    
    const appointmentsResult = await pool.query(appointmentsQuery, [date, locationId]);
    const appointments = appointmentsResult.rows;
    
    // Group appointments by operatory
    const schedule = {
      date,
      operatories: operatories.map(operatory => {
        return {
          ...operatory,
          appointments: appointments.filter(
            appointment => appointment.operatory_id === operatory.id
          )
        };
      })
    };
    
    return schedule;
  } catch (error) {
    console.error(`Error in getDailySchedule for date ${date} and location ${locationId}:`, error);
    throw error;
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getDailySchedule
};
