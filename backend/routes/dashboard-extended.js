import express from 'express';
import supplierModel from '../models/supplierModel.js';

const router = express.Router();

/**
 * @route GET /api/dashboard/supplier-performance
 * @desc Get supplier performance summary
 * @access Public
 */
router.get('/supplier-performance', async (req, res) => {
  try {
    // Since we don't have a real supplier performance table,
    // we'll generate mock data based on the suppliers we have
    const suppliers = await supplierModel.getAllSuppliers();
    
    const performance = suppliers.map(supplier => {
      // Generate random scores between 3.0 and 5.0
      const qualityScore = (3 + Math.random() * 2).toFixed(1);
      const deliveryScore = (3 + Math.random() * 2).toFixed(1);
      const responsivenessScore = (3 + Math.random() * 2).toFixed(1);
      const costScore = (3 + Math.random() * 2).toFixed(1);
      
      // Calculate overall score as average of the four scores
      const overallScore = (
        (parseFloat(qualityScore) + 
         parseFloat(deliveryScore) + 
         parseFloat(responsivenessScore) + 
         parseFloat(costScore)) / 4
      ).toFixed(1);
      
      // Determine performance category based on overall score
      let performanceCategory;
      if (overallScore >= 4.5) {
        performanceCategory = 'Excellent';
      } else if (overallScore >= 4.0) {
        performanceCategory = 'Good';
      } else if (overallScore >= 3.5) {
        performanceCategory = 'Average';
      } else {
        performanceCategory = 'Needs Improvement';
      }
      
      return {
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.supplier_name,
        avg_quality_score: parseFloat(qualityScore),
        avg_delivery_score: parseFloat(deliveryScore),
        avg_responsiveness_score: parseFloat(responsivenessScore),
        avg_cost_score: parseFloat(costScore),
        avg_overall_score: parseFloat(overallScore),
        performance_category: performanceCategory
      };
    });
    
    res.json(performance);
  } catch (err) {
    console.error('Error generating supplier performance:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/purchase-orders/summary
 * @desc Get purchase order status summary
 * @access Public
 */
router.get('/purchase-orders/summary', async (req, res) => {
  try {
    // Get all purchase orders
    const orders = await supplierModel.getPurchaseOrders();
    
    // Create a map to store status counts and values
    const statusMap = {};
    
    // Process each order
    orders.forEach(order => {
      // Determine status based on fulfillment rate
      let status;
      if (order.fulfillmentRate === 100) {
        status = 'complete';
      } else if (order.fulfillmentRate >= 75) {
        status = 'partial';
      } else if (order.fulfillmentRate > 0) {
        status = 'in progress';
      } else {
        status = 'pending';
      }
      
      // Initialize status in map if it doesn't exist
      if (!statusMap[status]) {
        statusMap[status] = {
          status,
          po_count: 0,
          total_value: 0
        };
      }
      
      // Update status counts and values
      statusMap[status].po_count += 1;
      statusMap[status].total_value += order.cost;
    });
    
    // Convert map to array and calculate average values
    const summary = Object.values(statusMap).map(item => ({
      status: item.status,
      po_count: item.po_count,
      total_value: item.total_value,
      avg_po_value: item.total_value / item.po_count
    }));
    
    res.json(summary);
  } catch (err) {
    console.error('Error generating purchase order status summary:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/requisitions
 * @desc Get requisitions
 * @access Public
 */
router.get('/requisitions', async (req, res) => {
  try {
    // Since we don't have a real requisitions table,
    // we'll generate mock data based on the suppliers we have
    const suppliers = await supplierModel.getAllSuppliers();
    
    // Generate 10 mock requisitions
    const requisitions = [];
    const statuses = ['draft', 'pending', 'approved', 'rejected', 'converted'];
    const departments = ['IT', 'Operations', 'Finance', 'Marketing', 'HR'];
    
    for (let i = 1; i <= 10; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      
      // Generate a date within the last 30 days
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - Math.floor(Math.random() * 30));
      
      // Generate a need-by date 7-30 days after request date
      const needByDate = new Date(requestDate);
      needByDate.setDate(needByDate.getDate() + 7 + Math.floor(Math.random() * 23));
      
      // Generate a random amount between 1000 and 10000
      const totalAmount = Math.floor(1000 + Math.random() * 9000);
      
      requisitions.push({
        requisition_id: i,
        requisition_number: `REQ-${2025}-${i.toString().padStart(4, '0')}`,
        requester_id: Math.floor(Math.random() * 100) + 1,
        requester_name: `User ${Math.floor(Math.random() * 100) + 1}`,
        department_id: departments.indexOf(department) + 1,
        department_name: department,
        status,
        request_date: requestDate.toISOString(),
        need_by_date: needByDate.toISOString(),
        total_amount: totalAmount,
        currency: 'USD'
      });
    }
    
    res.json(requisitions);
  } catch (err) {
    console.error('Error generating requisitions:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/invoices
 * @desc Get invoices
 * @access Public
 */
router.get('/invoices', async (req, res) => {
  try {
    // Get purchase orders to base invoices on
    const orders = await supplierModel.getPurchaseOrders();
    
    // Generate invoices based on purchase orders
    const invoices = orders.map((order, index) => {
      // Generate invoice date 1-5 days after order date
      const orderDate = new Date(order.order_date);
      const invoiceDate = new Date(orderDate);
      invoiceDate.setDate(invoiceDate.getDate() + 1 + Math.floor(Math.random() * 5));
      
      // Generate due date 30 days after invoice date
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      
      // Determine if invoice is paid
      const isPaid = Math.random() > 0.3; // 70% chance of being paid
      
      // If paid, set payment date 1-25 days after invoice date
      let paymentDate = null;
      if (isPaid) {
        paymentDate = new Date(invoiceDate);
        paymentDate.setDate(paymentDate.getDate() + 1 + Math.floor(Math.random() * 25));
      }
      
      // Calculate days overdue if not paid and due date has passed
      const today = new Date();
      let daysOverdue = 0;
      if (!isPaid && dueDate < today) {
        daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      }
      
      return {
        invoice_id: index + 1,
        invoice_number: `INV-${2025}-${(index + 1).toString().padStart(4, '0')}`,
        supplier_id: parseInt(order.order_id),
        supplier_name: order.supplier_name,
        po_id: order.id,
        po_number: `PO-${2025}-${order.id ? order.id.toString().padStart(4, '0') : '0000'}`,
        invoice_date: invoiceDate.toISOString(),
        due_date: dueDate.toISOString(),
        status: isPaid ? 'paid' : 'open',
        total_amount: order.cost,
        tax_amount: order.cost * 0.1, // 10% tax
        currency: 'USD',
        payment_terms: 'Net 30',
        matching_status: 'matched',
        match_type: '3-way',
        payment_date: paymentDate ? paymentDate.toISOString() : null,
        days_overdue: daysOverdue
      };
    });
    
    res.json(invoices);
  } catch (err) {
    console.error('Error generating invoices:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/inventory
 * @desc Get inventory items
 * @access Public
 */
router.get('/inventory', async (req, res) => {
  try {
    // Generate mock inventory items
    const categories = ['Raw Materials', 'Office Supplies', 'IT Equipment', 'Maintenance', 'Packaging'];
    const locations = ['Warehouse A', 'Warehouse B', 'Office Storage', 'Production Floor'];
    const statuses = ['OK', 'Watch', 'Reorder', 'Critical'];
    
    const items = [];
    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Generate random quantities
      const maxQuantity = 1000 + Math.floor(Math.random() * 9000);
      const minQuantity = Math.floor(maxQuantity * 0.1);
      const reorderPoint = Math.floor(maxQuantity * 0.3);
      const currentQuantity = Math.floor(Math.random() * maxQuantity);
      
      // Determine status based on current quantity
      let status;
      if (currentQuantity <= minQuantity) {
        status = 'Critical';
      } else if (currentQuantity <= reorderPoint) {
        status = 'Reorder';
      } else if (currentQuantity <= reorderPoint * 1.5) {
        status = 'Watch';
      } else {
        status = 'OK';
      }
      
      // Generate cost per unit between $1 and $100
      const costPerUnit = 1 + Math.random() * 99;
      
      items.push({
        inventory_id: i,
        item_id: i,
        item_name: `Item ${i}`,
        item_code: `ITEM-${i.toString().padStart(4, '0')}`,
        category_name: category,
        location_id: locations.indexOf(location) + 1,
        location_name: location,
        current_quantity: currentQuantity,
        min_quantity: minQuantity,
        max_quantity: maxQuantity,
        reorder_point: reorderPoint,
        abc_classification: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        cost_per_unit: costPerUnit,
        inventory_value: currentQuantity * costPerUnit,
        status
      });
    }
    
    res.json(items);
  } catch (err) {
    console.error('Error generating inventory items:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/inventory/summary
 * @desc Get inventory status summary
 * @access Public
 */
router.get('/inventory/summary', async (req, res) => {
  try {
    // Generate mock inventory status summary
    const statuses = ['OK', 'Watch', 'Reorder', 'Critical'];
    
    // Create a summary for each status
    const summary = statuses.map(status => {
      // Generate random counts and values
      const itemCount = Math.floor(Math.random() * 10) + 1;
      const totalValue = itemCount * (1000 + Math.floor(Math.random() * 9000));
      
      return {
        status,
        item_count: itemCount,
        total_value: totalValue
      };
    });
    
    res.json(summary);
  } catch (err) {
    console.error('Error generating inventory status summary:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/spend/category
 * @desc Get spend by category
 * @access Public
 */
router.get('/spend/category', async (req, res) => {
  try {
    // Generate mock spend by category
    const categories = ['Raw Materials', 'Office Supplies', 'IT Equipment', 'Maintenance', 'Packaging', 'Services', 'Logistics'];
    
    // Generate random spend amounts for each category
    let totalSpend = 0;
    const categorySpend = categories.map(category => {
      const spend = 10000 + Math.floor(Math.random() * 90000);
      totalSpend += spend;
      return {
        category_name: category,
        total_spent: spend
      };
    });
    
    // Calculate percentage for each category
    const result = categorySpend.map(item => ({
      category_name: item.category_name,
      total_spent: item.total_spent,
      percentage: (item.total_spent / totalSpend) * 100
    }));
    
    // Sort by total spent in descending order
    result.sort((a, b) => b.total_spent - a.total_spent);
    
    res.json(result);
  } catch (err) {
    console.error('Error generating spend by category:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/spend/department
 * @desc Get spend by department
 * @access Public
 */
router.get('/spend/department', async (req, res) => {
  try {
    // Generate mock spend by department
    const departments = ['IT', 'Operations', 'Finance', 'Marketing', 'HR', 'R&D', 'Sales'];
    
    // Generate random spend amounts for each department
    let totalSpend = 0;
    const departmentSpend = departments.map(department => {
      const spend = 15000 + Math.floor(Math.random() * 85000);
      totalSpend += spend;
      return {
        department_name: department,
        total_spent: spend
      };
    });
    
    // Calculate percentage for each department
    const result = departmentSpend.map(item => ({
      department_name: item.department_name,
      total_spent: item.total_spent,
      percentage: (item.total_spent / totalSpend) * 100
    }));
    
    // Sort by total spent in descending order
    result.sort((a, b) => b.total_spent - a.total_spent);
    
    res.json(result);
  } catch (err) {
    console.error('Error generating spend by department:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/dashboard/departments
 * @desc Get departments
 * @access Public
 */
router.get('/departments', async (req, res) => {
  try {
    // Generate mock departments
    const departments = ['IT', 'Operations', 'Finance', 'Marketing', 'HR', 'R&D', 'Sales'];
    
    const result = departments.map((department, index) => {
      // Generate random budget between $100,000 and $1,000,000
      const budget = 100000 + Math.floor(Math.random() * 900000);
      
      return {
        department_id: index + 1,
        department_name: department,
        cost_center: `CC-${(index + 1).toString().padStart(3, '0')}`,
        manager_id: Math.floor(Math.random() * 100) + 1,
        budget_amount: budget,
        fiscal_year: 2025
      };
    });
    
    res.json(result);
  } catch (err) {
    console.error('Error generating departments:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
