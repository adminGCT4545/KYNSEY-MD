/**
 * Provider Routes for KYNSEY MD Medical ERP
 * Handles API endpoints related to medical providers
 */

import express from 'express';
import { pool } from '../../utils/db.js';

const router = express.Router();

/**
 * @route   GET /api/medical/providers
 * @desc    Get all medical providers
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, 
             u.first_name, 
             u.last_name, 
             u.email,
             u.phone,
             p.specialty as specialty_name
      FROM medical_providers p
      JOIN medical_users u ON p.user_id = u.id
      WHERE p.is_active = true
      ORDER BY u.last_name, u.first_name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/providers/:id
 * @desc    Get a provider by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const query = `
      SELECT p.*, 
             u.first_name, 
             u.last_name, 
             u.email,
             u.phone,
             p.specialty as specialty_name
      FROM medical_providers p
      JOIN medical_users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching provider ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;