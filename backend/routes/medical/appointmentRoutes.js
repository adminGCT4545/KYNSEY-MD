/**
 * Appointment Routes for KYNSEY MD Medical ERP
 * Handles API endpoints related to appointments
 */

import express from 'express';
import * as appointmentModel from '../../models/medical/appointmentModel.js';

const router = express.Router();

/**
 * @route   GET /api/medical/appointments
 * @desc    Get all appointments with optional filtering
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const filters = {
      date: req.query.date || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : null,
      providerId: req.query.providerId ? parseInt(req.query.providerId) : null,
      operatoryId: req.query.operatoryId ? parseInt(req.query.operatoryId) : null,
      status: req.query.status || null,
      patientId: req.query.patientId ? parseInt(req.query.patientId) : null,
      searchTerm: req.query.searchTerm || null
    };
    
    // Handle array of statuses
    if (req.query.statuses) {
      filters.status = Array.isArray(req.query.statuses) 
        ? req.query.statuses 
        : req.query.statuses.split(',');
    }
    
    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const appointments = await appointmentModel.getAllAppointments(filters);
    res.json(appointments);
  } catch (error) {
    console.error('Error in GET /appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/appointments/daily-schedule
 * @desc    Get daily schedule for a specific date and location
 * @access  Private
 */
router.get('/daily-schedule', async (req, res) => {
  try {
    const { date, locationId } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    if (!locationId) {
      return res.status(400).json({ message: 'Location ID is required' });
    }
    
    const schedule = await appointmentModel.getDailySchedule(
      date,
      parseInt(locationId)
    );
    
    res.json(schedule);
  } catch (error) {
    console.error('Error in GET /appointments/daily-schedule:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/medical/appointments/:id
 * @desc    Get an appointment by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = await appointmentModel.getAppointmentById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error(`Error in GET /appointments/${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/medical/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      'patient_id', 'provider_id', 'location_id', 'operatory_id',
      'appointment_date', 'start_time', 'end_time', 'appointment_type'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }
    
    const newAppointment = await appointmentModel.createAppointment(req.body);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error in POST /appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/medical/appointments/:id
 * @desc    Update an existing appointment
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedAppointment = await appointmentModel.updateAppointment(id, req.body);
    res.json(updatedAppointment);
  } catch (error) {
    console.error(`Error in PUT /appointments/${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PATCH /api/medical/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate status
    const validStatuses = [
      'scheduled', 'confirmed', 'arrived', 'in-progress', 
      'completed', 'cancelled', 'noshow'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses
      });
    }
    
    const updatedAppointment = await appointmentModel.updateAppointmentStatus(id, status);
    res.json(updatedAppointment);
  } catch (error) {
    console.error(`Error in PATCH /appointments/${req.params.id}/status:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/medical/appointments/:id
 * @desc    Delete an appointment
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await appointmentModel.deleteAppointment(id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /appointments/${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
