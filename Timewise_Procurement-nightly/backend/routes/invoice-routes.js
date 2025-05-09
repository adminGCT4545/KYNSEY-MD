import express from 'express';
import invoiceModel from '../models/invoiceModel.js';

const router = express.Router();

/**
 * @route GET /api/dashboard/invoices
 * @desc Get all invoices with optional status filter
 * @access Public
 */
router.get('/invoices', async (req, res) => {
  try {
    const { status, limit } = req.query;
    console.log('GET /invoices - Status:', status, 'Limit:', limit);
    const invoices = await invoiceModel.getAllInvoices(status, limit ? parseInt(limit) : 100);
    console.log(`Successfully retrieved ${invoices.length} invoices`);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/invoices/recent
 * @desc Get recent invoices
 * @access Public
 */
router.get('/invoices/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const invoices = await invoiceModel.getRecentInvoices(limit ? parseInt(limit) : 5);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching recent invoices:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/invoices/aging
 * @desc Get invoice aging summary
 * @access Public
 */
router.get('/invoices/aging', async (req, res) => {
  try {
    console.log('GET /invoices/aging');
    const agingSummary = await invoiceModel.getInvoiceAgingSummary();
    console.log('Successfully retrieved invoice aging summary');
    res.json(agingSummary);
  } catch (err) {
    console.error('Error fetching invoice aging summary:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/invoices/payment-summary
 * @desc Get payment summary statistics
 * @access Public
 */
router.get('/invoices/payment-summary', async (req, res) => {
  try {
    console.log('GET /invoices/payment-summary');
    const paymentSummary = await invoiceModel.getPaymentSummary();
    console.log('Successfully retrieved payment summary');
    res.json(paymentSummary);
  } catch (err) {
    console.error('Error fetching payment summary:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

export default router;
