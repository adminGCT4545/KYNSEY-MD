import express from 'express';
import memberModel from '../models/memberModel.js';

const router = express.Router();

/**
 * @route GET /api/member-management/test
 * @desc Test member management route
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Member Management API is working' });
});

/**
 * @route GET /api/member-management/members
 * @desc Get all members with optional filtering
 * @access Public
 */
router.get('/members', async (req, res) => {
  try {
    const { status, membershipType, limit } = req.query;
    const members = await memberModel.getAllMembers(status, membershipType, limit);
    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/member-management/members/:id
 * @desc Get a member by ID
 * @access Public
 */
router.get('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await memberModel.getMemberById(memberId);
    
    if (!member) {
      return res.status(404).json({ error: `Member with ID ${memberId} not found` });
    }
    
    res.json(member);
  } catch (err) {
    console.error('Error fetching member:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/member-management/members
 * @desc Create a new member
 * @access Public
 */
router.post('/members', async (req, res) => {
  try {
    const memberData = req.body;
    const result = await memberModel.createMember(memberData);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PUT /api/member-management/members/:id
 * @desc Update an existing member
 * @access Public
 */
router.put('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const memberData = req.body;
    const result = await memberModel.updateMember(memberId, memberData);
    res.json(result);
  } catch (err) {
    console.error('Error updating member:', err);
    
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/member-management/members/:id
 * @desc Delete a member
 * @access Public
 */
router.delete('/members/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const result = await memberModel.deleteMember(memberId);
    res.json(result);
  } catch (err) {
    console.error('Error deleting member:', err);
    
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/member-management/membership-types
 * @desc Get all membership types
 * @access Public
 */
router.get('/membership-types', async (req, res) => {
  try {
    const types = await memberModel.getMembershipTypes();
    res.json(types);
  } catch (err) {
    console.error('Error fetching membership types:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/member-management/members/:id/activities
 * @desc Get activities for a specific member
 * @access Public
 */
router.get('/members/:id/activities', async (req, res) => {
  try {
    const memberId = req.params.id;
    const limit = req.query.limit || 20;
    const activities = await memberModel.getMemberActivities(memberId, limit);
    res.json(activities);
  } catch (err) {
    console.error('Error fetching member activities:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/member-management/members/:id/activities
 * @desc Add an activity for a member
 * @access Public
 */
router.post('/members/:id/activities', async (req, res) => {
  try {
    const memberId = req.params.id;
    const activityData = {
      ...req.body,
      member_id: memberId
    };
    
    const result = await memberModel.addMemberActivity(activityData);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding member activity:', err);
    
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/member-management/expiring
 * @desc Get members with expiring memberships
 * @access Public
 */
router.get('/expiring', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const limit = req.query.limit || 100;
    const expiringMembers = await memberModel.getExpiringMemberships(days, limit);
    res.json(expiringMembers);
  } catch (err) {
    console.error('Error fetching expiring memberships:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/member-management/stats
 * @desc Get membership statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await memberModel.getMemberStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching membership stats:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/member-management/clear-cache
 * @desc Clear the member model cache
 * @access Public
 */
router.post('/clear-cache', (req, res) => {
  try {
    memberModel.clearCache();
    res.json({ message: 'Member cache cleared successfully' });
  } catch (err) {
    console.error('Error clearing member cache:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
