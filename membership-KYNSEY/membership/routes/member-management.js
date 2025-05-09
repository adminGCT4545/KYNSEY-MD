import express from 'express';
import pg from 'pg';

const router = express.Router();

// Get all membership types
router.get('/membership-types', async (req, res) => {
    try {
        const result = await global.pgPool.query('SELECT * FROM membership_types');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching membership types:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all members
router.get('/members', async (req, res) => {
    try {
        const result = await global.pgPool.query('SELECT * FROM members');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get activity log
router.get('/activity-log', async (req, res) => {
    try {
        const result = await global.pgPool.query('SELECT * FROM activity_log');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching activity log:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
