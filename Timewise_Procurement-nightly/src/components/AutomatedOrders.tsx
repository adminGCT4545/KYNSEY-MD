import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  parLevel: number;
  reorderPoint: number;
  supplier: string;
  lastOrderDate: string;
  autoOrderEnabled: boolean;
  unitPrice: number;
  unitOfMeasure: string;
}

interface CategorySummary {
  name: string;
  belowPar: number;
  atPar: number;
  abovePar: number;
}

interface SupplierSummary {
  name: string;
  productCount: number;
  pendingOrders: number;
}

const AutomatedOrders: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoOrderProducts, setAutoOrderProducts] = useState<Product[]>([]);

  // Colors for the charts
  const COLORS = ['#7e57c2', '#4e7fff', '#b39ddb', '#64b5f6', '#9575cd', '#5c6bc0', '#7986cb', '#4fc3f7'];
  type StockStatus = 'Below Par' | 'At Par' | 'Above Par' | 'Auto-Order';
  
  const STATUS_COLORS: Record<StockStatus, string> = {
    'Below Par': '#F44336',
    'At Par': '#FFC107',
    'Above Par': '#4CAF50',
    'Auto-Order': '#7e57c2'
  };

  // Function to fetch products from the database
  const fetchProductsFromDatabase = async () => {
    try {
      // In a real implementation, this would make an API call to fetch data from PostgreSQL
      // For example: const response = await fetch('/api/products');
      // const data = await response.json();
      // return data;
      
      // For now, we'll use mock data that simulates what would be in the timewise_procument database
      return [
        {
          id: 'P001',
          name: 'Office Paper (A4)',
          category: 'Office Supplies',
          currentStock: 15,
          parLevel: 50,
          reorderPoint: 20,
          supplier: 'Office Depot',
          lastOrderDate: '2025-04-15',
          autoOrderEnabled: true,
          unitPrice: 4.99,
          unitOfMeasure: 'Ream'
        },
        {
          id: 'P002',
          name: 'Ballpoint Pens (Black)',
          category: 'Office Supplies',
          currentStock: 45,
          parLevel: 100,
          reorderPoint: 30,
          supplier: 'Staples',
          lastOrderDate: '2025-04-10',
          autoOrderEnabled: true,
          unitPrice: 0.99,
          unitOfMeasure: 'Each'
        },
        {
          id: 'P003',
          name: 'Printer Toner (Black)',
          category: 'IT Supplies',
          currentStock: 2,
          parLevel: 10,
          reorderPoint: 3,
          supplier: 'Tech Solutions',
          lastOrderDate: '2025-04-20',
          autoOrderEnabled: true,
          unitPrice: 79.99,
          unitOfMeasure: 'Cartridge'
        },
        {
          id: 'P004',
          name: 'Laptop Chargers',
          category: 'IT Supplies',
          currentStock: 5,
          parLevel: 15,
          reorderPoint: 5,
          supplier: 'Tech Solutions',
          lastOrderDate: '2025-03-25',
          autoOrderEnabled: false,
          unitPrice: 45.99,
          unitOfMeasure: 'Each'
        },
        {
          id: 'P005',
          name: 'Coffee Beans',
          category: 'Kitchen Supplies',
          currentStock: 3,
          parLevel: 20,
          reorderPoint: 5,
          supplier: 'Gourmet Foods',
          lastOrderDate: '2025-04-28',
          autoOrderEnabled: true,
          unitPrice: 12.99,
          unitOfMeasure: 'Pound'
        },
        {
          id: 'P006',
          name: 'Paper Towels',
          category: 'Kitchen Supplies',
          currentStock: 12,
          parLevel: 30,
          reorderPoint: 10,
          supplier: 'Janitorial Supplies Inc',
          lastOrderDate: '2025-04-05',
          autoOrderEnabled: true,
          unitPrice: 1.99,
          unitOfMeasure: 'Roll'
        },
        {
          id: 'P007',
          name: 'Hand Sanitizer',
          category: 'Health Supplies',
          currentStock: 25,
          parLevel: 50,
          reorderPoint: 15,
          supplier: 'Health Essentials',
          lastOrderDate: '2025-03-15',
          autoOrderEnabled: true,
          unitPrice: 3.99,
          unitOfMeasure: 'Bottle'
        },
        {
          id: 'P008',
          name: 'Disposable Masks',
          category: 'Health Supplies',
          currentStock: 150,
          parLevel: 500,
          reorderPoint: 200,
          supplier: 'Health Essentials',
          lastOrderDate: '2025-02-20',
          autoOrderEnabled: false,
          unitPrice: 0.50,
          unitOfMeasure: 'Each'
        },
        {
          id: 'P009',
          name: 'Cleaning Solution',
          category: 'Janitorial',
          currentStock: 8,
          parLevel: 20,
          reorderPoint: 10,
          supplier: 'Janitorial Supplies Inc',
          lastOrderDate: '2025-04-12',
          autoOrderEnabled: true,
          unitPrice: 8.99,
          unitOfMeasure: 'Gallon'
        },
        {
          id: 'P010',
          name: 'Trash Bags',
          category: 'Janitorial',
          currentStock: 5,
          parLevel: 30,
          reorderPoint: 10,
          supplier: 'Janitorial Supplies Inc',
          lastOrderDate: '2025-04-18',
          autoOrderEnabled: true,
          unitPrice: 5.99,
          unitOfMeasure: 'Box'
        },
        {
          id: 'P011',
          name: 'Sticky Notes',
          category: 'Office Supplies',
          currentStock: 35,
          parLevel: 50,
          reorderPoint: 20,
          supplier: 'Office Depot',
          lastOrderDate: '2025-03-30',
          autoOrderEnabled: false,
          unitPrice: 2.99,
          unitOfMeasure: 'Pack'
        },
        {
          id: 'P012',
          name: 'Staples',
          category: 'Office Supplies',
          currentStock: 15,
          parLevel: 30,
          reorderPoint: 10,
          supplier: 'Staples',
          lastOrderDate: '2025-03-10',
          autoOrderEnabled: true,
          unitPrice: 1.99,
          unitOfMeasure: 'Box'
        }
      ];
    } catch (error) {
      console.error('Error fetching products from database:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products from the database (timewise_procument)
        const productsData = await fetchProductsFromDatabase();
        setProducts(productsData);
        
        // Get available categories for the filter
        const categories = Array.from(new Set(productsData.map(item => item.category))).sort();
        setAvailableCategories(categories);
        
        // Get available suppliers for the filter
        const suppliers = Array.from(new Set(productsData.map(item => item.supplier))).sort();
        setAvailableSuppliers(suppliers);
        
        // Filter products that need auto-ordering (below reorder point)
        const autoOrderItems = productsData.filter(
          product => product.autoOrderEnabled && product.currentStock <= product.reorderPoint
        );
        setAutoOrderProducts(autoOrderItems);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    // Filter products based on selected category and supplier
    let filteredProducts = products;
    
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }
    
    if (selectedSupplier !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.supplier === selectedSupplier);
    }
    
    // Filter products that need auto-ordering (below reorder point)
    const autoOrderItems = filteredProducts.filter(
      product => product.autoOrderEnabled && product.currentStock <= product.reorderPoint
    );
    setAutoOrderProducts(autoOrderItems);
  }, [selectedCategory, selectedSupplier, products]);
  
  // Log selectedView changes
  useEffect(() => {
    console.log("Selected view changed to:", selectedView);
  }, [selectedView]);
  
  // Prepare data for charts
  const prepareCategoryData = (): CategorySummary[] => {
    const categoryData: Record<string, CategorySummary> = {};
    
    products.forEach(product => {
      if (!categoryData[product.category]) {
        categoryData[product.category] = {
          name: product.category,
          belowPar: 0,
          atPar: 0,
          abovePar: 0
        };
      }
      
      if (product.currentStock < product.reorderPoint) {
        categoryData[product.category].belowPar++;
      } else if (product.currentStock < product.parLevel) {
        categoryData[product.category].atPar++;
      } else {
        categoryData[product.category].abovePar++;
      }
    });
    
    return Object.values(categoryData);
  };
  
  const prepareSupplierData = (): SupplierSummary[] => {
    const supplierData: Record<string, SupplierSummary> = {};
    
    products.forEach(product => {
      if (!supplierData[product.supplier]) {
        supplierData[product.supplier] = {
          name: product.supplier,
          productCount: 0,
          pendingOrders: 0
        };
      }
      
      supplierData[product.supplier].productCount++;
      
      if (product.autoOrderEnabled && product.currentStock <= product.reorderPoint) {
        supplierData[product.supplier].pendingOrders++;
      }
    });
    
    return Object.values(supplierData);
  };
  
  const prepareInventoryStatusData = () => {
    const belowPar = products.filter(p => p.currentStock < p.reorderPoint).length;
    const atPar = products.filter(p => p.currentStock >= p.reorderPoint && p.currentStock < p.parLevel).length;
    const abovePar = products.filter(p => p.currentStock >= p.parLevel).length;
    
    return [
      { name: 'Below Par', value: belowPar },
      { name: 'At Par', value: atPar },
      { name: 'Above Par', value: abovePar }
    ];
  };
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.id.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query)
    );
  });
  
  const getStockStatus = (product: Product): StockStatus => {
    if (product.currentStock < product.reorderPoint) {
      return 'Below Par';
    } else if (product.currentStock < product.parLevel) {
      return 'At Par';
    } else {
      return 'Above Par';
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-10 text-dashboard-text">Loading inventory data...</div>;
  }
  
  return (
    <div className="p-4">
      <div className="mb-4 px-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-medium text-dashboard-header">Automated Orders</h1>
            {selectedCategory !== 'all' && (
              <div className="text-dashboard-subtext text-sm mt-1">
                Filtered by category: <span className="text-dashboard-purple font-medium">{selectedCategory}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  console.log("Setting view to overview");
                  setSelectedView('overview');
                }}
                className={`px-3 py-1 rounded text-sm ${selectedView === 'overview' ? 'bg-dashboard-purple text-white' : 'bg-dashboard-dark text-dashboard-text hover:bg-gray-700'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => {
                  console.log("Setting view to autoOrders");
                  setSelectedView('autoOrders');
                }}
                className={`px-3 py-1 rounded text-sm ${selectedView === 'autoOrders' ? 'bg-dashboard-purple text-white' : 'bg-dashboard-dark text-dashboard-text hover:bg-gray-700'}`}
              >
                Auto Orders
              </button>
              <button 
                onClick={() => {
                  console.log("Setting view to inventory");
                  setSelectedView('inventory');
                }}
                className={`px-3 py-1 rounded text-sm ${selectedView === 'inventory' ? 'bg-dashboard-purple text-white' : 'bg-dashboard-dark text-dashboard-text hover:bg-gray-700'}`}
              >
                Inventory Levels
              </button>
              <button 
                onClick={() => {
                  console.log("Setting view to suppliers");
                  setSelectedView('suppliers');
                }}
                className={`px-3 py-1 rounded text-sm ${selectedView === 'suppliers' ? 'bg-dashboard-purple text-white' : 'bg-dashboard-dark text-dashboard-text hover:bg-gray-700'}`}
              >
                By Supplier
              </button>
            </div>
            <div>
              <label htmlFor="categorySelect" className="text-dashboard-subtext mr-2 text-sm">Category:</label>
              <select 
                id="categorySelect"
                className="bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-2 py-1 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Supplier Selection Buttons */}
        <div className="bg-dashboard-panel rounded shadow p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-dashboard-header text-sm">Select Supplier:</h2>
            <button 
              onClick={() => setSelectedSupplier('all')}
              className={`text-xs px-3 py-1 rounded ${selectedSupplier === 'all' ? 'bg-dashboard-purple text-white' : 'bg-dashboard-dark text-dashboard-subtext hover:bg-gray-700'}`}
            >
              All Suppliers
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableSuppliers.map(supplier => (
              <button 
                key={supplier}
                onClick={() => setSelectedSupplier(supplier)}
                className={`text-xs px-3 py-2 rounded ${selectedSupplier === supplier ? 'bg-dashboard-purple text-white' : 'bg-dashboard-dark text-dashboard-subtext hover:bg-gray-700'}`}
              >
                {supplier}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-2">Total Products</h2>
          <div className="text-dashboard-header text-2xl font-bold">
            {products.length}
          </div>
          <div className="text-dashboard-subtext text-xs mt-2">
            In inventory
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-2">Auto-Order Enabled</h2>
          <div className="text-dashboard-header text-2xl font-bold">
            {products.filter(p => p.autoOrderEnabled).length}
          </div>
          <div className="text-dashboard-subtext text-xs mt-2">
            {((products.filter(p => p.autoOrderEnabled).length / products.length) * 100).toFixed(1)}% of products
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-2">Below Par Level</h2>
          <div className="text-dashboard-header text-2xl font-bold">
            {products.filter(p => p.currentStock < p.reorderPoint).length}
          </div>
          <div className="text-dashboard-subtext text-xs mt-2">
            {((products.filter(p => p.currentStock < p.reorderPoint).length / products.length) * 100).toFixed(1)}% of products
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-subtext text-sm mb-2">Pending Auto Orders</h2>
          <div className="text-dashboard-header text-2xl font-bold">
            {autoOrderProducts.length}
          </div>
          <div className="text-dashboard-subtext text-xs mt-2">
            Ready to be processed
          </div>
        </div>
      </div>
      
      {/* Main Content Based on Selected View */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inventory Status Distribution */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Inventory Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareInventoryStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="cell-0" fill={STATUS_COLORS['Below Par']} />
                  <Cell key="cell-1" fill={STATUS_COLORS['At Par']} />
                  <Cell key="cell-2" fill={STATUS_COLORS['Above Par']} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                  labelStyle={{ color: '#e0e0e0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Status by Category */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Inventory Status by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareCategoryData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="name" type="category" stroke="#666" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                  labelStyle={{ color: '#e0e0e0' }}
                />
                <Legend />
                <Bar dataKey="belowPar" stackId="a" fill={STATUS_COLORS['Below Par']} name="Below Par" />
                <Bar dataKey="atPar" stackId="a" fill={STATUS_COLORS['At Par']} name="At Par" />
                <Bar dataKey="abovePar" stackId="a" fill={STATUS_COLORS['Above Par']} name="Above Par" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Supplier Summary */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Supplier Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareSupplierData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                  labelStyle={{ color: '#e0e0e0' }}
                />
                <Legend />
                <Bar dataKey="productCount" fill="#7e57c2" name="Total Products" />
                <Bar dataKey="pendingOrders" fill="#f44336" name="Pending Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Auto Order Control Panel */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Auto Order Control Panel</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-dashboard-dark hover:bg-gray-700 text-dashboard-text p-3 rounded flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span>Process Auto Orders</span>
              </button>
              <button className="bg-dashboard-dark hover:bg-gray-700 text-dashboard-text p-3 rounded flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Order History</span>
              </button>
              <button className="bg-dashboard-dark hover:bg-gray-700 text-dashboard-text p-3 rounded flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Auto Order Settings</span>
              </button>
              <button className="bg-dashboard-dark hover:bg-gray-700 text-dashboard-text p-3 rounded flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedView === 'autoOrders' && (
        <div className="grid grid-cols-1 gap-4">
          {/* Search Bar */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by product ID, name, category, or supplier..."
                  className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-4 py-2 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button className="ml-2 bg-dashboard-purple text-white px-4 py-2 rounded">
                Filter
              </button>
            </div>
          </div>
          
          {/* Pending Auto Orders */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-dashboard-header text-lg">Pending Auto Orders</h2>
              <button className="bg-dashboard-purple text-white px-4 py-2 rounded text-sm">
                Process All Orders
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-dashboard-text">
                <thead className="bg-dashboard-dark border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4">Product ID</th>
                    <th className="text-left py-3 px-4">Product Name</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-right py-3 px-4">Current Stock</th>
                    <th className="text-right py-3 px-4">Par Level</th>
                    <th className="text-right py-3 px-4">Reorder Point</th>
                    <th className="text-right py-3 px-4">Order Quantity</th>
                    <th className="text-right py-3 px-4">Est. Cost</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {autoOrderProducts.map((product) => {
                    const orderQuantity = product.parLevel - product.currentStock;
                    const estimatedCost = orderQuantity * product.unitPrice;
                    
                    return (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                        <td className="py-3 px-4">{product.id}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">{product.supplier}</td>
                        <td className="py-3 px-4 text-right">
                          <span 
                            className="px-2 py-1 rounded text-xs" 
                            style={{ 
                              backgroundColor: STATUS_COLORS['Below Par'] + '33',
                              color: STATUS_COLORS['Below Par']
                            }}
                          >
                            {product.currentStock} {product.unitOfMeasure}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{product.parLevel} {product.unitOfMeasure}</td>
                        <td className="py-3 px-4 text-right">{product.reorderPoint} {product.unitOfMeasure}</td>
                        <td className="py-3 px-4 text-right">{orderQuantity} {product.unitOfMeasure}</td>
                        <td className="py-3 px-4 text-right">${estimatedCost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex space-x-2 justify-center">
                            <button className="p-1 rounded hover:bg-gray-700" title="Process Order">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button className="p-1 rounded hover:bg-gray-700" title="Edit Order">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button className="p-1 rounded hover:bg-gray-700" title="Cancel Order">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {selectedView === 'inventory' && (
        <div className="grid grid-cols-1 gap-4">
          {/* Search Bar */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by product ID, name, category, or supplier..."
                  className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-4 py-2 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button className="ml-2 bg-dashboard-purple text-white px-4 py-2 rounded">
                Filter
              </button>
            </div>
          </div>
          
          {/* Inventory Levels Table */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Inventory Levels</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-dashboard-text">
                <thead className="bg-dashboard-dark border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4">Product ID</th>
                    <th className="text-left py-3 px-4">Product Name</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-right py-3 px-4">Current Stock</th>
                    <th className="text-right py-3 px-4">Par Level</th>
                    <th className="text-right py-3 px-4">Reorder Point</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Auto-Order</th>
                    <th className="text-left py-3 px-4">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    
                    return (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                        <td className="py-3 px-4">{product.id}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">{product.supplier}</td>
                        <td className="py-3 px-4 text-right">{product.currentStock} {product.unitOfMeasure}</td>
                        <td className="py-3 px-4 text-right">{product.parLevel} {product.unitOfMeasure}</td>
                        <td className="py-3 px-4 text-right">{product.reorderPoint} {product.unitOfMeasure}</td>
                        <td className="py-3 px-4 text-center">
                          <span 
                            className="px-2 py-1 rounded text-xs" 
                            style={{ 
                              backgroundColor: STATUS_COLORS[status] + '33',
                              color: STATUS_COLORS[status]
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span 
                            className={`px-2 py-1 rounded text-xs ${
                              product.autoOrderEnabled 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {product.autoOrderEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{product.lastOrderDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {selectedView === 'suppliers' && (
        <div className="grid grid-cols-1 gap-4">
          {/* Supplier Summary */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Supplier Order Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-dashboard-text">
                <thead className="bg-dashboard-dark border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-right py-3 px-4">Total Products</th>
                    <th className="text-right py-3 px-4">Auto-Order Products</th>
                    <th className="text-right py-3 px-4">Pending Orders</th>
                    <th className="text-right py-3 px-4">Est. Order Value</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prepareSupplierData().map((supplier) => {
                    // Calculate estimated order value
                    const supplierProducts = products.filter(p => p.supplier === supplier.name);
                    const pendingOrderProducts = supplierProducts.filter(
                      p => p.autoOrderEnabled && p.currentStock <= p.reorderPoint
                    );
                    const estimatedOrderValue = pendingOrderProducts.reduce((total, product) => {
                      const orderQuantity = product.parLevel - product.currentStock;
                      return total + (orderQuantity * product.unitPrice);
                    }, 0);
                    
                    return (
                      <tr key={supplier.name} className="border-b border-gray-700 hover:bg-dashboard-dark">
                        <td className="py-3 px-4">{supplier.name}</td>
                        <td className="py-3 px-4 text-right">{supplier.productCount}</td>
                        <td className="py-3 px-4 text-right">
                          {supplierProducts.filter(p => p.autoOrderEnabled).length}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span 
                            className={`px-2 py-1 rounded text-xs ${
                              supplier.pendingOrders > 0 
                                ? 'bg-red-900 text-red-300' 
                                : 'bg-green-900 text-green-300'
                            }`}
                          >
                            {supplier.pendingOrders}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">${estimatedOrderValue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex space-x-2 justify-center">
                            <button className="bg-dashboard-purple text-white px-3 py-1 rounded text-xs">
                              Process Orders
                            </button>
                            <button className="bg-dashboard-dark text-dashboard-text px-3 py-1 rounded text-xs border border-gray-700">
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Supplier Performance */}
          <div className="bg-dashboard-panel rounded shadow p-4">
            <h2 className="text-dashboard-header text-lg mb-4">Supplier Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareSupplierData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#282c3e', borderColor: '#444', color: '#e0e0e0' }}
                  labelStyle={{ color: '#e0e0e0' }}
                />
                <Legend />
                <Bar dataKey="productCount" fill="#7e57c2" name="Total Products" />
                <Bar dataKey="pendingOrders" fill="#f44336" name="Pending Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedOrders;
