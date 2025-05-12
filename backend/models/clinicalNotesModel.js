/**
 * Clinical Notes Model
 * Handles interaction with the medical_chart_notes table
 */

const pool = require('../utils/db');

class ClinicalNotesModel {
  /**
   * Create a new clinical note
   * @param {Object} noteData - Clinical note data
   * @returns {Promise<Object>} Created clinical note
   */
  async createNote(noteData) {
    const {
      chart_id,
      provider_id,
      note_type,
      subjective,
      objective,
      assessment,
      plan,
      signature,
      signed_at
    } = noteData;

    const query = `
      INSERT INTO medical_chart_notes (
        chart_id,
        provider_id,
        note_type,
        subjective,
        objective,
        assessment,
        plan,
        signature,
        signed_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        provider_id,
        note_type,
        subjective,
        objective,
        assessment,
        plan,
        signature,
        signed_at || null
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating clinical note:', error);
      throw new Error('Failed to create clinical note');
    }
  }

  /**
   * Get a clinical note by ID
   * @param {number} noteId - Note ID
   * @returns {Promise<Object>} Clinical note
   */
  async getNoteById(noteId) {
    const query = `
      SELECT cn.*, p.provider_name 
      FROM medical_chart_notes cn
      JOIN medical_providers p ON cn.provider_id = p.provider_id
      WHERE cn.note_id = $1
    `;
    
    try {
      const { rows } = await pool.query(query, [noteId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting clinical note:', error);
      throw new Error('Failed to get clinical note');
    }
  }

  /**
   * Get all clinical notes for a patient chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of clinical notes
   */
  async getNotesByChart(chartId) {
    const query = `
      SELECT cn.*, p.provider_name 
      FROM medical_chart_notes cn
      JOIN medical_providers p ON cn.provider_id = p.provider_id
      WHERE cn.chart_id = $1 
      ORDER BY cn.note_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting clinical notes:', error);
      throw new Error('Failed to get clinical notes');
    }
  }

  /**
   * Update a clinical note
   * @param {number} noteId - Note ID
   * @param {Object} noteData - Updated note data
   * @returns {Promise<Object>} Updated clinical note
   */
  async updateNote(noteId, noteData) {
    const {
      note_type,
      subjective,
      objective,
      assessment,
      plan,
      signature,
      signed_at
    } = noteData;

    // Check if the note is already signed
    const existingNote = await this.getNoteById(noteId);
    
    if (existingNote && existingNote.signed_at && !noteData.override_signature) {
      throw new Error('Cannot modify a signed note without override permission');
    }

    const query = `
      UPDATE medical_chart_notes 
      SET 
        note_type = $1, 
        subjective = $2, 
        objective = $3, 
        assessment = $4, 
        plan = $5, 
        signature = $6,
        signed_at = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE note_id = $8 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        note_type,
        subjective,
        objective,
        assessment,
        plan,
        signature,
        signed_at,
        noteId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error updating clinical note:', error);
      throw new Error('Failed to update clinical note');
    }
  }

  /**
   * Sign a clinical note
   * @param {number} noteId - Note ID
   * @param {string} signature - Provider signature
   * @returns {Promise<Object>} Signed clinical note
   */
  async signNote(noteId, signature) {
    const query = `
      UPDATE medical_chart_notes 
      SET 
        signature = $1, 
        signed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE note_id = $2 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [signature, noteId]);
      return rows[0];
    } catch (error) {
      console.error('Error signing clinical note:', error);
      throw new Error('Failed to sign clinical note');
    }
  }

  /**
   * Create an amendment to a signed note
   * @param {number} originalNoteId - Original note ID
   * @param {Object} amendmentData - Amendment data
   * @returns {Promise<Object>} Created amendment note
   */
  async createAmendment(originalNoteId, amendmentData) {
    // First get the original note
    const originalNote = await this.getNoteById(originalNoteId);
    
    if (!originalNote) {
      throw new Error('Original note not found');
    }

    const {
      provider_id,
      amendment_text
    } = amendmentData;

    // Create a new note that references the original
    const query = `
      INSERT INTO medical_chart_notes (
        chart_id,
        provider_id,
        note_type,
        subjective,
        objective,
        assessment,
        plan,
        amendment_to
      ) 
      VALUES ($1, $2, 'Amendment', $3, NULL, NULL, NULL, $4) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        originalNote.chart_id,
        provider_id,
        amendment_text,
        originalNoteId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating amendment:', error);
      throw new Error('Failed to create amendment');
    }
  }

  /**
   * Get notes by patient ID
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of clinical notes
   */
  async getNotesByPatient(patientId) {
    const query = `
      SELECT cn.*, p.provider_name 
      FROM medical_chart_notes cn
      JOIN medical_charts mc ON cn.chart_id = mc.chart_id
      JOIN medical_providers p ON cn.provider_id = p.provider_id
      WHERE mc.patient_id = $1
      ORDER BY cn.note_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient notes:', error);
      throw new Error('Failed to get patient notes');
    }
  }

  /**
   * Get notes by provider ID
   * @param {number} providerId - Provider ID
   * @param {Date} startDate - Start date (optional)
   * @param {Date} endDate - End date (optional)
   * @returns {Promise<Array>} Array of clinical notes
   */
  async getNotesByProvider(providerId, startDate, endDate) {
    let query = `
      SELECT cn.*, p.provider_name, pt.first_name as patient_first_name, pt.last_name as patient_last_name
      FROM medical_chart_notes cn
      JOIN medical_charts mc ON cn.chart_id = mc.chart_id
      JOIN medical_patients pt ON mc.patient_id = pt.patient_id
      JOIN medical_providers p ON cn.provider_id = p.provider_id
      WHERE cn.provider_id = $1
    `;
    
    const queryParams = [providerId];
    
    if (startDate && endDate) {
      query += ` AND cn.note_date BETWEEN $2 AND $3`;
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND cn.note_date >= $2`;
      queryParams.push(startDate);
    } else if (endDate) {
      query += ` AND cn.note_date <= $2`;
      queryParams.push(endDate);
    }
    
    query += ` ORDER BY cn.note_date DESC`;
    
    try {
      const { rows } = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting provider notes:', error);
      throw new Error('Failed to get provider notes');
    }
  }

  /**
   * Search notes by content
   * @param {number} patientId - Patient ID
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching clinical notes
   */
  async searchNotes(patientId, searchTerm) {
    const query = `
      SELECT cn.*, p.provider_name 
      FROM medical_chart_notes cn
      JOIN medical_charts mc ON cn.chart_id = mc.chart_id
      JOIN medical_providers p ON cn.provider_id = p.provider_id
      WHERE mc.patient_id = $1 
        AND (
          cn.subjective ILIKE $2 
          OR cn.objective ILIKE $2 
          OR cn.assessment ILIKE $2 
          OR cn.plan ILIKE $2
        )
      ORDER BY cn.note_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error('Failed to search notes');
    }
  }

  /**
   * Get templates for quick note creation
   * @param {string} templateType - Template type (e.g., 'SOAP', 'Progress')
   * @returns {Promise<Array>} Array of note templates
   */
  async getNoteTemplates(templateType) {
    const query = `
      SELECT * FROM medical_note_templates 
      WHERE template_type = $1 
      ORDER BY template_name
    `;
    
    try {
      const { rows } = await pool.query(query, [templateType]);
      return rows;
    } catch (error) {
      console.error('Error getting note templates:', error);
      throw new Error('Failed to get note templates');
    }
  }
}

module.exports = new ClinicalNotesModel();