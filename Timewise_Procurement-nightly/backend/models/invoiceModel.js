import pg from 'pg';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

dotenv.config();

// Create cache instance with TTL defaults
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60 // Check for expired entries every 60 seconds
});

// Use the global PostgreSQL pool or create a new one if it doesn't exist
const pool = global.pgPool || new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'timewise_procument',
  port: parseInt(process.env.PGPORT || '5432'),
});

// Invoice model for database operations
const invoiceModel = {
  /**
   * Get all invoices with supplier information
   * @param {string} status - Optional status filter
   * @param {number} limit - Optional limit for number of results
   * @returns {Promise<Array>} Invoices
   */
  getAllInvoices: async (status = null, limit = 100) => {
    try {
      const cacheKey = `all_invoices_${status || 'all'}_${limit}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const query = `
        SELECT 
          i.invoice_id, 
          i.invoice_number, 
          i.supplier_id, 
          s.supplier_name,
          i.po_id, 
          i.invoice_date, 
          i.due_date, 
          i.status, 
          i.total_amount, 
          i.tax_amount, 
          i.currency, 
          i.payment_terms,
          i.matching_status, 
          i.match_type, 
          i.payment_date,
          CASE 
            WHEN i.status = 'paid' THEN 0
            WHEN i.due_date < CURRENT_DATE THEN EXTRACT(DAY FROM (CURRENT_DATE - i.due_date))
            ELSE 0
          END as days_overdue
        FROM 
          invoices i
        JOIN 
          suppliers s ON i.supplier_id = s.supplier_id
        WHERE 
          ($1::text IS NULL OR i.status = $1)
        ORDER BY 
          i.invoice_date DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [status, limit]);
      
      // Safely parse and format values to handle any null or undefined fields
      const invoices = result.rows.map(row => {
        const safeParseInt = (value) => {
          if (value === null || value === undefined) return 0;
          return parseInt(value) || 0;
        };
        
        const safeParseFloat = (value) => {
          if (value === null || value === undefined) return 0;
          return parseFloat(value) || 0;
        };
        
        const safeString = (value) => {
          if (value === null || value === undefined) return '';
          return String(value);
        };
        
        // Format PO number safely
        let poNumber = null;
        if (row.po_id) {
          try {
            poNumber = `PO-${String(row.po_id).padStart(6, '0')}`;
          } catch (err) {
            poNumber = `PO-${row.po_id}`;
          }
        }
        
        return {
          invoice_id: safeParseInt(row.invoice_id),
          invoice_number: safeString(row.invoice_number),
          supplier_id: safeParseInt(row.supplier_id),
          supplier_name: safeString(row.supplier_name),
          po_id: row.po_id,
          po_number: poNumber,
          invoice_date: row.invoice_date,
          due_date: row.due_date,
          status: safeString(row.status),
          total_amount: safeParseFloat(row.total_amount),
          tax_amount: safeParseFloat(row.tax_amount),
          currency: safeString(row.currency),
          payment_terms: safeString(row.payment_terms),
          matching_status: safeString(row.matching_status),
          match_type: safeString(row.match_type),
          payment_date: row.payment_date,
          days_overdue: safeParseInt(row.days_overdue)
        };
      });

      cache.set(cacheKey, invoices);
      return invoices;
    } catch (error) {
      logger.error('Error in getAllInvoices:', error);
      throw error;
    }
  },

  /**
   * Get invoice aging summary
   * @returns {Promise<Object>} Invoice aging summary
   */
  getInvoiceAgingSummary: async () => {
    try {
      const cacheKey = 'invoice_aging_summary';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      // Using a basic query approach with explicit CASE in both GROUP BY and ORDER BY
      const query = `
        SELECT 
          CASE 
            WHEN status = 'paid' THEN 'Paid'
            WHEN due_date >= CURRENT_DATE THEN 'Not Due'
            WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
            WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
            WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
            ELSE 'Over 90 days'
          END as aging,
          COUNT(*) as invoice_count,
          SUM(total_amount) as total_amount
        FROM 
          invoices
        GROUP BY 1
        ORDER BY 
          CASE 
            WHEN CASE 
              WHEN status = 'paid' THEN 'Paid'
              WHEN due_date >= CURRENT_DATE THEN 'Not Due'
              WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
              ELSE 'Over 90 days'
            END = 'Paid' THEN 1
            WHEN CASE 
              WHEN status = 'paid' THEN 'Paid'
              WHEN due_date >= CURRENT_DATE THEN 'Not Due'
              WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
              ELSE 'Over 90 days'
            END = 'Not Due' THEN 2
            WHEN CASE 
              WHEN status = 'paid' THEN 'Paid'
              WHEN due_date >= CURRENT_DATE THEN 'Not Due'
              WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
              ELSE 'Over 90 days'
            END = '1-30 days' THEN 3
            WHEN CASE 
              WHEN status = 'paid' THEN 'Paid'
              WHEN due_date >= CURRENT_DATE THEN 'Not Due'
              WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
              ELSE 'Over 90 days'
            END = '31-60 days' THEN 4
            WHEN CASE 
              WHEN status = 'paid' THEN 'Paid'
              WHEN due_date >= CURRENT_DATE THEN 'Not Due'
              WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
              WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
              ELSE 'Over 90 days'
            END = '61-90 days' THEN 5
            ELSE 6
          END
      `;
      
      const result = await pool.query(query);
      
      const summary = result.rows.map(row => ({
        aging: row.aging,
        count: parseInt(row.invoice_count),
        amount: parseFloat(row.total_amount)
      }));

      cache.set(cacheKey, summary);
      return summary;
    } catch (error) {
      logger.error('Error in getInvoiceAgingSummary:', error);
      throw error;
    }
  },

  /**
   * Get payment summary statistics
   * @returns {Promise<Object>} Payment summary
   */
  getPaymentSummary: async () => {
    try {
      const cacheKey = 'payment_summary';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const query = `
        SELECT 
          COUNT(*) as total_invoices,
          COUNT(CASE WHEN status != 'paid' THEN 1 END) as unpaid_invoices,
          SUM(CASE WHEN status != 'paid' AND due_date < CURRENT_DATE THEN total_amount ELSE 0 END) as overdue_amount,
          COUNT(CASE WHEN status != 'paid' AND due_date < CURRENT_DATE THEN 1 END) as overdue_invoices,
          MAX(currency) as currency
        FROM 
          invoices
      `;
      
      const result = await pool.query(query);
      
      const summary = {
        totalInvoices: parseInt(result.rows[0].total_invoices),
        unpaidInvoices: parseInt(result.rows[0].unpaid_invoices),
        overdueAmount: parseFloat(result.rows[0].overdue_amount),
        overdueInvoices: parseInt(result.rows[0].overdue_invoices),
        currency: result.rows[0].currency || 'USD'
      };

      cache.set(cacheKey, summary);
      return summary;
    } catch (error) {
      logger.error('Error in getPaymentSummary:', error);
      throw error;
    }
  },

  /**
   * Get recent invoices
   * @param {number} limit - Optional limit for number of results
   * @returns {Promise<Array>} Recent invoices
   */
  getRecentInvoices: async (limit = 5) => {
    try {
      const cacheKey = `recent_invoices_${limit}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const query = `
        SELECT 
          i.invoice_id, 
          i.invoice_number, 
          i.supplier_id, 
          s.supplier_name,
          i.po_id, 
          i.invoice_date, 
          i.due_date, 
          i.status, 
          i.total_amount, 
          i.currency
        FROM 
          invoices i
        JOIN 
          suppliers s ON i.supplier_id = s.supplier_id
        ORDER BY 
          i.invoice_date DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      
      // Safely parse and format values to handle any null or undefined fields
      const invoices = result.rows.map(row => {
        const safeParseInt = (value) => {
          if (value === null || value === undefined) return 0;
          return parseInt(value) || 0;
        };
        
        const safeParseFloat = (value) => {
          if (value === null || value === undefined) return 0;
          return parseFloat(value) || 0;
        };
        
        const safeString = (value) => {
          if (value === null || value === undefined) return '';
          return String(value);
        };
        
        return {
          invoice_id: safeParseInt(row.invoice_id),
          invoice_number: safeString(row.invoice_number),
          supplier_id: safeParseInt(row.supplier_id),
          supplier_name: safeString(row.supplier_name),
          po_id: row.po_id,
          invoice_date: row.invoice_date,
          due_date: row.due_date,
          status: safeString(row.status),
          total_amount: safeParseFloat(row.total_amount),
          currency: safeString(row.currency)
        };
      });

      cache.set(cacheKey, invoices);
      return invoices;
    } catch (error) {
      logger.error('Error in getRecentInvoices:', error);
      throw error;
    }
  },

  // Cache management methods
  clearCache: () => {
    cache.flushAll();
    logger.info('Invoice model cache cleared');
  }
};

export default invoiceModel;
