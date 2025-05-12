/**
 * Patient Documents Model
 * Handles interaction with the medical_documents table
 */

const pool = require('../utils/db');
const path = require('path');
const fs = require('fs/promises');

class DocumentsModel {
  /**
   * Create a new document record
   * @param {Object} documentData - Document metadata
   * @returns {Promise<Object>} Created document record
   */
  async createDocument(documentData) {
    const {
      chart_id,
      document_type,
      title,
      file_path,
      description
    } = documentData;

    const query = `
      INSERT INTO medical_documents (
        chart_id,
        document_type,
        title,
        file_path,
        description
      ) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        chart_id,
        document_type,
        title,
        file_path,
        description
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document record');
    }
  }

  /**
   * Get a document by ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Document record
   */
  async getDocumentById(documentId) {
    const query = 'SELECT * FROM medical_documents WHERE document_id = $1';
    
    try {
      const { rows } = await pool.query(query, [documentId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error('Failed to get document');
    }
  }

  /**
   * Get all documents for a patient chart
   * @param {number} chartId - Chart ID
   * @returns {Promise<Array>} Array of document records
   */
  async getDocumentsByChart(chartId) {
    const query = 'SELECT * FROM medical_documents WHERE chart_id = $1 ORDER BY upload_date DESC';
    
    try {
      const { rows } = await pool.query(query, [chartId]);
      return rows;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw new Error('Failed to get documents');
    }
  }

  /**
   * Update a document record
   * @param {number} documentId - Document ID
   * @param {Object} documentData - Updated document data
   * @returns {Promise<Object>} Updated document record
   */
  async updateDocument(documentId, documentData) {
    const {
      document_type,
      title,
      description
    } = documentData;

    const query = `
      UPDATE medical_documents 
      SET 
        document_type = $1, 
        title = $2, 
        description = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE document_id = $4 
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, [
        document_type,
        title,
        description,
        documentId
      ]);
      return rows[0];
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  /**
   * Delete a document record and associated file
   * @param {number} documentId - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId) {
    try {
      // First get the file path
      const document = await this.getDocumentById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Delete the record from the database
      const query = 'DELETE FROM medical_documents WHERE document_id = $1 RETURNING *';
      const { rowCount } = await pool.query(query, [documentId]);
      
      if (rowCount > 0) {
        // Delete the physical file if it exists
        try {
          await fs.unlink(document.file_path);
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Continue even if file deletion fails
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  /**
   * Get documents by patient ID
   * @param {number} patientId - Patient ID
   * @returns {Promise<Array>} Array of document records
   */
  async getDocumentsByPatient(patientId) {
    const query = `
      SELECT md.* 
      FROM medical_documents md
      JOIN medical_charts mc ON md.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      ORDER BY md.upload_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting patient documents:', error);
      throw new Error('Failed to get patient documents');
    }
  }

  /**
   * Get documents by type
   * @param {number} chartId - Chart ID
   * @param {string} documentType - Document type
   * @returns {Promise<Array>} Array of document records
   */
  async getDocumentsByType(chartId, documentType) {
    const query = `
      SELECT * FROM medical_documents 
      WHERE chart_id = $1 AND document_type = $2
      ORDER BY upload_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [chartId, documentType]);
      return rows;
    } catch (error) {
      console.error('Error getting documents by type:', error);
      throw new Error('Failed to get documents by type');
    }
  }

  /**
   * Search documents by title or description
   * @param {number} patientId - Patient ID
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching document records
   */
  async searchDocuments(patientId, searchTerm) {
    const query = `
      SELECT md.* 
      FROM medical_documents md
      JOIN medical_charts mc ON md.chart_id = mc.chart_id
      WHERE mc.patient_id = $1 
        AND (md.title ILIKE $2 OR md.description ILIKE $2)
      ORDER BY md.upload_date DESC
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  /**
   * Get storage stats for a patient's documents
   * @param {number} patientId - Patient ID
   * @returns {Promise<Object>} Stats object with counts and types
   */
  async getDocumentStats(patientId) {
    const query = `
      SELECT 
        COUNT(*) as total_count,
        document_type,
        MAX(upload_date) as latest_upload
      FROM medical_documents md
      JOIN medical_charts mc ON md.chart_id = mc.chart_id
      WHERE mc.patient_id = $1
      GROUP BY document_type
      ORDER BY document_type
    `;
    
    try {
      const { rows } = await pool.query(query, [patientId]);
      return rows;
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error('Failed to get document stats');
    }
  }
}

module.exports = new DocumentsModel();