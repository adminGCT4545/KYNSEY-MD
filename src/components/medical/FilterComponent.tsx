import React, { useState } from 'react';
import { Provider } from '../../services/resourceService';

interface FilterComponentProps {
  providers: Provider[];
  onFilterChange: (filters: {
    status?: string;
    type?: string;
    providerId?: number;
    search?: string;
  }) => void;
  appointmentTypes?: string[];
}

/**
 * Component for advanced filtering of appointments
 * Includes filters for status, type, provider, and search
 */
const FilterComponent: React.FC<FilterComponentProps> = ({
  providers,
  onFilterChange,
  appointmentTypes = ['Check-up', 'Consultation', 'Follow-up', 'Procedure', 'Surgery', 'Emergency']
}) => {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    providerId: '',
    search: ''
  });

  const handleFilterChange = (key: string, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Format filters for parent component
    const formattedFilters: Record<string, any> = {};
    
    if (newFilters.status) formattedFilters.status = newFilters.status;
    if (newFilters.type) formattedFilters.type = newFilters.type;
    if (newFilters.providerId) formattedFilters.providerId = Number(newFilters.providerId);
    if (newFilters.search) formattedFilters.search = newFilters.search;
    
    onFilterChange(formattedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: '',
      type: '',
      providerId: '',
      search: ''
    };
    
    setFilters(clearedFilters);
    onFilterChange({});
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'no-show', label: 'No Show' }
  ];

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="filter-component bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={handleClearFilters}
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment type filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type
          </label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">All Types</option>
            {appointmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Provider filter */}
        <div>
          <label htmlFor="provider-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            id="provider-filter"
            value={filters.providerId}
            onChange={(e) => handleFilterChange('providerId', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">All Providers</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                Dr. {provider.first_name} {provider.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search filter */}
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search-filter"
            type="text"
            placeholder="Search patients..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.status && (
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Status: {filters.status}
              <button 
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => handleFilterChange('status', '')}
              >
                ×
              </button>
            </div>
          )}
          
          {filters.type && (
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Type: {filters.type}
              <button 
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => handleFilterChange('type', '')}
              >
                ×
              </button>
            </div>
          )}
          
          {filters.providerId && (
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Provider: {providers.find(p => p.id === Number(filters.providerId))?.last_name || filters.providerId}
              <button 
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => handleFilterChange('providerId', '')}
              >
                ×
              </button>
            </div>
          )}
          
          {filters.search && (
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Search: {filters.search}
              <button 
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => handleFilterChange('search', '')}
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterComponent;