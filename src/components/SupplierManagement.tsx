import React, { useState, useEffect } from 'react';

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [expiringCertifications, setExpiringCertifications] = useState<any[]>([]);
  const [highRiskSuppliers, setHighRiskSuppliers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch overview data
        const overviewResponse = await fetch('/api/supplier-management/dashboard/overview');
        if (!overviewResponse.ok) throw new Error('Failed to fetch overview data');
        const overviewData = await overviewResponse.json();

        // Fetch suppliers
        const suppliersResponse = await fetch('/api/supplier-management/suppliers');
        if (!suppliersResponse.ok) throw new Error('Failed to fetch suppliers');
        const suppliersData = await suppliersResponse.json();

        // Update state with fetched data
        setSuppliers(suppliersData);
        setSupplierPerformance(overviewData.performance || []);
        setExpiringContracts(overviewData.contracts?.expiring || []);
        setExpiringCertifications(overviewData.certifications?.expiring || []);
        setHighRiskSuppliers(overviewData.risk?.highRiskSuppliers || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (dateString: string) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return <div className="text-center p-10 text-dashboard-text">Loading supplier management data...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 px-2">
        <h1 className="text-xl font-medium text-dashboard-header">Supplier Management</h1>
      </div>
      
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-3">Supplier Overview</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-dashboard-subtext">Total Suppliers:</div>
            <div className="text-dashboard-text text-right">{suppliers.length}</div>
            
            <div className="text-dashboard-subtext">Active Suppliers:</div>
            <div className="text-dashboard-text text-right">
              {suppliers.filter(s => s.supplier_status === 'active').length}
            </div>
            
            <div className="text-dashboard-subtext">Pending Suppliers:</div>
            <div className="text-dashboard-text text-right">
              {suppliers.filter(s => s.supplier_status === 'pending').length}
            </div>
            
            <div className="text-dashboard-subtext">Inactive Suppliers:</div>
            <div className="text-dashboard-text text-right">
              {suppliers.filter(s => s.supplier_status === 'inactive').length}
            </div>
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-3">Contract Status</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-dashboard-subtext">Expiring Contracts:</div>
            <div className="text-dashboard-text text-right text-yellow-400">
              {expiringContracts.length}
            </div>
            
            <div className="text-dashboard-subtext">Next Expiry:</div>
            <div className="text-dashboard-text text-right">
              {expiringContracts.length > 0 ? formatDate(expiringContracts[0].end_date) : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-3">Risk Overview</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-dashboard-subtext">High Risk Suppliers:</div>
            <div className="text-dashboard-text text-right text-red-400">
              {highRiskSuppliers.length}
            </div>
            
            <div className="text-dashboard-subtext">Expiring Certifications:</div>
            <div className="text-dashboard-text text-right text-yellow-400">
              {expiringCertifications.length}
            </div>
          </div>
        </div>
        
        <div className="bg-dashboard-panel rounded shadow p-4">
          <h2 className="text-dashboard-header text-lg mb-3">Performance Overview</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-dashboard-subtext">Avg. Quality Score:</div>
          <div className="text-dashboard-text text-right">
            {supplierPerformance.length > 0 
              ? (supplierPerformance.reduce((sum, perf) => {
                  const score = typeof perf.avg_quality_score === 'number' ? perf.avg_quality_score : 
                                (typeof perf.quality_score === 'number' ? perf.quality_score : 0);
                  return sum + score;
                }, 0) / supplierPerformance.length).toFixed(1)
              : 'N/A'}
          </div>
          
          <div className="text-dashboard-subtext">Avg. Delivery Score:</div>
          <div className="text-dashboard-text text-right">
            {supplierPerformance.length > 0 
              ? (supplierPerformance.reduce((sum, perf) => {
                  const score = typeof perf.avg_delivery_score === 'number' ? perf.avg_delivery_score : 
                                (typeof perf.delivery_score === 'number' ? perf.delivery_score : 0);
                  return sum + score;
                }, 0) / supplierPerformance.length).toFixed(1)
              : 'N/A'}
          </div>
          
          <div className="text-dashboard-subtext">Avg. Overall Score:</div>
          <div className="text-dashboard-text text-right">
            {supplierPerformance.length > 0 
              ? (supplierPerformance.reduce((sum, perf) => {
                  const score = typeof perf.avg_overall_score === 'number' ? perf.avg_overall_score : 
                                (typeof perf.overall_score === 'number' ? perf.overall_score : 0);
                  return sum + score;
                }, 0) / supplierPerformance.length).toFixed(1)
              : 'N/A'}
          </div>
          </div>
        </div>
      </div>
      
      {/* Alerts Section */}
      <div className="bg-dashboard-panel rounded shadow p-4 mb-6">
        <h2 className="text-dashboard-header text-lg mb-4">Alerts & Notifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Expiring Contracts */}
          <div className="bg-dashboard-dark rounded p-3">
            <h3 className="text-dashboard-subtext text-sm mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Expiring Contracts
            </h3>
            <ul className="divide-y divide-gray-700">
              {expiringContracts.slice(0, 3).map((item) => (
                <li key={item.contract_id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="text-dashboard-text">{item.supplier_name}</span>
                    <span className="text-yellow-400 text-sm">
                      {getDaysUntilExpiry(item.end_date)} days
                    </span>
                  </div>
                  <div className="text-dashboard-subtext text-sm">
                    Contract: {item.contract_number}
                  </div>
                </li>
              ))}
              {expiringContracts.length === 0 && (
                <li className="py-2 text-dashboard-subtext text-center">No expiring contracts</li>
              )}
            </ul>
          </div>
          
          {/* Expiring Certifications */}
          <div className="bg-dashboard-dark rounded p-3">
            <h3 className="text-dashboard-subtext text-sm mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Expiring Certifications
            </h3>
            <ul className="divide-y divide-gray-700">
              {expiringCertifications.slice(0, 3).map((item) => (
                <li key={item.certification_id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="text-dashboard-text">{item.supplier_name}</span>
                    <span className="text-yellow-400 text-sm">
                      {getDaysUntilExpiry(item.expiry_date)} days
                    </span>
                  </div>
                  <div className="text-dashboard-subtext text-sm">
                    {item.certification_name}
                  </div>
                </li>
              ))}
              {expiringCertifications.length === 0 && (
                <li className="py-2 text-dashboard-subtext text-center">No expiring certifications</li>
              )}
            </ul>
          </div>
          
          {/* High Risk Suppliers */}
          <div className="bg-dashboard-dark rounded p-3">
            <h3 className="text-dashboard-subtext text-sm mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              High Risk Suppliers
            </h3>
            <ul className="divide-y divide-gray-700">
              {highRiskSuppliers.slice(0, 3).map((item) => (
                <li key={item.supplier_id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="text-dashboard-text">{item.supplier_name}</span>
                    <span className={`text-sm ${item.risk_level === 'high' ? 'text-red-400' : 'text-purple-400'}`}>
                      {item.risk_level && item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1) || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-dashboard-subtext text-sm">
                    Score: {item.overall_risk_score && typeof item.overall_risk_score === 'number' ? item.overall_risk_score.toFixed(1) : 'N/A'}
                  </div>
                </li>
              ))}
              {highRiskSuppliers.length === 0 && (
                <li className="py-2 text-dashboard-subtext text-center">No high risk suppliers</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Supplier List */}
      <div className="bg-dashboard-panel rounded shadow p-4 mb-6">
        <h2 className="text-dashboard-header text-lg mb-4">Supplier Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-dashboard-text">
            <thead className="bg-dashboard-dark border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Supplier Name</th>
                <th className="text-left py-3 px-4">Country</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Financial Score</th>
                <th className="text-left py-3 px-4">Contact</th>
                <th className="text-left py-3 px-4">Onboarding Date</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.slice(0, 10).map((supplier) => (
                <tr key={supplier.supplier_id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                  <td className="py-3 px-4">{supplier.supplier_name}</td>
                  <td className="py-3 px-4">{supplier.country}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      supplier.supplier_status === 'active' ? 'bg-green-100 text-green-800' :
                      supplier.supplier_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      supplier.supplier_status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {supplier.supplier_status ? supplier.supplier_status.charAt(0).toUpperCase() + supplier.supplier_status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{supplier.financial_stability_score && typeof supplier.financial_stability_score === 'number' ? supplier.financial_stability_score.toFixed(1) : 'N/A'}</td>
                  <td className="py-3 px-4">{supplier.contact_name}</td>
                  <td className="py-3 px-4">{formatDate(supplier.onboarding_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="bg-dashboard-panel rounded shadow p-4 mb-6">
        <h2 className="text-dashboard-header text-lg mb-4">Performance Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-dashboard-text">
            <thead className="bg-dashboard-dark border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Supplier Name</th>
                <th className="text-left py-3 px-4">Quality</th>
                <th className="text-left py-3 px-4">Delivery</th>
                <th className="text-left py-3 px-4">Responsiveness</th>
                <th className="text-left py-3 px-4">Cost</th>
                <th className="text-left py-3 px-4">Overall</th>
                <th className="text-left py-3 px-4">Category</th>
              </tr>
            </thead>
            <tbody>
              {supplierPerformance.slice(0, 10).map((perf) => (
                <tr key={perf.supplier_id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                  <td className="py-3 px-4">{perf.supplier_name}</td>
                  <td className="py-3 px-4">{
                    (perf.avg_quality_score && typeof perf.avg_quality_score === 'number') ? 
                      perf.avg_quality_score.toFixed(1) : 
                    (perf.quality_score && typeof perf.quality_score === 'number') ? 
                      perf.quality_score.toFixed(1) : 'N/A'
                  }</td>
                  <td className="py-3 px-4">{
                    (perf.avg_delivery_score && typeof perf.avg_delivery_score === 'number') ? 
                      perf.avg_delivery_score.toFixed(1) : 
                    (perf.delivery_score && typeof perf.delivery_score === 'number') ? 
                      perf.delivery_score.toFixed(1) : 'N/A'
                  }</td>
                  <td className="py-3 px-4">{
                    (perf.avg_responsiveness_score && typeof perf.avg_responsiveness_score === 'number') ? 
                      perf.avg_responsiveness_score.toFixed(1) : 
                    (perf.responsiveness_score && typeof perf.responsiveness_score === 'number') ? 
                      perf.responsiveness_score.toFixed(1) : 'N/A'
                  }</td>
                  <td className="py-3 px-4">{
                    (perf.avg_cost_score && typeof perf.avg_cost_score === 'number') ? 
                      perf.avg_cost_score.toFixed(1) : 
                    (perf.cost_score && typeof perf.cost_score === 'number') ? 
                      perf.cost_score.toFixed(1) : 'N/A'
                  }</td>
                  <td className="py-3 px-4">{
                    (perf.avg_overall_score && typeof perf.avg_overall_score === 'number') ? 
                      perf.avg_overall_score.toFixed(1) : 
                    (perf.overall_score && typeof perf.overall_score === 'number') ? 
                      perf.overall_score.toFixed(1) : 'N/A'
                  }</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      perf.performance_category === 'Excellent' ? 'bg-green-100 text-green-800' :
                      perf.performance_category === 'Good' ? 'bg-blue-100 text-blue-800' :
                      perf.performance_category === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {perf.performance_category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement;
