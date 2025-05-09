// This service fetches data from the TimeWise Procurement dashboard backend API and handles live updates
import { query } from './dbService';

// Member interfaces
export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  membership_type: string;
  join_date: string;
  expiration_date: string;
  status: string;
  points: number;
  last_login: string | null;
  referral_source: string | null;
  referred_by: number | null;
  is_primary_account: boolean | null;
  primary_account_id: number | null;
  birthdate: string | null;
  email_opt_in: boolean | null;
  sms_opt_in: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberStatusSummary {
  status: string;
  member_count: number;
  total_points: number;
}

export interface MembershipTypeSummary {
  membership_type: string;
  monthly_fee: number;
  annual_fee: number;
  member_count: number;
  total_points: number;
}

export interface ExpiringMembership {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: string;
  join_date: string;
  expiration_date: string;
  status: string;
  days_remaining: number;
}

export interface MemberEngagement {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  membership_type: string;
  join_date: string;
  status: string;
  points: number;
  total_activities: number;
  latest_activity: string;
  days_since_last_activity: number;
  total_spent: number;
  events_attended: number;
  referrals_made: number;
}

export interface MemberActivity {
  log_id: number;
  member_id: number;
  first_name: string;
  last_name: string;
  activity_type: string;
  activity_date: string;
  points_earned: number;
  amount_spent: number | null;
  location: string;
  details: string;
}

// ProcurementEntry interface for procurement data
export interface ProcurementEntry {
  id: number;
  order_id: string;
  order_date: string;
  supplier_name: string;
  destination: string;
  scheduled_delivery: string;
  actual_delivery: string;
  delay_days: number;
  priority: string;
  fulfillmentRate: number;
  cost: number;
}

// ProcurementSchedule interface for procurement schedules
export interface ProcurementSchedule {
  supplier_id: number;
  supplier_name: string;
  scheduled_delivery: string;
  default_delay_days: number;
  total_orders: number;
  delayed_orders: number;
  avg_fulfillment_rate: number;
  on_time_rate: number;
}

// Function to transform data for procurement components
export const transformData = async (): Promise<ProcurementEntry[]> => {
  try {
    // Fetch real data from the API
    return await getProcurementData();
  } catch (error) {
    console.error('Error transforming data:', error);
    return [];
  }
};

// Function to fetch procurement data from the API
const getProcurementData = async (): Promise<ProcurementEntry[]> => {
  try {
    const response = await fetch('/api/dashboard/purchase-orders');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching procurement data:', error);
    return [];
  }
};

// Function to fetch procurement schedules from the API
export const getProcurementSchedules = async (): Promise<ProcurementSchedule[]> => {
  try {
    const response = await fetch('/api/dashboard/procurement-schedules');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schedules = await response.json();
    return schedules;
  } catch (error) {
    console.error('Error fetching procurement schedules:', error);
    return [];
  }
};
// Using native EventSource instead of polyfill
// If you need to support older browsers, you would need to install:
// npm install event-source-polyfill @types/event-source-polyfill

// Event listeners for live updates
type UpdateListener = (data: any) => void;
const supplierUpdateListeners: UpdateListener[] = [];
const purchaseOrderUpdateListeners: UpdateListener[] = [];
const inventoryUpdateListeners: UpdateListener[] = [];
const requisitionUpdateListeners: UpdateListener[] = [];
const invoiceUpdateListeners: UpdateListener[] = [];
const memberUpdateListeners: UpdateListener[] = [];

// Add event listeners
export const addSupplierUpdateListener = (listener: UpdateListener) => {
  supplierUpdateListeners.push(listener);
};

export const addPurchaseOrderUpdateListener = (listener: UpdateListener) => {
  purchaseOrderUpdateListeners.push(listener);
};

export const addInventoryUpdateListener = (listener: UpdateListener) => {
  inventoryUpdateListeners.push(listener);
};

export const addRequisitionUpdateListener = (listener: UpdateListener) => {
  requisitionUpdateListeners.push(listener);
};

export const addInvoiceUpdateListener = (listener: UpdateListener) => {
  invoiceUpdateListeners.push(listener);
};

export const addMemberUpdateListener = (listener: UpdateListener) => {
  memberUpdateListeners.push(listener);
};

// Remove event listeners
export const removeSupplierUpdateListener = (listener: UpdateListener) => {
  const index = supplierUpdateListeners.indexOf(listener);
  if (index !== -1) {
    supplierUpdateListeners.splice(index, 1);
  }
};

