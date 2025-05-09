import React, { useState, useEffect } from 'react';
import { getPurchaseOrders, PurchaseOrder, getSuppliers, Supplier, getDepartments, Department } from '../services/dataService';

const PurchaseOrders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formError, setFormError] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  
  // Form data state
  const [poNumber, setPoNumber] = useState<string>('');
  const [supplierId, setSupplierId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [status, setStatus] = useState<string>('Pending');
  const [items, setItems] = useState<Array<{name: string, quantity: number, price: number}>>([
    { name: '', quantity: 1, price: 0 }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get data from the data service
        const data = await getPurchaseOrders();
        setPurchaseOrders(data);
        
        // Get suppliers and departments for the form
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
        
        const departmentsData = await getDepartments();
        setDepartments(departmentsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [formSubmitted]);
  
  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };
  
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'name' ? value : Number(value) 
    };
    setItems(newItems);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!poNumber) {
        setFormError('PO Number is required');
        return;
      }
      
      if (!supplierId) {
        setFormError('Supplier is required');
        return;
      }
      
      if (!departmentId) {
        setFormError('Department is required');
        return;
      }
      
      if (!deliveryDate) {
        setFormError('Delivery date is required');
        return;
      }
      
      if (items.length === 0) {
        setFormError('At least one item is required');
        return;
      }
      
      for (const item of items) {
        if (!item.name) {
          setFormError('All items must have a name');
          return;
        }
        
        if (item.quantity <= 0) {
          setFormError('All items must have a quantity greater than 0');
          return;
        }
      }
      
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      // Prepare form data
      const formData = {
        po_number: poNumber,
        supplier_id: Number(supplierId),
        department_id: Number(departmentId),
        order_date: orderDate,
        delivery_date: deliveryDate,
        status: status,
        payment_terms: 'Net 30',
        shipping_terms: 'FOB Destination',
        total_amount: totalAmount,
        tax_amount: 0,
        shipping_amount: 0,
        currency: 'USD',
        is_blanket_po: false,
        blanket_end_date: null,
        items: items.map(item => ({
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.quantity * item.price,
          tax_amount: 0,
          delivery_date: deliveryDate,
          status: 'Pending'
        }))
      };
      
      // Submit form data to the server
      const response = await fetch('/api/dashboard/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create purchase order');
      }
      
      // Reset form
      setPoNumber('');
      setSupplierId('');
      setDepartmentId('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setStatus('Pending');
      setItems([{ name: '', quantity: 1, price: 0 }]);
      
      setFormError('');
      setShowForm(false);
      setFormSubmitted(prev => !prev); // Toggle to trigger data reload
      
      // Show success message
      alert('Purchase order created successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  if (isLoading) {
    return <div className="text-center p-10 text-dashboard-text">Loading purchase orders data...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-medium text-dashboard-header">Invoice Intake</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            {showForm ? 'Cancel' : 'New Invoice'}
          </button>
        </div>
        
        {/* Purchase Order Form */}
        {showForm && (
          <div className="bg-dashboard-panel rounded shadow p-4 mb-6">
            <h2 className="text-dashboard-header text-lg mb-4">Create New Invoice</h2>
            
            {formError && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="po_number" className="block text-dashboard-subtext mb-1 text-sm">PO Number *</label>
                  <input
                    type="text"
                    id="po_number"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="supplier_id" className="block text-dashboard-subtext mb-1 text-sm">Supplier *</label>
                  <select
                    id="supplier_id"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="department_id" className="block text-dashboard-subtext mb-1 text-sm">Department *</label>
                  <select
                    id="department_id"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(department => (
                      <option key={department.department_id} value={department.department_id}>
                        {department.department_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="order_date" className="block text-dashboard-subtext mb-1 text-sm">Order Date *</label>
                  <input
                    type="date"
                    id="order_date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="delivery_date" className="block text-dashboard-subtext mb-1 text-sm">Delivery Date *</label>
                  <input
                    type="date"
                    id="delivery_date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-dashboard-subtext mb-1 text-sm">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-dashboard-header text-md mb-2">Items</h3>
                {items.map((item, index) => (
                  <div key={index} className="bg-dashboard-dark p-3 rounded mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`item_name_${index}`} className="block text-dashboard-subtext mb-1 text-sm">Item Name *</label>
                        <input
                          type="text"
                          id={`item_name_${index}`}
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full bg-dashboard-panel text-dashboard-text border border-gray-700 rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`quantity_${index}`} className="block text-dashboard-subtext mb-1 text-sm">Quantity *</label>
                        <input
                          type="number"
                          id={`quantity_${index}`}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full bg-dashboard-panel text-dashboard-text border border-gray-700 rounded px-3 py-2"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`price_${index}`} className="block text-dashboard-subtext mb-1 text-sm">Unit Price *</label>
                        <input
                          type="number"
                          id={`price_${index}`}
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          className="w-full bg-dashboard-panel text-dashboard-text border border-gray-700 rounded px-3 py-2"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-2 text-red-400 hover:text-red-300"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Add Item
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
                  >
                    Submit Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {/* Purchase Orders Table */}
        <div className="bg-dashboard-panel rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-dashboard-text">
              <thead className="bg-dashboard-dark border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4">PO #</th>
                  <th className="text-left py-3 px-4">Supplier</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Order Date</th>
                  <th className="text-left py-3 px-4">Delivery Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length > 0 ? (
                  purchaseOrders.map((order) => (
                    <tr key={order.po_id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                      <td className="py-3 px-4">{order.po_number}</td>
                      <td className="py-3 px-4">{order.supplier_name}</td>
                      <td className="py-3 px-4">{order.department_name}</td>
                      <td className="py-3 px-4">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(order.delivery_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{order.status}</td>
                      <td className="py-3 px-4 text-right">${typeof order.total_amount === 'number' ? order.total_amount.toFixed(2) : '0.00'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center text-dashboard-subtext">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
