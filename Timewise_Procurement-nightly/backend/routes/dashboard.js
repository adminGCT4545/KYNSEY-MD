import express from 'express';
import supplierModel from '../models/supplierModel.js';

const router = express.Router();

/**
 * @route GET /api/dashboard/test
 * @desc Test dashboard route
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard API is working' });
});

/**
 * @route GET /api/dashboard/suppliers
 * @desc Get all suppliers
 * @access Public
 */
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await supplierModel.getAllSuppliers();
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/purchase-orders
 * @desc Get all purchase orders with optional filtering
 * @access Public
 */
router.get('/purchase-orders', async (req, res) => {
  try {
    const { year, supplierId, limit } = req.query;
    const orders = await supplierModel.getPurchaseOrders(year, supplierId, limit);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/dashboard/purchase-orders
 * @desc Create a new purchase order
 * @access Public
 */
router.post('/purchase-orders', async (req, res) => {
  try {
    const purchaseOrderData = req.body;
    const result = await supplierModel.createPurchaseOrder(purchaseOrderData);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating purchase order:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/upcoming
 * @desc Get upcoming deliveries
 * @access Public
 */
router.get('/upcoming', async (req, res) => {
  try {
    const count = req.query.count || 5;
    const deliveries = await supplierModel.getUpcomingDeliveries(count);
    res.json(deliveries);
  } catch (err) {
    console.error('Error fetching upcoming deliveries:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await supplierModel.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/years
 * @desc Get available years in the data
 * @access Public
 */
router.get('/years', async (req, res) => {
  try {
    const years = await supplierModel.getAvailableYears();
    res.json(years);
  } catch (err) {
    console.error('Error fetching available years:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/departments
 * @desc Get all departments
 * @access Public
 */
router.get('/departments', async (req, res) => {
  try {
    // For now, return some mock departments
    const departments = [
      {
        department_id: 1,
        department_name: 'Procurement',
        cost_center: 'CC001',
        manager_id: 1,
        budget_amount: 100000,
        fiscal_year: 2025
      },
      {
        department_id: 2,
        department_name: 'IT',
        cost_center: 'CC002',
        manager_id: 2,
        budget_amount: 150000,
        fiscal_year: 2025
      },
      {
        department_id: 3,
        department_name: 'HR',
        cost_center: 'CC003',
        manager_id: 3,
        budget_amount: 75000,
        fiscal_year: 2025
      }
    ];
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/procurement-schedules
 * @desc Get all procurement schedules
 * @access Public
 */
router.get('/procurement-schedules', async (req, res) => {
  try {
    const schedules = await supplierModel.getProcurementSchedules();
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching procurement schedules:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
