/**
 * Reporting Routes
 * Defines API endpoints for reporting and analytics
 */

const express = require('express');
const router = express.Router();
const reportingModel = require('../../models/medical/reportingModel');
const { validateDateRange, validateReportType } = require('../../utils/validators');

/**
 * @route   GET /api/medical/reports
 * @desc    Get report data based on type, date range, and location
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { reportType, startDate, endDate, location } = req.query;
    
    // Validate inputs
    if (!reportType) {
      return res.status(400).json({ message: 'Report type is required' });
    }
    
    if (!validateReportType(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Date validation for reports that require dates
    if (['financial', 'appointments', 'claims'].includes(reportType)) {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required for this report type' });
      }
      
      if (!validateDateRange(startDate, endDate)) {
        return res.status(400).json({ message: 'Invalid date range' });
      }
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getReportData({
      reportType,
      startDate,
      endDate,
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating report' });
  }
});

/**
 * @route   GET /api/medical/reports/financial
 * @desc    Get financial reports
 * @access  Private
 */
router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    if (!validateDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getFinancialReports({
      startDate,
      endDate,
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in financial reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating financial report' });
  }
});

/**
 * @route   GET /api/medical/reports/demographics
 * @desc    Get patient demographics reports
 * @access  Private
 */
router.get('/demographics', async (req, res) => {
  try {
    const { location } = req.query;
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getDemographicsReports({
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in demographics reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating demographics report' });
  }
});

/**
 * @route   GET /api/medical/reports/appointments
 * @desc    Get appointment statistics reports
 * @access  Private
 */
router.get('/appointments', async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    if (!validateDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getAppointmentReports({
      startDate,
      endDate,
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in appointment reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating appointment report' });
  }
});

/**
 * @route   GET /api/medical/reports/claims
 * @desc    Get claims analysis reports
 * @access  Private
 */
router.get('/claims', async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    if (!validateDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getClaimsReports({
      startDate,
      endDate,
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in claims reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating claims report' });
  }
});

/**
 * @route   GET /api/medical/reports/clinical
 * @desc    Get clinical metrics reports
 * @access  Private
 */
router.get('/clinical', async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    if (!validateDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getClinicalReports({
      startDate,
      endDate,
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in clinical reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating clinical report' });
  }
});

/**
 * @route   GET /api/medical/reports/operational
 * @desc    Get operational statistics reports
 * @access  Private
 */
router.get('/operational', async (req, res) => {
  try {
    const { startDate, endDate, location } = req.query;
    
    // Validate inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    if (!validateDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getOperationalReports({
      startDate,
      endDate,
      location: locationFilter
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in operational reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating operational report' });
  }
});

/**
 * @route   POST /api/medical/reports/custom
 * @desc    Generate a custom report based on user-defined parameters
 * @access  Private
 */
router.post('/custom', async (req, res) => {
  try {
    const { startDate, endDate, location, dataSource, dimensions, metrics, filters } = req.body;
    
    // Validate required inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    if (!validateDateRange(startDate, endDate)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    if (!dataSource) {
      return res.status(400).json({ message: 'Data source is required' });
    }
    
    if (!dimensions || !Array.isArray(dimensions) || dimensions.length === 0) {
      return res.status(400).json({ message: 'At least one dimension is required' });
    }
    
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({ message: 'At least one metric is required' });
    }
    
    // Default to 'all' locations if not specified
    const locationFilter = location || 'all';
    
    const reportData = await reportingModel.getCustomReports({
      startDate,
      endDate,
      location: locationFilter,
      dataSource,
      dimensions,
      metrics,
      filters: filters || {}
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Error in custom reports route:', error);
    res.status(500).json({ message: error.message || 'Server error while generating custom report' });
  }
});

module.exports = router;
