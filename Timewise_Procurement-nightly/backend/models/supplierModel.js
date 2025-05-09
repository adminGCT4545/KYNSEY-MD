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

// Optimize PostgreSQL connection pool
const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'your_postgres_username',
  password: process.env.PGPASSWORD || 'your_postgres_password',
  database: process.env.PGDATABASE || 'timewise_procument',
  port: parseInt(process.env.PGPORT || '5432'),
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 30000, // 30 seconds
});

// Initialize prepared statements
const initPreparedStatements = async () => {
  const client = await pool.connect();
  try {
    // Using direct queries instead of prepared statements for better compatibility
    logger.info('Using direct queries instead of prepared statements');
  } catch (error) {
    logger.error('Error initializing database connection:', error);
  } finally {
    client.release();
  }
};

initPreparedStatements();

// Calculate actual delivery time based on scheduled time and delay
const calculateActualDelivery = (scheduledDelivery, delayDays) => {
  const scheduled = new Date(`2000-01-01T${scheduledDelivery}`);
  scheduled.setDate(scheduled.getDate() + delayDays);
  return scheduled.toTimeString().substring(0, 8);
};

// Supplier model with optimized database operations
const supplierModel = {
  /**
   * Create a new purchase order with transaction management
   */
  createPurchaseOrder: async (purchaseOrderData) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const poQuery = `
        INSERT INTO purchase_orders (
          po_number, supplier_id, department_id, order_date, 
          delivery_date, status, payment_terms, shipping_terms,
          total_amount, tax_amount, shipping_amount, currency,
          is_blanket_po, blanket_end_date
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING po_id
      `;
      
      const poResult = await client.query(poQuery, [
        purchaseOrderData.po_number,
        purchaseOrderData.supplier_id,
        purchaseOrderData.department_id,
        purchaseOrderData.order_date,
        purchaseOrderData.delivery_date,
        purchaseOrderData.status,
        purchaseOrderData.payment_terms,
        purchaseOrderData.shipping_terms,
        purchaseOrderData.total_amount,
        purchaseOrderData.tax_amount,
        purchaseOrderData.shipping_amount,
        purchaseOrderData.currency,
        purchaseOrderData.is_blanket_po,
        purchaseOrderData.blanket_end_date
      ]);
      
      const poId = poResult.rows[0].po_id;

      if (purchaseOrderData.items?.length > 0) {
        const itemQuery = `
          INSERT INTO purchase_order_items (
            po_id, item_name, quantity, unit_price,
            total_price, tax_amount, delivery_date, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        await Promise.all(purchaseOrderData.items.map(item =>
          client.query(itemQuery, [
            poId,
            item.item_name,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.tax_amount,
            item.delivery_date,
            item.status
          ])
        ));
      }
      
      await client.query('COMMIT');
      cache.del('procurement_schedules'); // Invalidate cache
      
      return { po_id: poId, ...purchaseOrderData };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error in createPurchaseOrder:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get all procurement schedules with caching
   */
  getProcurementSchedules: async () => {
    try {
      const cacheKey = 'procurement_schedules';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const query = `
        SELECT 
          ps.supplier_id, s.supplier_name, ps.scheduled_delivery,
          ps.default_delay_days, COUNT(po.po_id) as total_orders,
          SUM(CASE WHEN po.status = 'delayed' THEN 1 ELSE 0 END) as delayed_orders,
          100 as avg_fulfillment_rate
        FROM procurement_schedules ps
        JOIN suppliers s ON ps.supplier_id = s.supplier_id
        LEFT JOIN purchase_orders po ON ps.supplier_id = po.supplier_id
        GROUP BY ps.supplier_id, s.supplier_name, ps.scheduled_delivery, ps.default_delay_days
        ORDER BY ps.supplier_id
      `;
      
      const result = await pool.query(query);
      const schedules = result.rows.map(row => ({
        supplier_id: row.supplier_id,
        supplier_name: row.supplier_name,
        scheduled_delivery: row.scheduled_delivery.substring(0, 8),
        default_delay_days: row.default_delay_days,
        total_orders: parseInt(row.total_orders),
        delayed_orders: parseInt(row.delayed_orders),
        avg_fulfillment_rate: parseFloat(row.avg_fulfillment_rate) || 0,
        on_time_rate: row.total_orders > 0 
          ? ((row.total_orders - row.delayed_orders) / row.total_orders) * 100 
          : 100
      }));

      cache.set(cacheKey, schedules);
      return schedules;
    } catch (error) {
      logger.error('Error in getProcurementSchedules:', error);
      throw error;
    }
  },

  /**
   * Get all suppliers with caching
   */
  getAllSuppliers: async () => {
    try {
      const cacheKey = 'all_suppliers';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const result = await pool.query('SELECT * FROM suppliers ORDER BY supplier_id');
      cache.set(cacheKey, result.rows);
      return result.rows;
    } catch (error) {
      logger.error('Error in getAllSuppliers:', error);
      throw error;
    }
  },

  /**
   * Get purchase orders with filtering and caching
   */
  getPurchaseOrders: async (year, supplierId, limit = 100) => {
    try {
      const cacheKey = `purchase_orders_${year || 'all'}_${supplierId || 'all'}_${limit}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

        const query = `
        SELECT 
          p.po_id, p.po_number, p.requisition_id, p.supplier_id, 
          s.supplier_name, p.department_id, d.department_name,
          p.order_date, p.delivery_date, p.status, 
          p.payment_terms, p.shipping_terms,
          p.total_amount, p.tax_amount, p.shipping_amount, p.currency,
          p.is_blanket_po, p.blanket_end_date,
          ps.scheduled_delivery,
          CASE WHEN p.status = 'delayed' THEN true ELSE false END as is_delayed,
          CASE WHEN p.status = 'delayed' THEN ps.default_delay_days ELSE 0 END as delay_days
        FROM purchase_orders p
        JOIN suppliers s ON p.supplier_id = s.supplier_id
        JOIN departments d ON p.department_id = d.department_id
        LEFT JOIN procurement_schedules ps ON p.supplier_id = ps.supplier_id
        WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM p.order_date) = $1)
        AND ($2::int IS NULL OR p.supplier_id = $2)
        ORDER BY p.order_date DESC
        LIMIT $3
      `;
      
      const result = await pool.query(query, [year || null, supplierId || null, limit]);

      const orders = result.rows.map(row => {
        const scheduledDelivery = row.scheduled_delivery ? row.scheduled_delivery.substring(0, 8) : '00:00:00';
        const actualDelivery = calculateActualDelivery(scheduledDelivery, row.delay_days || 0);
        const date = new Date(row.order_date);
        
        return {
          po_id: row.po_id,
          po_number: row.po_number,
          requisition_id: row.requisition_id,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier_name,
          department_id: row.department_id,
          department_name: row.department_name,
          order_date: row.order_date,
          delivery_date: row.delivery_date,
          status: row.status,
          payment_terms: row.payment_terms,
          shipping_terms: row.shipping_terms,
          total_amount: parseFloat(row.total_amount),
          tax_amount: parseFloat(row.tax_amount),
          shipping_amount: parseFloat(row.shipping_amount),
          currency: row.currency,
          is_blanket_po: row.is_blanket_po,
          blanket_end_date: row.blanket_end_date
        };
      });

      cache.set(cacheKey, orders, 300); // Cache for 5 minutes
      return orders;
    } catch (error) {
      logger.error('Error in getPurchaseOrders:', error);
      throw error;
    }
  },

  /**
   * Get upcoming deliveries with caching
   */
  getUpcomingDeliveries: async (count = 5) => {
    try {
      const cacheKey = `upcoming_deliveries_${count}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const query = `
        SELECT DISTINCT ON (p.supplier_id, p.supplier_location, p.delivery_location)
          p.supplier_id, s.supplier_name, p.supplier_location,
          p.delivery_location, ps.scheduled_delivery, p.is_delayed,
          CASE WHEN p.is_delayed THEN ps.default_delay_days ELSE 0 END as delay_days,
          p.order_date
        FROM purchase_orders p
        JOIN suppliers s ON p.supplier_id = s.supplier_id
        JOIN procurement_schedules ps ON p.supplier_id = ps.supplier_id
        ORDER BY p.supplier_id, p.supplier_location, p.delivery_location, p.order_date
        LIMIT $1
      `;
      
      const result = await pool.query(query, [count]);
      const deliveries = result.rows.map(row => ({
        supplier_id: row.supplier_id,
        supplier_name: row.supplier_name,
        supplier_location: row.supplier_location || 'Unknown',
        delivery_location: row.delivery_location || 'Unknown',
        scheduled_delivery: row.scheduled_delivery ? row.scheduled_delivery.substring(0, 8) : '00:00:00',
        actual_delivery: calculateActualDelivery(
          row.scheduled_delivery ? row.scheduled_delivery.substring(0, 8) : '00:00:00', 
          row.delay_days || 0
        ),
        delay_days: row.delay_days || 0,
        order_date: row.order_date
      }));

      cache.set(cacheKey, deliveries, 60); // Cache for 1 minute
      return deliveries;
    } catch (error) {
      logger.error('Error in getUpcomingDeliveries:', error);
      throw error;
    }
  },

  /**
   * Get dashboard statistics with caching
   */
  getDashboardStats: async () => {
    try {
      const cacheKey = 'dashboard_stats';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const [overallStats, supplierStats, locationStats, priorityStats] = await Promise.all([
        pool.query(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(cost) as total_cost,
            AVG((fulfilled_items::float / total_items) * 100) as avg_fulfillment_rate,
            COUNT(CASE WHEN is_delayed THEN 1 END) as delayed_orders
          FROM purchase_orders
        `),
        pool.query(`
          SELECT 
            p.supplier_id, s.supplier_name, COUNT(*) as order_count,
            SUM(p.cost) as total_cost,
            AVG((p.fulfilled_items::float / p.total_items) * 100) as avg_fulfillment_rate,
            COUNT(CASE WHEN p.is_delayed THEN 1 END) as delayed_orders,
            EXTRACT(YEAR FROM p.order_date) as year,
            EXTRACT(MONTH FROM p.order_date) as month
          FROM purchase_orders p
          JOIN suppliers s ON p.supplier_id = s.supplier_id
          GROUP BY p.supplier_id, s.supplier_name, year, month
          ORDER BY p.supplier_id, year, month
        `),
        pool.query(`
          SELECT 
            supplier_location || '-' || delivery_location as route,
            COUNT(*) as order_count,
            SUM(cost) as total_cost,
            AVG((fulfilled_items::float / total_items) * 100) as avg_fulfillment_rate,
            COUNT(CASE WHEN is_delayed THEN 1 END) as delayed_orders
          FROM purchase_orders
          GROUP BY route
          ORDER BY order_count DESC
        `),
        pool.query(`
          SELECT 
            priority,
            COUNT(*) as order_count,
            SUM(cost) as total_cost,
            AVG((fulfilled_items::float / total_items) * 100) as avg_fulfillment_rate
          FROM purchase_orders
          GROUP BY priority
          ORDER BY total_cost DESC
        `)
      ]);

      const stats = {
        overall: {
          totalOrders: parseInt(overallStats.rows[0].total_orders),
          totalCost: parseFloat(overallStats.rows[0].total_cost),
          avgFulfillmentRate: parseFloat(overallStats.rows[0].avg_fulfillment_rate),
          delayedOrders: parseInt(overallStats.rows[0].delayed_orders),
          onTimePerformance: (1 - (overallStats.rows[0].delayed_orders / overallStats.rows[0].total_orders)) * 100
        },
        supplierStats: supplierStats.rows.map(row => ({
          supplierId: row.supplier_id,
          supplierName: row.supplier_name,
          orderCount: parseInt(row.order_count),
          totalCost: parseFloat(row.total_cost),
          avgFulfillmentRate: parseFloat(row.avg_fulfillment_rate),
          delayedOrders: parseInt(row.delayed_orders),
          year: parseInt(row.year),
          month: parseInt(row.month)
        })),
        locationStats: locationStats.rows.map(row => ({
          route: row.route,
          orderCount: parseInt(row.order_count),
          totalCost: parseFloat(row.total_cost),
          avgFulfillmentRate: parseFloat(row.avg_fulfillment_rate),
          delayedOrders: parseInt(row.delayed_orders)
        })),
        priorityStats: priorityStats.rows.map(row => ({
          priority: row.priority,
          orderCount: parseInt(row.order_count),
          totalCost: parseFloat(row.total_cost),
          avgFulfillmentRate: parseFloat(row.avg_fulfillment_rate)
        }))
      };

      cache.set(cacheKey, stats, 300); // Cache for 5 minutes
      return stats;
    } catch (error) {
      logger.error('Error in getDashboardStats:', error);
      throw error;
    }
  },

  /**
   * Get available years with caching
   */
  getAvailableYears: async () => {
    try {
      const cacheKey = 'available_years';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const query = `
        SELECT DISTINCT EXTRACT(YEAR FROM order_date) as year
        FROM purchase_orders
        ORDER BY year
      `;
      
      const result = await pool.query(query);
      const years = result.rows.map(row => parseInt(row.year));
      
      cache.set(cacheKey, years, 3600); // Cache for 1 hour
      return years;
    } catch (error) {
      logger.error('Error in getAvailableYears:', error);
      throw error;
    }
  },

  // Cache management methods
  clearCache: () => {
    cache.flushAll();
    logger.info('Supplier model cache cleared');
  }
};

// Error handling for the connection pool
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default supplierModel;