export const removePurchaseOrderUpdateListener = (listener: UpdateListener) => {
  const index = purchaseOrderUpdateListeners.indexOf(listener);
  if (index !== -1) {
    purchaseOrderUpdateListeners.splice(index, 1);
  }
};

export const removeInventoryUpdateListener = (listener: UpdateListener) => {
  const index = inventoryUpdateListeners.indexOf(listener);
  if (index !== -1) {
    inventoryUpdateListeners.splice(index, 1);
  }
};

export const removeRequisitionUpdateListener = (listener: UpdateListener) => {
  const index = requisitionUpdateListeners.indexOf(listener);
  if (index !== -1) {
    requisitionUpdateListeners.splice(index, 1);
  }
};

export const removeInvoiceUpdateListener = (listener: UpdateListener) => {
  const index = invoiceUpdateListeners.indexOf(listener);
  if (index !== -1) {
    invoiceUpdateListeners.splice(index, 1);
  }
};

export const removeMemberUpdateListener = (listener: UpdateListener) => {
  const index = memberUpdateListeners.indexOf(listener);
  if (index !== -1) {
    memberUpdateListeners.splice(index, 1);
  }
};

// Connect to the SSE endpoint for live updates
let eventSource: EventSource | null = null;

export const connectToLiveUpdates = () => {
  if (eventSource) {
    return; // Already connected
  }
  
  try {
    console.log('Connecting to live updates...');
    eventSource = new EventSource('/api/live-updates');
    
    eventSource.onopen = () => {
      console.log('Connected to live updates');
    };
    
    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received live update:', data);
        
        // Dispatch the update to the appropriate listeners
        if (data.type === 'supplier_changes') {
          supplierUpdateListeners.forEach(listener => listener(data.data));
        } else if (data.type === 'purchase_order_changes') {
          purchaseOrderUpdateListeners.forEach(listener => listener(data.data));
        } else if (data.type === 'inventory_changes') {
          inventoryUpdateListeners.forEach(listener => listener(data.data));
        } else if (data.type === 'requisition_changes') {
          requisitionUpdateListeners.forEach(listener => listener(data.data));
        } else if (data.type === 'invoice_changes') {
          invoiceUpdateListeners.forEach(listener => listener(data.data));
        } else if (data.type === 'member_changes') {
          memberUpdateListeners.forEach(listener => listener(data.data));
        }
      } catch (error) {
        console.error('Error processing live update:', error);
      }
    };
    
    eventSource.onerror = (error: Event) => {
      console.error('Error in live updates connection:', error);
      // Try to reconnect after a delay
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        setTimeout(connectToLiveUpdates, 5000);
      }
    };
  } catch (error) {
    console.error('Error connecting to live updates:', error);
    eventSource = null;
  }
};

// Disconnect from live updates
export const disconnectFromLiveUpdates = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log('Disconnected from live updates');
  }
};

// Data interfaces for procurement entities
export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  tax_id: string;
  supplier_status: string;
  onboarding_date: string;
  financial_stability_score: number;
  payment_terms: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface SupplierPerformance {
  performance_id: number;
  supplier_id: number;
  evaluation_date: string;
  quality_score: number;
  delivery_score: number;
  responsiveness_score: number;
  cost_score: number;
  overall_score: number;
  reviewer_id: number;
  comments: string;
}

export interface PurchaseOrder {
  po_id: number;
  po_number: string;
  requisition_id: number | null;
  supplier_id: number;
  supplier_name: string;
  buyer_id: number;
  department_id: number;
  department_name: string;
  order_date: string;
  delivery_date: string;
  status: string;
  payment_terms: string;
  shipping_terms: string;
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  currency: string;
  is_blanket_po: boolean;
  blanket_end_date: string | null;
}

export interface PurchaseOrderItem {
  po_item_id: number;
  po_id: number;
  req_item_id: number | null;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_amount: number;
  delivery_date: string;
  status: string;
  received_quantity: number;
  remaining_quantity: number;
}

export interface Requisition {
  requisition_id: number;
  requisition_number: string;
  requester_id: number;
  requester_name: string;
  department_id: number;
  department_name: string;
  status: string;
  request_date: string;
  need_by_date: string;
  total_amount: number;
  currency: string;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  supplier_id: number;
  supplier_name: string;
  po_id: number;
  po_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  tax_amount: number;
  currency: string;
  payment_terms: string;
  matching_status: string;
  match_type: string;
  payment_date: string | null;
  days_overdue: number;
}

