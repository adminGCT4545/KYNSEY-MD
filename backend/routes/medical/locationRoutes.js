/**
 * Location Routes for KYNSEY MD Medical ERP
 * Handles API endpoints related to medical locations
 */

import express from 'express';
import { pool } from '../../utils/db.js';

const router = express.Router();

/**
 * @route   GET /api/medical/locations
 * @desc    Get all medical locations
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM medical_locations
      WHERE is_active = true
      ORDER BY name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/locations/:id
 * @desc    Get a location by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const query = `
      SELECT * FROM medical_locations
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching location ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;