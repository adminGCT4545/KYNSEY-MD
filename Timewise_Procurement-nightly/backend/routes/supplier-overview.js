import express from 'express';
import supplierManagementModel from '../models/supplierManagementModel.js';

const router = express.Router();

/**
 * @route GET /api/supplier-management/dashboard/overview
 * @desc Get supplier overview dashboard data
 * @access Public
 */
router.get('/dashboard/overview', async (req, res) => {
  try {
    // Get all required data in parallel
    const [
      performanceSummary,
      expiringContracts,
      expiringCertifications,
      highRiskSuppliers,
      contractStats
    ] = await Promise.all([
      supplierManagementModel.getSupplierPerformanceSummary(),
      supplierManagementModel.getSuppliersWithExpiringContracts(),
      supplierManagementModel.getSuppliersWithExpiringCertifications(),
      supplierManagementModel.getHighRiskSuppliers(),
      supplierManagementModel.getSupplierContractStats()
    ]);

    res.json({
      performance: performanceSummary,
      contracts: {
        expiring: expiringContracts,
        stats: contractStats
      },
      certifications: {
        expiring: expiringCertifications
      },
      risk: {
        highRiskSuppliers
      }
    });
  } catch (err) {
    console.error('Error fetching supplier overview:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/dashboard/contracts
 * @desc Get contract status overview
 * @access Public
 */
router.get('/dashboard/contracts', async (req, res) => {
  try {
    const { days } = req.query;
    const daysThreshold = days ? parseInt(days) : 90;
    const expiringContracts = await supplierManagementModel.getSuppliersWithExpiringContracts(daysThreshold);
    const contractStats = await supplierManagementModel.getSupplierContractStats();
    
    res.json({
      expiring: expiringContracts,
      stats: contractStats
    });
  } catch (err) {
    console.error('Error fetching contract status:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/dashboard/risk
 * @desc Get risk overview
 * @access Public
 */
router.get('/dashboard/risk', async (req, res) => {
  try {
    const [highRiskSuppliers, expiringCertifications] = await Promise.all([
      supplierManagementModel.getHighRiskSuppliers(),
      supplierManagementModel.getSuppliersWithExpiringCertifications()
    ]);
    
    res.json({
      highRiskSuppliers,
      expiringCertifications
    });
  } catch (err) {
    console.error('Error fetching risk overview:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/supplier-management/dashboard/performance
 * @desc Get performance overview
 * @access Public
 */
router.get('/dashboard/performance', async (req, res) => {
  try {
    const performanceSummary = await supplierManagementModel.getSupplierPerformanceSummary();
    
    // Calculate averages
    const summary = performanceSummary.reduce((acc, curr) => {
      acc.totalQuality += curr.quality_score || 0;
      acc.totalDelivery += curr.delivery_score || 0;
      acc.totalResponsiveness += curr.responsiveness_score || 0;
      acc.totalCost += curr.cost_score || 0;
      acc.totalOverall += curr.overall_score || 0;
      acc.count++;
      return acc;
    }, {
      totalQuality: 0,
      totalDelivery: 0,
      totalResponsiveness: 0,
      totalCost: 0,
      totalOverall: 0,
      count: 0
    });

    res.json({
      averages: {
        quality: summary.count ? (summary.totalQuality / summary.count).toFixed(1) : 0,
        delivery: summary.count ? (summary.totalDelivery / summary.count).toFixed(1) : 0,
        responsiveness: summary.count ? (summary.totalResponsiveness / summary.count).toFixed(1) : 0,
        cost: summary.count ? (summary.totalCost / summary.count).toFixed(1) : 0,
        overall: summary.count ? (summary.totalOverall / summary.count).toFixed(1) : 0
      },
      suppliers: performanceSummary
    });
  } catch (err) {
    console.error('Error fetching performance overview:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