export interface InventoryItem {
  inventory_id: number;
  item_id: number;
  item_name: string;
  item_code: string;
  category_name: string;
  location_id: number;
  location_name: string;
  current_quantity: number;
  min_quantity: number;
  max_quantity: number;
  reorder_point: number;
  abc_classification: string;
  cost_per_unit: number;
  inventory_value: number;
  status: string;
}

export interface Department {
  department_id: number;
  department_name: string;
  cost_center: string;
  manager_id: number;
  budget_amount: number;
  fiscal_year: number;
}

export interface SpendByCategory {
  category_name: string;
  total_spent: number;
  percentage: number;
}

export interface SpendByDepartment {
  department_name: string;
  total_spent: number;
  percentage: number;
}

export interface SupplierPerformanceSummary {
  supplier_id: number;
  supplier_name: string;
  avg_quality_score: number;
  avg_delivery_score: number;
  avg_responsiveness_score: number;
  avg_cost_score: number;
  avg_overall_score: number;
  performance_category: string;
}

export interface PurchaseOrderStatusSummary {
  status: string;
  po_count: number;
  total_value: number;
  avg_po_value: number;
}

export interface InventoryStatusSummary {
  status: string;
  item_count: number;
  total_value: number;
}

// Function to fetch suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await fetch('/api/dashboard/suppliers');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const suppliers = await response.json();
    
    // Ensure we're connected to live updates
    connectToLiveUpdates();
    
    return suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return getFallbackSuppliers();
  }
};

// Function to fetch supplier performance
export const getSupplierPerformance = async (): Promise<SupplierPerformanceSummary[]> => {
  try {
    const response = await fetch('/api/dashboard/supplier-performance');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const performance = await response.json();
    return performance;
  } catch (error) {
    console.error('Error fetching supplier performance:', error);
    return getFallbackSupplierPerformance();
  }
};

// Function to fetch purchase orders
export const getPurchaseOrders = async (status?: string): Promise<PurchaseOrder[]> => {
  try {
    const url = status ? `/api/dashboard/purchase-orders?status=${status}` : '/api/dashboard/purchase-orders';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const purchaseOrders = await response.json();
    return purchaseOrders;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return getFallbackPurchaseOrders();
  }
};

