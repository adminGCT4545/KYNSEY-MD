/**
 * Helper Utilities
 * Helper functions for common tasks
 */

/**
 * Sanitize input for SQL query
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized input
 */
exports.sanitizeInput = (input) => {
  if (input === null || input === undefined) {
    return null;
  }
  
  if (typeof input !== 'string') {
    return input;
  }
  
  // Basic sanitization - replace SQL injection characters
  return input
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/;/g, "")    // Remove semicolons
    .replace(/--/g, "")   // Remove comment markers
    .replace(/\/\*/g, "") // Remove block comment start
    .replace(/\*\//g, ""); // Remove block comment end
};

/**
 * Format date range for queries
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Formatted start and end dates
 */
exports.formatDateRange = (startDate, endDate) => {
  try {
    const formattedStartDate = startDate ? new Date(startDate) : null;
    
    // Set end date to end of day (23:59:59)
    const formattedEndDate = endDate ? new Date(endDate) : null;
    if (formattedEndDate) {
      formattedEndDate.setHours(23, 59, 59, 999);
    }
    
    return { formattedStartDate, formattedEndDate };
  } catch (error) {
    console.error('Error formatting date range:', error);
    throw new Error('Invalid date format');
  }
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted currency string
 */
exports.formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) {
    return '-';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date in standard format
 * @param {Date|string} date - Date to format
 * @param {string} [format='medium'] - Format to use ('short', 'medium', 'long', 'full')
 * @returns {string} Formatted date string
 */
exports.formatDate = (date, format = 'medium') => {
  if (!date) {
    return '-';
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };
    
    return dateObj.toLocaleDateString('en-US', options[format]);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toString();
  }
};

/**
 * Generate random ID
 * @param {number} [length=8] - Length of ID
 * @returns {string} Random ID
 */
exports.generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Paginate array results
 * @param {Array} items - Array of items to paginate
 * @param {number} page - Current page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Paginated results with metadata
 */
exports.paginate = (items, page = 1, pageSize = 10) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(pageSize) || 10;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    meta: {
      totalItems: items.length,
      itemsPerPage: itemsPerPage,
      currentPage: currentPage,
      totalPages: Math.ceil(items.length / itemsPerPage),
      hasNextPage: endIndex < items.length,
      hasPrevPage: startIndex > 0
    }
  };
};