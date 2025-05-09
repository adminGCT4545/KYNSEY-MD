import React, { createContext, useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { 
  getSuppliers,
  getSupplierPerformance,
  getPurchaseOrders,
  getPurchaseOrderStatusSummary,
  getRequisitions,
  getInvoices,
  getRecentInvoices,
  getInvoiceAgingData,
  getPaymentSummary,
  getInventoryItems,
  getInventoryStatusSummary,
  getSpendByCategory,
  getSpendByDepartment,
  getDepartments,
  addSupplierUpdateListener,
  addPurchaseOrderUpdateListener,
  addInventoryUpdateListener,
  addRequisitionUpdateListener,
  addInvoiceUpdateListener,
  removeSupplierUpdateListener,
  removePurchaseOrderUpdateListener,
  removeInventoryUpdateListener,
  removeRequisitionUpdateListener,
  removeInvoiceUpdateListener,
  type Supplier,
  type SupplierPerformanceSummary,
  type PurchaseOrder,
  type PurchaseOrderStatusSummary,
  type Requisition,
  type Invoice,
  type InventoryItem,
  type InventoryStatusSummary,
  type SpendByCategory,
  type SpendByDepartment,
  type Department
} from '../services/dataService';
import ChatInterface, { ChatProvider } from './ChatInterface';

interface DashboardContextType {
  selectedSupplier?: string;
  selectedDepartment?: string;
  currentMetrics?: {
    totalSpend?: number;
    pendingRequisitions?: number;
    openPurchaseOrders?: number;
    inventoryValue?: number;
  };
}

export const DashboardContext = createContext<DashboardContextType>({});

const Dashboard: React.FC = () => {
  // State for data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformanceSummary[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poStatusSummary, setPoStatusSummary] = useState<PurchaseOrderStatusSummary[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryStatusSummary, setInventoryStatusSummary] = useState<InventoryStatusSummary[]>([]);
  const [spendByCategory, setSpendByCategory] = useState<SpendByCategory[]>([]);
  const [spendByDepartment, setSpendByDepartment] = useState<SpendByDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [invoiceAgingData, setInvoiceAgingData] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>({
    totalInvoices: 0,
    unpaidInvoices: 0,
    overdueAmount: 0,
    overdueInvoices: 0,
    currency: 'USD'
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('month');
  const [selectedMetric, setSelectedMetric] = useState<string>('spend');

  // Colors for the charts
  const COLORS = ['#7e57c2', '#4e7fff', '#b39ddb', '#64b5f6', '#9575cd', '#5c6bc0', '#7986cb', '#4fc3f7'];
  const STATUS_COLORS: Record<string, string> = {
    'draft': '#9e9e9e',
    'pending': '#ffb74d',
    'approved': '#4fc3f7',
    'rejected': '#ef5350',
    'sent': '#4db6ac',
    'acknowledged': '#7986cb',
    'partial': '#ba68c8',
    'complete': '#81c784',
    'cancelled': '#e57373',
    'Critical': '#f44336',
    'Reorder': '#ff9800',
    'Watch': '#ffeb3b',
    'OK': '#4caf50'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
        
        const supplierPerformanceData = await getSupplierPerformance();
        setSupplierPerformance(supplierPerformanceData);
        
        const purchaseOrdersData = await getPurchaseOrders();
        setPurchaseOrders(purchaseOrdersData);
        
        const poStatusSummaryData = await getPurchaseOrderStatusSummary();
        setPoStatusSummary(poStatusSummaryData);
        
        const requisitionsData = await getRequisitions();
        setRequisitions(requisitionsData);
        
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
        
        const invoiceAgingData = await getInvoiceAgingData();
        setInvoiceAgingData(invoiceAgingData);
        
        const paymentSummaryData = await getPaymentSummary();
        setPaymentSummary(paymentSummaryData);
        
        const inventoryItemsData = await getInventoryItems();
        setInventoryItems(inventoryItemsData);
        
        const inventoryStatusSummaryData = await getInventoryStatusSummary();
        setInventoryStatusSummary(inventoryStatusSummaryData);
        
        const spendByCategoryData = await getSpendByCategory();
        setSpendByCategory(spendByCategoryData);
        
        const spendByDepartmentData = await getSpendByDepartment();
        setSpendByDepartment(spendByDepartmentData);
        
        const departmentsData = await getDepartments();
        setDepartments(departmentsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up live update listeners
    const handleSupplierUpdate = async (supplierData: any) => {
      console.log('Supplier update received:', supplierData);
      
      // Reload data to get the latest state
      try {
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
        
        const supplierPerformanceData = await getSupplierPerformance();
        setSupplierPerformance(supplierPerformanceData);
      } catch (error) {
        console.error('Error updating data after supplier change:', error);
      }
    };
    
    const handlePurchaseOrderUpdate = async (poData: any) => {
      console.log('Purchase order update received:', poData);
      
      // Reload data to get the latest state
      try {
        const purchaseOrdersData = await getPurchaseOrders();
        setPurchaseOrders(purchaseOrdersData);
        
        const poStatusSummaryData = await getPurchaseOrderStatusSummary();
        setPoStatusSummary(poStatusSummaryData);
      } catch (error) {
        console.error('Error updating data after purchase order change:', error);
      }
    };
    
    const handleInventoryUpdate = async (inventoryData: any) => {
      console.log('Inventory update received:', inventoryData);
      
      // Reload data to get the latest state
      try {
        const inventoryItemsData = await getInventoryItems();
        setInventoryItems(inventoryItemsData);
        
        const inventoryStatusSummaryData = await getInventoryStatusSummary();
        setInventoryStatusSummary(inventoryStatusSummaryData);
      } catch (error) {
        console.error('Error updating data after inventory change:', error);
      }
    };
    
    const handleRequisitionUpdate = async (requisitionData: any) => {
      console.log('Requisition update received:', requisitionData);
      
      // Reload data to get the latest state
      try {
        const requisitionsData = await getRequisitions();
        setRequisitions(requisitionsData);
      } catch (error) {
        console.error('Error updating data after requisition change:', error);
      }
    };
    
    const handleInvoiceUpdate = async (invoiceData: any) => {
      console.log('Invoice update received:', invoiceData);
      
      // Reload data to get the latest state
      try {
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error updating data after invoice change:', error);
      }
    };
    
    // Add listeners
    addSupplierUpdateListener(handleSupplierUpdate);
    addPurchaseOrderUpdateListener(handlePurchaseOrderUpdate);
    addInventoryUpdateListener(handleInventoryUpdate);
    addRequisitionUpdateListener(handleRequisitionUpdate);
    addInvoiceUpdateListener(handleInvoiceUpdate);
    
    // Clean up listeners on unmount
    return () => {
      removeSupplierUpdateListener(handleSupplierUpdate);
      removePurchaseOrderUpdateListener(handlePurchaseOrderUpdate);
      removeInventoryUpdateListener(handleInventoryUpdate);
      removeRequisitionUpdateListener(handleRequisitionUpdate);
      removeInvoiceUpdateListener(handleInvoiceUpdate);
    };
  }, []);
  
  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    // Total spend
    const totalSpend = purchaseOrders.length > 0 
      ? purchaseOrders
          .filter((po: PurchaseOrder) => po.status !== 'cancelled' && po.status !== 'draft')
          .reduce((sum: number, po: PurchaseOrder) => sum + po.total_amount, 0)
      : 0;
    
    // Pending requisitions
    const pendingRequisitions = requisitions.length > 0
      ? requisitions
          .filter((req: Requisition) => req.status === 'pending')
          .length
      : 0;
    
    // Open purchase orders
    const openPurchaseOrders = purchaseOrders.length > 0
      ? purchaseOrders
          .filter((po: PurchaseOrder) => po.status !== 'complete' && po.status !== 'cancelled')
          .length
      : 0;
    
    // Inventory value
    const inventoryValue = inventoryItems.length > 0
      ? inventoryItems
          .reduce((sum: number, item: InventoryItem) => sum + item.inventory_value, 0)
      : 0;
    
    return {
      totalSpend,
      pendingRequisitions,
      openPurchaseOrders,
      inventoryValue
    };
  };
  
  // Filter data based on selected filters (department, date range, metric)
  const filterDataByDateRange = (data: any[], dateField: string) => {
    if (!data || data.length === 0) return [];
    
    const today = new Date();
    let startDate = new Date();
    
    switch (selectedDateRange) {
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
      default:
        return data; // No date filtering for 'all'
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= today;
    });
  };
  
  // Get section visibility based on selected metric
  const shouldShowSection = (section: string): boolean => {
    switch (selectedMetric) {
      case 'spend':
        return ['spend', 'purchase_orders', 'invoices'].includes(section);
      case 'suppliers':
        return ['suppliers', 'performance'].includes(section);
      case 'inventory':
        return ['inventory'].includes(section);
      default:
        return true;
    }
  };
  
  // Apply all filters to purchase orders 
  const filteredPurchaseOrders = purchaseOrders
    .filter((po: PurchaseOrder) => selectedDepartment === 'all' || po.department_name === selectedDepartment)
    .filter((po: PurchaseOrder) => filterDataByDateRange([po], 'order_date').length > 0);
  
  // Apply all filters to requisitions
  const filteredRequisitions = requisitions
    .filter((req: Requisition) => selectedDepartment === 'all' || req.department_name === selectedDepartment)
    .filter((req: Requisition) => filterDataByDateRange([req], 'request_date').length > 0);
  
  // Apply filters to invoices
  const filteredInvoices = invoices
    .filter((inv: Invoice) => filterDataByDateRange([inv], 'invoice_date').length > 0);
  
  // Apply filters to inventory items based on selected metric
  const filteredInventoryItems = inventoryItems
    .filter((item: InventoryItem) => filterDataByDateRange([item], 'created_at').length > 0);
  
  // Apply filters to suppliers
  const filteredSuppliers = suppliers;
  
  // Prepare data for charts
  const preparePoStatusData = () => {
    // Instead of using the summary data, calculate from filtered purchase orders
    const statusCounts: Record<string, { count: number, value: number }> = {};
    
    filteredPurchaseOrders.forEach((po: PurchaseOrder) => {
      if (!statusCounts[po.status]) {
        statusCounts[po.status] = { count: 0, value: 0 };
      }
      statusCounts[po.status].count += 1;
      statusCounts[po.status].value += po.total_amount;
    });
    
    return Object.entries(statusCounts).map(([status, data]) => ({
      status,
      count: data.count,
      value: data.value
    }));
  };
  
const prepareSpendByCategoryData = () => {
    // Map the data to ensure property names match what the chart expects
    return spendByCategory.slice(0, 5).map(category => ({
      name: category.category_name,
      total_spend: category.total_spent,
      percent: category.percentage
    }));
  };
  
  const prepareSpendByDepartmentData = () => {
    // Map the data to ensure property names match what the chart expects
    return spendByDepartment.map(department => ({
      department_name: department.department_name,
      total_spend: department.total_spent,
      percent: department.percentage
    }));
  };
  
  const prepareSupplierPerformanceData = () => {
    return supplierPerformance.slice(0, 10).map((supplier: SupplierPerformanceSummary) => ({
      name: supplier.supplier_name,
      quality: supplier.avg_quality_score,
      delivery: supplier.avg_delivery_score,
      responsiveness: supplier.avg_responsiveness_score,
      cost: supplier.avg_cost_score,
      overall: supplier.avg_overall_score
    }));
  };
  
  const prepareInventoryStatusData = () => {
    return inventoryStatusSummary.map((status: InventoryStatusSummary) => ({
      status: status.status,
      count: status.item_count,
      value: status.total_value
    }));
  };
  
  const prepareRequisitionStatusData = () => {
    const statusCounts: Record<string, number> = {
      'draft': 0,
      'pending': 0,
      'approved': 0,
      'rejected': 0,
      'converted': 0
    };
    
    filteredRequisitions.forEach((req: Requisition) => {
      if (statusCounts[req.status] !== undefined) {
        statusCounts[req.status]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  };
  
  const prepareInvoiceAgingData = () => {
    // Use the data from the API endpoint
    return invoiceAgingData;
  };
  
  if (isLoading) {
    return <div className="text-center p-10 text-dashboard-text">Loading data...</div>;
  }
  
  // Check if data is empty (PostgreSQL not linked yet)
  const isDataEmpty = 
    suppliers.length === 0 && 
    purchaseOrders.length === 0 && 
    requisitions.length === 0 && 
    invoices.length === 0 && 
    inventoryItems.length === 0;
  
  if (isDataEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dashboard-dark">
        <div className="text-center p-10 max-w-2xl">
          <h1 className="text-2xl font-medium text-dashboard-header mb-4">PostgreSQL Connection Required</h1>
          <p className="text-dashboard-text mb-6">
            The Procurement Dashboard requires a connection to PostgreSQL to display data. 
            All sections will remain blank until the PostgreSQL directory is linked.
          </p>
          <div className="bg-dashboard-panel p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-dashboard-header mb-3">Setup Instructions:</h2>
            <ol className="text-dashboard-text list-decimal list-inside space-y-2 text-left">
              <li>Ensure PostgreSQL is installed and running on your system</li>
              <li>Configure your database connection in the .env file</li>
              <li>Run the setup scripts to create the database schema</li>
              <li>Link the PostgreSQL directory to enable data access</li>
              <li>Restart the application to load the data</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate summary metrics
  const summaryMetrics = calculateSummaryMetrics();
  
  // Prepare dashboard context value
  const dashboardContextValue = {
    selectedDepartment,
    currentMetrics: summaryMetrics
  };

  return (
    <DashboardContext.Provider value={dashboardContextValue}>
      <ChatProvider>
        <div className="p-4">
          <div className="mb-4 px-2 flex justify-between items-center">
            <h1 className="text-xl font-medium text-dashboard-header">Procurement ERP Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="metricSelect" className="text-dashboard-subtext mr-2 text-sm">Metric:</label>
                <select 
                  id="metricSelect"
                  className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
                  value={selectedMetric}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMetric(e.target.value)}
                >
                  <option value="spend">Spend</option>
                  <option value="suppliers">Suppliers</option>
                  <option value="inventory">Inventory</option>
                </select>
              </div>
              <div>
                <label htmlFor="departmentSelect" className="text-dashboard-subtext mr-2 text-sm">Department:</label>
                <select 
                  id="departmentSelect"
                  className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
                  value={selectedDepartment}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept: Department) => (
                    <option key={dept.department_id} value={dept.department_name}>{dept.department_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dateRangeSelect" className="text-dashboard-subtext mr-2 text-sm">Period:</label>
                <select 
                  id="dateRangeSelect"
                  className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
                  value={selectedDateRange}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDateRange(e.target.value)}
                >
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Requisition & Approval Panel */}
            <div className={`bg-dashboard-panel rounded shadow p-4 ${!shouldShowSection('purchase_orders') ? 'opacity-50' : ''}`}>
              <h2 className="text-dashboard-header text-lg mb-4">Requisitions & Approvals</h2>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Requisition Status</h3>
                {prepareRequisitionStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={prepareRequisitionStatusData()}>
                      <XAxis dataKey="status" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                      <Bar dataKey="count" name="Count">
                        {prepareRequisitionStatusData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[180px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Pending Approvals</h3>
                <div className="bg-dashboard-dark rounded p-2">
                  <table className="w-full text-dashboard-text text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Requisition</th>
                        <th className="text-left py-2">Requester</th>
                        <th className="text-right py-2">Amount</th>
                        <th className="text-right py-2">Age</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequisitions
                        .filter((req: Requisition) => req.status === 'pending')
                        .slice(0, 5)
                        .map((req: Requisition) => {
                          const requestDate = new Date(req.request_date);
                          const today = new Date();
                          const diffTime = today.getTime() - requestDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          return (
                            <tr key={req.requisition_id}>
                              <td className="py-2">{req.requisition_number}</td>
                              <td className="py-2">{req.requester_name}</td>
                              <td className="py-2 text-right">{req.total_amount?.toLocaleString() || "0"} {req.currency}</td>
                              <td className={`py-2 text-right ${diffDays > 7 ? 'text-yellow-400' : diffDays > 14 ? 'text-red-400' : ''}`}>
                                {diffDays} days
                              </td>
                            </tr>
                          );
                        })}
                      {filteredRequisitions.filter((req: Requisition) => req.status === 'pending').length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-dashboard-subtext">No pending approvals</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Recent Approvals</h3>
                <div className="bg-dashboard-dark rounded p-2">
                  <table className="w-full text-dashboard-text text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Requisition</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-right py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequisitions
                        .filter((req: Requisition) => req.status === 'approved' || req.status === 'rejected')
                        .slice(0, 5)
                        .map((req: Requisition) => (
                          <tr key={req.requisition_id}>
                            <td className="py-2">{req.requisition_number}</td>
                            <td className={`py-2 ${req.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                              {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Unknown'}
                            </td>
                            <td className="py-2 text-right">{new Date(req.request_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Purchase Orders Panel */}
            <div className={`bg-dashboard-panel rounded shadow p-4 ${!shouldShowSection('purchase_orders') ? 'opacity-50' : ''}`}>
              <h2 className="text-dashboard-header text-lg mb-4">Purchase Orders</h2>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">PO Status</h3>
                {preparePoStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={preparePoStatusData()}>
                      <XAxis dataKey="status" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                      <Bar dataKey="count" name="Count">
                        {preparePoStatusData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[180px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Recent Purchase Orders</h3>
                <div className="bg-dashboard-dark rounded p-2">
                  <table className="w-full text-dashboard-text text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">PO Number</th>
                        <th className="text-left py-2">Supplier</th>
                        <th className="text-right py-2">Amount</th>
                        <th className="text-right py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchaseOrders
                        .slice(0, 5)
                        .map((po: PurchaseOrder) => (
                          <tr key={po.po_id}>
                            <td className="py-2">{po.po_number}</td>
                            <td className="py-2">{po.supplier_name}</td>
                            <td className="py-2 text-right">{po.total_amount?.toLocaleString() || "0"} {po.currency}</td>
                            <td className="py-2 text-right">
                              <span className={`px-2 py-1 rounded text-xs ${
                                po.status === 'complete' ? 'bg-green-900 text-green-200' :
                                po.status === 'cancelled' ? 'bg-red-900 text-red-200' :
                                po.status === 'draft' ? 'bg-gray-700 text-gray-200' :
                                'bg-blue-900 text-blue-200'
                              }`}>
                                {po.status ? po.status.charAt(0).toUpperCase() + po.status.slice(1) : 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {filteredPurchaseOrders.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-dashboard-subtext">No purchase orders available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">PO Summary</h3>
                <div className="bg-dashboard-dark rounded p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Total POs</span>
                    <span className="text-dashboard-text">{purchaseOrders.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Open POs</span>
                    <span className="text-dashboard-text">
                      {purchaseOrders.filter((po: PurchaseOrder) => po.status !== 'complete' && po.status !== 'cancelled').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dashboard-subtext">Total Value</span>
                    <span className="text-dashboard-text">
                      {purchaseOrders.length > 0 
                        ? purchaseOrders.reduce((sum: number, po: PurchaseOrder) => sum + po.total_amount, 0).toLocaleString() 
                        : "0"} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inventory Panel */}
            <div className={`bg-dashboard-panel rounded shadow p-4 ${!shouldShowSection('inventory') ? 'opacity-50' : ''}`}>
              <h2 className="text-dashboard-header text-lg mb-4">Inventory</h2>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Inventory Status</h3>
                {prepareInventoryStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={prepareInventoryStatusData()}>
                      <XAxis dataKey="status" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                      <Bar dataKey="count" name="Item Count">
                        {prepareInventoryStatusData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[180px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Items Needing Attention</h3>
                <div className="bg-dashboard-dark rounded p-2">
                  <table className="w-full text-dashboard-text text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Item</th>
                        <th className="text-right py-2">Quantity</th>
                        <th className="text-right py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems
                        .filter((item: InventoryItem) => item.status === 'Critical' || item.status === 'Reorder')
                        .slice(0, 5)
                        .map((item: InventoryItem) => (
                          <tr key={item.inventory_id}>
                            <td className="py-2">{item.item_name}</td>
                            <td className="py-2 text-right">{item.current_quantity}</td>
                            <td className={`py-2 text-right ${
                              item.status === 'Critical' ? 'text-red-400' : 
                              item.status === 'Reorder' ? 'text-yellow-400' : 
                              item.status === 'Watch' ? 'text-blue-400' : 
                              'text-green-400'
                            }`}>
                              {item.status}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Inventory Summary</h3>
                <div className="bg-dashboard-dark rounded p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Total Items</span>
                    <span className="text-dashboard-text">{inventoryItems.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Total Value</span>
                    <span className="text-dashboard-text">
                      {inventoryItems.length > 0 
                        ? inventoryItems.reduce((sum: number, item: InventoryItem) => sum + item.inventory_value, 0).toLocaleString() 
                        : "0"} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dashboard-subtext">Critical Items</span>
                    <span className="text-dashboard-text text-red-400">
                      {inventoryItems.filter((item: InventoryItem) => item.status === 'Critical').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoices Panel */}
            <div className={`bg-dashboard-panel rounded shadow p-4 ${!shouldShowSection('invoices') ? 'opacity-50' : ''}`}>
              <h2 className="text-dashboard-header text-lg mb-4">Invoices & Payments</h2>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Invoice Aging</h3>
                {prepareInvoiceAgingData().length > 0 && prepareInvoiceAgingData().some(item => item.count > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={prepareInvoiceAgingData()}>
                      <XAxis dataKey="aging" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                      <Bar dataKey="count" name="Count">
                        {prepareInvoiceAgingData().map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.aging === 'Paid' ? '#4caf50' :
                              entry.aging === 'Not due' ? '#2196f3' :
                              entry.aging === 'Due in 7 days' ? '#ff9800' :
                              entry.aging === '1-30 days' ? '#f44336' :
                              entry.aging === '31-60 days' ? '#d32f2f' :
                              entry.aging === '61-90 days' ? '#b71c1c' :
                              '#7f0000'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[180px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Recent Invoices</h3>
                <div className="bg-dashboard-dark rounded p-2">
                  <table className="w-full text-dashboard-text text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2">Invoice</th>
                        <th className="text-left py-2">Supplier</th>
                        <th className="text-right py-2">Amount</th>
                        <th className="text-right py-2">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices
                        .filter((invoice: Invoice) => invoice.status !== 'paid')
                        .slice(0, 5)
                        .map((invoice: Invoice) => {
                          const dueDate = new Date(invoice.due_date);
                          const today = new Date();
                          const isPastDue = dueDate < today;
                          
                          return (
                            <tr key={invoice.invoice_id}>
                              <td className="py-2">{invoice.invoice_number}</td>
                              <td className="py-2">{invoice.supplier_name}</td>
                              <td className="py-2 text-right">{invoice.total_amount?.toLocaleString() || "0"} {invoice.currency}</td>
                              <td className={`py-2 text-right ${isPastDue ? 'text-red-400' : ''}`}>
                                {dueDate.toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Payment Summary</h3>
                <div className="bg-dashboard-dark rounded p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Total Invoices</span>
                    <span className="text-dashboard-text">{paymentSummary.totalInvoices}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Unpaid Invoices</span>
                    <span className="text-dashboard-text">
                      {paymentSummary.unpaidInvoices}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dashboard-subtext">Overdue Amount</span>
                    <span className="text-dashboard-text text-red-400">
                      {paymentSummary.overdueAmount.toLocaleString()} {paymentSummary.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Spend Analysis */}
            <div className={`bg-dashboard-panel rounded shadow p-4 ${!shouldShowSection('spend') ? 'opacity-50' : ''}`}>
              <h2 className="text-dashboard-header text-lg mb-4">Spend Analysis</h2>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Spend by Category</h3>
                {prepareSpendByCategoryData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={prepareSpendByCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_spend"
                        nameKey="category_name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareSpendByCategoryData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `${Number(value).toLocaleString()} USD`}
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Spend by Department</h3>
                {prepareSpendByDepartmentData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={prepareSpendByDepartmentData()}>
                      <XAxis dataKey="department_name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        formatter={(value: any) => `${Number(value).toLocaleString()} USD`}
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                      <Bar dataKey="total_spend" name="Spend">
                        {prepareSpendByDepartmentData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Supplier Performance */}
            <div className={`bg-dashboard-panel rounded shadow p-4 ${!shouldShowSection('suppliers') ? 'opacity-50' : ''}`}>
              <h2 className="text-dashboard-header text-lg mb-4">Supplier Performance</h2>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Top Suppliers by Performance</h3>
                {prepareSupplierPerformanceData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={prepareSupplierPerformanceData()} layout="vertical">
                      <XAxis type="number" domain={[0, 5]} stroke="#666" />
                      <YAxis dataKey="name" type="category" width={100} stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                        labelStyle={{ color: '#e0e0e0' }}
                      />
                      <Legend />
                      <Bar dataKey="overall" name="Overall" fill="#7e57c2" />
                      <Bar dataKey="quality" name="Quality" fill="#4e7fff" />
                      <Bar dataKey="delivery" name="Delivery" fill="#64b5f6" />
                      <Bar dataKey="responsiveness" name="Responsiveness" fill="#4fc3f7" />
                      <Bar dataKey="cost" name="Cost" fill="#4db6ac" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] bg-dashboard-dark rounded">
                    <p className="text-dashboard-subtext">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-dashboard-subtext text-sm mb-2">Supplier Summary</h3>
                <div className="bg-dashboard-dark rounded p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Total Suppliers</span>
                    <span className="text-dashboard-text">{suppliers.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-dashboard-subtext">Active Suppliers</span>
                    <span className="text-dashboard-text">
                      {suppliers.filter((supplier: Supplier) => supplier.supplier_status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dashboard-subtext">Avg Performance</span>
                    <span className="text-dashboard-text">
                      {supplierPerformance.length > 0 
                        ? (supplierPerformance.reduce((sum: number, supplier: SupplierPerformanceSummary) => 
                            sum + supplier.avg_overall_score, 0) / supplierPerformance.length).toFixed(2)
                        : "0.00"} / 5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="mt-4">
            <ChatInterface />
          </div>
        </div>
      </ChatProvider>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
