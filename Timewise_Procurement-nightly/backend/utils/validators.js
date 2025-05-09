/**
 * Validation Utilities
 * Helper functions for validating inputs
 */

/**
 * Validate a date range (start date must be before or equal to end date)
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {boolean} True if valid date range, false otherwise
 */
exports.validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return false;
  }
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start) || isNaN(end)) {
      return false;
    }
    
    // End date must be same day or after start date
    return start <= end;
  } catch (error) {
    console.error('Error validating date range:', error);
    return false;
  }
};

/**
 * Validate if the report type is supported
 * @param {string} reportType - Type of report
 * @returns {boolean} True if valid report type, false otherwise
 */
exports.validateReportType = (reportType) => {
  const validReportTypes = [
    'financial', 
    'demographics', 
    'appointments', 
    'claims',
    'clinical',
    'operational'
  ];
  
  return validReportTypes.includes(reportType);
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email, false otherwise
 */
exports.validateEmail = (email) => {
  if (!email) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number, false otherwise
 */
exports.validatePhone = (phone) => {
  if (!phone) {
    return false;
  }
  
  // Basic phone validation (accepts various formats)
  const phoneRegex = /^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date to validate
 * @returns {boolean} True if valid date, false otherwise
 */
exports.validateDate = (date) => {
  if (!date) {
    return false;
  }
  
  try {
    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }
    
    const parsedDate = new Date(date);
    return !isNaN(parsedDate);
  } catch (error) {
    return false;
  }
};

/**
 * Validate monetary amount
 * @param {number|string} amount - Amount to validate
 * @returns {boolean} True if valid monetary amount, false otherwise
 */
exports.validateAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return false;
  }
  
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number and not NaN
  if (typeof numAmount !== 'number' || isNaN(numAmount)) {
    return false;
  }
  
  // Amount should have at most 2 decimal places
  const decimalStr = numAmount.toString();
  const decimalParts = decimalStr.split('.');
  if (decimalParts.length > 1 && decimalParts[1].length > 2) {
    return false;
  }
  
  return true;
};