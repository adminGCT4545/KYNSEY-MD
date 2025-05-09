import React, { useState, useEffect } from 'react';
import { getProcurementSchedules, ProcurementSchedule } from '../services/dataService';

interface FilterOptions {
  supplierId: string;
  scheduledDelivery: string;
}

const ProcurementSchedules: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ProcurementSchedule[]>([]);
  const [filteredData, setFilteredData] = useState<ProcurementSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterOptions>({
    supplierId: '',
    scheduledDelivery: ''
  });
  
  // Unique values for filter dropdowns
  const [uniqueSuppliers, setUniqueSuppliers] = useState<{id: number, name: string}[]>([]);
  const [uniqueDeliveryTimes, setUniqueDeliveryTimes] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get data from the data service
        const data = await getProcurementSchedules();
        setScheduleData(data);
        setFilteredData(data);
        
        // Extract unique values for filters
        const suppliers = Array.from(new Set(data.map(item => ({ id: item.supplier_id, name: item.supplier_name }))));
        const deliveryTimes = Array.from(new Set(data.map(item => item.scheduled_delivery)));
        
        setUniqueSuppliers(suppliers);
        setUniqueDeliveryTimes(deliveryTimes);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever filters state changes
    applyFilters();
  }, [filters, scheduleData]);
  
  const applyFilters = () => {
    let result = [...scheduleData];
    
    if (filters.supplierId) {
      result = result.filter(schedule => schedule.supplier_id.toString() === filters.supplierId);
    }
    
    if (filters.scheduledDelivery) {
      result = result.filter(schedule => schedule.scheduled_delivery === filters.scheduledDelivery);
    }
    
    setFilteredData(result);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      supplierId: '',
      scheduledDelivery: ''
    });
  };
  
  const getStatusClass = (onTimeRate: number) => {
    if (onTimeRate >= 90) return 'text-green-400';
    if (onTimeRate >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getStatusText = (onTimeRate: number) => {
    if (onTimeRate >= 90) return 'Excellent';
    if (onTimeRate >= 75) return 'Good';
    return 'Poor';
  };

  if (isLoading) {
    return <div className="text-center p-10 text-dashboard-text">Loading procurement schedules...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-dashboard-header mb-4">Procurement Schedules</h1>
        
        {/* Filters */}
        <div className="bg-dashboard-panel rounded shadow p-4 mb-6">
          <h2 className="text-dashboard-header text-lg mb-4">Filter Schedules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="supplierId" className="block text-dashboard-subtext mb-1 text-sm">Supplier</label>
              <select
                id="supplierId"
                name="supplierId"
                className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                value={filters.supplierId}
                onChange={handleFilterChange}
              >
                <option value="">All Suppliers</option>
                {uniqueSuppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id.toString()}>{supplier.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="scheduledDelivery" className="block text-dashboard-subtext mb-1 text-sm">Scheduled Delivery Time</label>
              <select
                id="scheduledDelivery"
                name="scheduledDelivery"
                className="w-full bg-dashboard-dark text-dashboard-text border border-gray-700 rounded px-3 py-2"
                value={filters.scheduledDelivery}
                onChange={handleFilterChange}
              >
                <option value="">All Times</option>
                {uniqueDeliveryTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-dashboard-subtext text-sm">
              {Object.values(filters).some(value => value !== '') ? 
                'Filters applied. Showing filtered results.' : 
                'No filters applied. Showing all procurement schedules.'}
            </div>
            <button
              onClick={resetFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Procurement Schedule Table */}
        <div className="bg-dashboard-panel rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-dashboard-text">
              <thead className="bg-dashboard-dark border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4">Supplier ID</th>
                  <th className="text-left py-3 px-4">Supplier Name</th>
                  <th className="text-left py-3 px-4">Scheduled Delivery</th>
                  <th className="text-left py-3 px-4">Default Delay (Days)</th>
                  <th className="text-left py-3 px-4">Total Orders</th>
                  <th className="text-left py-3 px-4">Delayed Orders</th>
                  <th className="text-left py-3 px-4">Fulfillment Rate</th>
                  <th className="text-left py-3 px-4">On-Time Rate</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((schedule) => (
                    <tr key={schedule.supplier_id} className="border-b border-gray-700 hover:bg-dashboard-dark">
                      <td className="py-3 px-4">{schedule.supplier_id}</td>
                      <td className="py-3 px-4">{schedule.supplier_name}</td>
                      <td className="py-3 px-4">{schedule.scheduled_delivery}</td>
                      <td className="py-3 px-4">{schedule.default_delay_days}</td>
                      <td className="py-3 px-4">{schedule.total_orders}</td>
                      <td className="py-3 px-4">{schedule.delayed_orders}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-purple-500 h-2.5 rounded-full" 
                              style={{ width: `${schedule.avg_fulfillment_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{schedule.avg_fulfillment_rate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                schedule.on_time_rate >= 90 ? 'bg-green-500' : 
                                schedule.on_time_rate >= 75 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${schedule.on_time_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{schedule.on_time_rate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${getStatusClass(schedule.on_time_rate)}`}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            schedule.on_time_rate >= 90 ? 'bg-green-400' : 
                            schedule.on_time_rate >= 75 ? 'bg-yellow-400' : 
                            'bg-red-400'
                          }`}></div>
                          {getStatusText(schedule.on_time_rate)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 text-center text-dashboard-subtext">
                      No procurement schedules found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-700 flex justify-between items-center">
            <div className="text-dashboard-subtext text-sm">
              Showing {filteredData.length} of {scheduleData.length} procurement schedules
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementSchedules;