// Function to fetch purchase order status summary
export const getPurchaseOrderStatusSummary = async (): Promise<PurchaseOrderStatusSummary[]> => {
  try {
    const response = await fetch('/api/dashboard/purchase-orders/summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error('Error fetching purchase order status summary:', error);
    return getFallbackPurchaseOrderStatusSummary();
  }
};

// Function to fetch requisitions
export const getRequisitions = async (status?: string): Promise<Requisition[]> => {
  try {
    const url = status ? `/api/dashboard/requisitions?status=${status}` : '/api/dashboard/requisitions';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const requisitions = await response.json();
    return requisitions;
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    return getFallbackRequisitions();
  }
};

// Function to fetch invoices
export const getInvoices = async (status?: string): Promise<Invoice[]> => {
  try {
    const url = status ? `/api/dashboard/invoices?status=${status}` : '/api/dashboard/invoices';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const invoices = await response.json();
    return invoices;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error; // No fallback, query PostgreSQL directly
  }
};

// Function to fetch recent invoices
export const getRecentInvoices = async (limit: number = 5): Promise<Invoice[]> => {
  try {
    const url = `/api/dashboard/invoices/recent?limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const invoices = await response.json();
    return invoices;
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    throw error; // No fallback, query PostgreSQL directly
  }
};

// Function to fetch invoice aging data
export const getInvoiceAgingData = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/dashboard/invoices/aging');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const agingData = await response.json();
    return agingData;
  } catch (error) {
    console.error('Error fetching invoice aging data:', error);
    console.warn('Using fallback invoice aging data');
    return getFallbackInvoiceAgingData();
  }
};

// Function to fetch payment summary
export const getPaymentSummary = async (): Promise<any> => {
  try {
    const response = await fetch('/api/dashboard/invoices/payment-summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    console.warn('Using fallback payment summary data');
    return getFallbackPaymentSummary();
  }
};

// Fallback functions for invoice data
const getFallbackInvoiceAgingData = (): any[] => {
  return [
    { aging: 'Not Due', count: 85, amount: 3731061.47 },
    { aging: '1-30 days', count: 72, amount: 3096890.60 },
    { aging: '31-60 days', count: 3, amount: 128611.59 },
    { aging: 'Paid', count: 40, amount: 1968236.74 }
  ];
};

const getFallbackPaymentSummary = (): any => {
  return {
    totalInvoices: 200,
    unpaidInvoices: 160,
    overdueAmount: 3225502.19,
    overdueInvoices: 75,
    currency: 'USD'
  };
};

// Function to fetch inventory items
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const response = await fetch('/api/dashboard/inventory');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const inventory = await response.json();
    return inventory;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return getFallbackInventory();
  }
};

// Function to fetch inventory status summary
export const getInventoryStatusSummary = async (): Promise<InventoryStatusSummary[]> => {
  try {
    const response = await fetch('/api/dashboard/inventory/summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error('Error fetching inventory status summary:', error);
    return getFallbackInventoryStatusSummary();
  }
};

// Function to fetch members
export const getMembers = async (): Promise<Member[]> => {
  try {
    const response = await fetch('/api/member-management/members');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const members = await response.json();
    
    // Ensure we're connected to live updates
    connectToLiveUpdates();
    
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error; // No fallback, only use PostgreSQL data
  }
};

// Function to fetch member status summary
export const getMemberStatusSummary = async (): Promise<MemberStatusSummary[]> => {
  try {
    const response = await fetch('/api/member-management/status-summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error('Error fetching member status summary:', error);
    throw error; // No fallback, only use PostgreSQL data
  }
};

// Function to fetch membership type summary
export const getMembershipTypeSummary = async (): Promise<MembershipTypeSummary[]> => {
  try {
    const response = await fetch('/api/member-management/type-summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error('Error fetching membership type summary:', error);
    throw error; // No fallback, only use PostgreSQL data
  }
};

// Function to fetch expiring memberships
export const getExpiringMemberships = async (days?: number): Promise<ExpiringMembership[]> => {
  try {
    const url = days ? `/api/member-management/expiring?days=${days}` : '/api/member-management/expiring';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const expiring = await response.json();
    return expiring;
  } catch (error) {
    console.error('Error fetching expiring memberships:', error);
    throw error; // No fallback, only use PostgreSQL data
  }
};

// Function to fetch member engagement metrics
export const getMemberEngagement = async (): Promise<MemberEngagement[]> => {
  try {
    const response = await fetch('/api/member-management/engagement');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const engagement = await response.json();
    return engagement;
  } catch (error) {
    console.error('Error fetching member engagement:', error);
    throw error; // No fallback, only use PostgreSQL data
  }
};

// Function to fetch recent member activities
export const getRecentActivities = async (limit?: number): Promise<MemberActivity[]> => {
  try {
    const url = limit ? `/api/member-management/recent-activities?limit=${limit}` : '/api/member-management/recent-activities';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const activities = await response.json();
    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error; // No fallback, only use PostgreSQL data
  }
};

// Function to fetch spend by category
export const getSpendByCategory = async (): Promise<SpendByCategory[]> => {
  try {
    const response = await fetch('/api/dashboard/spend/category');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const spendByCategory = await response.json();
    return spendByCategory;
  } catch (error) {
    console.error('Error fetching spend by category:', error);
    return getFallbackSpendByCategory();
  }
};

// Function to fetch spend by department
export const getSpendByDepartment = async (): Promise<SpendByDepartment[]> => {
  try {
    const response = await fetch('/api/dashboard/spend/department');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const spendByDepartment = await response.json();
    return spendByDepartment;
  } catch (error) {
    console.error('Error fetching spend by department:', error);
    return getFallbackSpendByDepartment();
  }
};

// Function to fetch departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch('/api/dashboard/departments');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const departments = await response.json();
    return departments;
  } catch (error) {
    console.error('Error fetching departments:', error);
    // Return some fallback departments for testing
    return [
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
  }
};

// Fallback data in case database connection fails - empty until PostgreSQL directory is linked
const getFallbackSuppliers = (): Supplier[] => {
  console.warn('Using fallback supplier data for testing');
  return [
    {
      supplier_id: 1,
      supplier_name: 'Acme Supplies',
      tax_id: '123-45-6789',
      supplier_status: 'Active',
      onboarding_date: '2024-01-15',
      financial_stability_score: 85,
      payment_terms: 'Net 30',
      contact_name: 'John Doe',
      contact_email: 'john@acmesupplies.com',
      contact_phone: '555-123-4567',
      address_line1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      country: 'USA'
    },
    {
      supplier_id: 2,
      supplier_name: 'Global Tech',
      tax_id: '987-65-4321',
      supplier_status: 'Active',
      onboarding_date: '2024-02-20',
      financial_stability_score: 92,
      payment_terms: 'Net 45',
      contact_name: 'Jane Smith',
      contact_email: 'jane@globaltech.com',
      contact_phone: '555-987-6543',
      address_line1: '456 Tech Blvd',
      city: 'Tech City',
      state: 'NY',
      postal_code: '54321',
      country: 'USA'
    },
    {
      supplier_id: 3,
      supplier_name: 'Office Solutions',
      tax_id: '456-78-9012',
      supplier_status: 'Active',
      onboarding_date: '2024-03-10',
      financial_stability_score: 78,
      payment_terms: 'Net 30',
      contact_name: 'Bob Johnson',
      contact_email: 'bob@officesolutions.com',
      contact_phone: '555-456-7890',
      address_line1: '789 Office Park',
      city: 'Business City',
      state: 'TX',
      postal_code: '67890',
      country: 'USA'
    }
  ];
};

const getFallbackSupplierPerformance = (): SupplierPerformanceSummary[] => {
  console.warn('Using empty fallback supplier performance data until PostgreSQL directory is linked');
  return [];
};

const getFallbackPurchaseOrders = (): PurchaseOrder[] => {
  console.warn('Using fallback purchase order data for testing');
  return [
    {
      po_id: 1,
      po_number: 'PO-2025-001',
      requisition_id: null,
      supplier_id: 1,
      supplier_name: 'Acme Supplies',
      buyer_id: 1,
      department_id: 1,
      department_name: 'Procurement',
      order_date: '2025-01-15',
      delivery_date: '2025-02-15',
      status: 'Delivered',
      payment_terms: 'Net 30',
      shipping_terms: 'FOB Destination',
      total_amount: 5000,
      tax_amount: 400,
      shipping_amount: 100,
      currency: 'USD',
      is_blanket_po: false,
      blanket_end_date: null
    },
    {
      po_id: 2,
      po_number: 'PO-2025-002',
      requisition_id: null,
      supplier_id: 2,
      supplier_name: 'Global Tech',
      buyer_id: 1,
      department_id: 2,
      department_name: 'IT',
      order_date: '2025-02-20',
      delivery_date: '2025-03-20',
      status: 'In Transit',
      payment_terms: 'Net 45',
      shipping_terms: 'FOB Origin',
      total_amount: 12000,
      tax_amount: 960,
      shipping_amount: 200,
      currency: 'USD',
      is_blanket_po: false,
      blanket_end_date: null
    },
    {
      po_id: 3,
      po_number: 'PO-2025-003',
      requisition_id: null,
      supplier_id: 3,
      supplier_name: 'Office Solutions',
      buyer_id: 1,
      department_id: 3,
      department_name: 'HR',
      order_date: '2025-03-10',
      delivery_date: '2025-04-10',
      status: 'Pending',
      payment_terms: 'Net 30',
      shipping_terms: 'FOB Destination',
      total_amount: 3500,
      tax_amount: 280,
      shipping_amount: 75,
      currency: 'USD',
      is_blanket_po: false,
      blanket_end_date: null
    }
  ];
};

const getFallbackPurchaseOrderStatusSummary = (): PurchaseOrderStatusSummary[] => {
  console.warn('Using empty fallback purchase order status summary data until PostgreSQL directory is linked');
  return [];
};

const getFallbackRequisitions = (): Requisition[] => {
  console.warn('Using empty fallback requisition data until PostgreSQL directory is linked');
  return [];
};

// This function is no longer needed as we're always using PostgreSQL data
// const getFallbackInvoices = (): Invoice[] => {
//   console.warn('Using empty fallback invoice data until PostgreSQL directory is linked');
//   return [];
// };

const getFallbackInventory = (): InventoryItem[] => {
  console.warn('Using empty fallback inventory data until PostgreSQL directory is linked');
  return [];
};

const getFallbackInventoryStatusSummary = (): InventoryStatusSummary[] => {
  console.warn('Using empty fallback inventory status summary data until PostgreSQL directory is linked');
  return [];
};

const getFallbackMembers = (): Member[] => {
  console.warn('Using fallback member data for testing');
  return [
    {
      member_id: 1,
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      phone: '512-555-1234',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'Austin',
      state: 'TX',
      postal_code: '78660',
      country: 'United States',
      membership_type: 'premium',
      join_date: '2024-01-15',
      expiration_date: '2025-01-15',
      status: 'active',
      points: 750,
      last_login: '2025-04-28 14:22:36',
      referral_source: 'website',
      notes: 'Interested in weekend events',
      is_primary_account: true,
      primary_account_id: null,
      birthdate: null,
      email_opt_in: true,
      sms_opt_in: false,
      referred_by: null,
      created_at: '2025-05-03T22:12:18.656Z',
      updated_at: '2025-05-03T22:12:18.656Z'
    },
    {
      member_id: 2,
      first_name: 'Maria',
      last_name: 'Garcia',
      email: 'maria.garcia@example.com',
      phone: '512-555-2345',
      address_line1: '456 Oak Ave',
      address_line2: null,
      city: 'Pflugerville',
      state: 'TX',
      postal_code: '78660',
      country: 'United States',
      membership_type: 'standard',
      join_date: '2024-02-20',
      expiration_date: '2025-02-20',
      status: 'active',
      points: 320,
      last_login: '2025-04-29 09:15:22',
      referral_source: 'friend',
      notes: 'Prefers email communications',
      is_primary_account: true,
      primary_account_id: null,
      birthdate: null,
      email_opt_in: true,
      sms_opt_in: false,
      referred_by: null,
      created_at: '2025-05-03T22:12:18.656Z',
      updated_at: '2025-05-03T22:12:18.656Z'
    },
    {
      member_id: 3,
      first_name: 'Robert',
      last_name: 'Johnson',
      email: 'robert.j@example.com',
      phone: '512-555-3456',
      address_line1: '789 Pine St',
      address_line2: 'Suite 101',
      city: 'Round Rock',
      state: 'TX',
      postal_code: '78664',
      country: 'United States',
      membership_type: 'premium',
      join_date: '2023-11-10',
      expiration_date: '2024-11-10',
      status: 'active',
      points: 1250,
      last_login: '2025-04-30 16:45:10',
      referral_source: 'social_media',
      notes: null,
      is_primary_account: true,
      primary_account_id: null,
      birthdate: null,
      email_opt_in: true,
      sms_opt_in: false,
      referred_by: null,
      created_at: '2025-05-03T22:12:18.656Z',
      updated_at: '2025-05-03T22:12:18.656Z'
    },
    {
      member_id: 8,
      first_name: 'Sarah',
      last_name: 'Wilson',
      email: 'sarah.w@example.com',
      phone: '512-555-8901',
      address_line1: '258 Willow Way',
      address_line2: null,
      city: 'Pflugerville',
      state: 'TX',
      postal_code: '78660',
      country: 'United States',
      membership_type: 'standard',
      join_date: '2023-10-05',
      expiration_date: '2024-10-05',
      status: 'expiring',
      points: 710,
      last_login: '2025-04-15 17:30:20',
      referral_source: 'social_media',
      notes: 'Send renewal reminder',
      is_primary_account: true,
      primary_account_id: null,
      birthdate: null,
      email_opt_in: true,
      sms_opt_in: false,
      referred_by: null,
      created_at: '2025-05-03T22:12:18.656Z',
      updated_at: '2025-05-03T22:12:18.656Z'
    },
    {
      member_id: 11,
      first_name: 'Thomas',
      last_name: 'Martinez',
      email: 'thomas.m@example.com',
      phone: '512-556-1234',
      address_line1: '581 Hickory St',
      address_line2: null,
      city: 'Austin',
      state: 'TX',
      postal_code: '78748',
      country: 'United States',
      membership_type: 'premium',
      join_date: '2023-09-15',
      expiration_date: '2024-09-15',
      status: 'expiring',
      points: 970,
      last_login: '2025-04-20 14:50:18',
      referral_source: 'friend',
      notes: 'Considering upgrade to family plan',
      is_primary_account: true,
      primary_account_id: null,
      birthdate: null,
      email_opt_in: true,
      sms_opt_in: false,
      referred_by: null,
      created_at: '2025-05-03T22:12:18.656Z',
      updated_at: '2025-05-03T22:12:18.656Z'
    },
    {
      member_id: 12,
      first_name: 'Patricia',
      last_name: 'Thompson',
      email: 'patricia.t@example.com',
      phone: '512-556-2345',
      address_line1: '692 Chestnut Ave',
      address_line2: 'Suite 5',
      city: 'Pflugerville',
      state: 'TX',
      postal_code: '78660',
      country: 'United States',
      membership_type: 'family',
      join_date: '2024-03-10',
      expiration_date: '2025-03-10',
      status: 'active',
      points: 520,
      last_login: '2025-04-29 16:25:40',
      referral_source: 'event',
      notes: 'Family of 4',
      is_primary_account: true,
      primary_account_id: null,
      birthdate: null,
      email_opt_in: true,
      sms_opt_in: false,
      referred_by: null,
      created_at: '2025-05-03T22:12:18.656Z',
      updated_at: '2025-05-03T22:12:18.656Z'
    }
  ];
};

const getFallbackMemberStatusSummary = (): MemberStatusSummary[] => {
  console.warn('Using fallback member status summary data for testing');
  return [
    {
      status: 'active',
      member_count: 1,
      total_points: 100
    }
  ];
};

const getFallbackMembershipTypeSummary = (): MembershipTypeSummary[] => {
  console.warn('Using fallback membership type summary data for testing');
  return [
    {
      membership_type: 'standard',
      monthly_fee: 9.99,
      annual_fee: 99.99,
      member_count: 1,
      total_points: 100
    }
  ];
};

const getFallbackExpiringMemberships = (): ExpiringMembership[] => {
  console.warn('Using fallback expiring memberships data for testing');
  return [
    {
      member_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      membership_type: 'standard',
      join_date: '2025-01-01',
      expiration_date: '2026-01-01',
      status: 'active',
      days_remaining: 365
    }
  ];
};

const getFallbackMemberEngagement = (): MemberEngagement[] => {
  console.warn('Using fallback member engagement data for testing');
  return [
    {
      member_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      membership_type: 'standard',
      join_date: '2025-01-01',
      status: 'active',
      points: 100,
      total_activities: 5,
      latest_activity: '2025-05-01',
      days_since_last_activity: 2,
      total_spent: 500,
      events_attended: 2,
      referrals_made: 1
    }
  ];
};

const getFallbackRecentActivities = (): MemberActivity[] => {
  console.warn('Using fallback recent activities data for testing');
  return [
    {
      log_id: 1,
      member_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      activity_type: 'login',
      activity_date: '2025-05-01',
      points_earned: 10,
      amount_spent: null,
      location: 'web',
      details: 'Logged in to the system'
    }
  ];
};

const getFallbackSpendByCategory = (): SpendByCategory[] => {
  console.warn('Using fallback spend by category data for testing');
  return [
    {
      category_name: 'IT Equipment',
      total_spent: 32500,
      percentage: 30.5
    },
    {
      category_name: 'Office Supplies',
      total_spent: 18700,
      percentage: 17.6
    },
    {
      category_name: 'Consulting Services',
      total_spent: 25000,
      percentage: 23.5
    },
    {
      category_name: 'Software Licenses',
      total_spent: 15300,
      percentage: 14.4
    },
    {
      category_name: 'Travel',
      total_spent: 8500,
      percentage: 8.0
    },
    {
      category_name: 'Miscellaneous',
      total_spent: 6400,
      percentage: 6.0
    }
  ];
};

const getFallbackSpendByDepartment = (): SpendByDepartment[] => {
  console.warn('Using fallback spend by department data for testing');
  return [
    {
      department_name: 'Finance',
      total_spent: 21500,
      percentage: 15.6
    },
    {
      department_name: 'Marketing',
      total_spent: 28700,
      percentage: 20.8
    },
    {
      department_name: 'Operations',
      total_spent: 24300,
      percentage: 17.6
    },
    {
      department_name: 'Sales',
      total_spent: 19800,
      percentage: 14.3
    },
    {
      department_name: 'IT',
      total_spent: 31500,
      percentage: 22.8
    },
    {
      department_name: 'R&D',
      total_spent: 7800,
      percentage: 5.6
    },
    {
      department_name: 'HR',
      total_spent: 4500,
      percentage: 3.3
    }
  ];
};
