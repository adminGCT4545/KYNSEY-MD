import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd } from '@fortawesome/free-solid-svg-icons';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  color?: string; // For color coding providers
}

interface ProviderFilterProps {
  providers: Provider[];
  selectedProviders: string[];
  onProviderSelectionChange: (selectedIds: string[]) => void;
}

/**
 * Component for filtering appointments by healthcare provider
 */
const ProviderFilter: React.FC<ProviderFilterProps> = ({ 
  providers, 
  selectedProviders, 
  onProviderSelectionChange 
}) => {
  
  const toggleProvider = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onProviderSelectionChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onProviderSelectionChange([...selectedProviders, providerId]);
    }
  };
  
  const selectAll = () => {
    onProviderSelectionChange(providers.map(p => p.id));
  };
  
  const clearAll = () => {
    onProviderSelectionChange([]);
  };

  return (
    <div
      className="provider-filter mb-6 p-4 bg-white rounded-lg shadow"
      role="group"
      aria-labelledby="provider-filter-label"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 id="provider-filter-label" className="text-sm font-medium text-gray-700">Provider Filter</h2>
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            aria-label="Select all providers"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            aria-label="Clear provider selection"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div
        className="flex flex-wrap gap-3"
        role="group"
        aria-label="Provider filter options"
      >
        {providers.map(provider => {
          const isSelected = selectedProviders.includes(provider.id);
          return (
            <button
              key={provider.id}
              onClick={() => toggleProvider(provider.id)}
              className={`
                flex items-center px-3 py-2 rounded-full cursor-pointer transition-colors
                focus:outline-none focus:ring-2 focus:ring-${provider.color || 'blue'}-500
                ${isSelected
                  ? `bg-${provider.color || 'blue'}-100 text-${provider.color || 'blue'}-800 border border-${provider.color || 'blue'}-300`
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }
              `}
              role="switch"
              aria-checked={isSelected}
              aria-label={`Filter by ${provider.name}, ${provider.specialty}`}
            >
              <FontAwesomeIcon icon={faUserMd} className="mr-2" aria-hidden="true" />
              <span>{provider.name}</span>
              <span className="text-xs ml-1 text-gray-500">({provider.specialty})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderFilter;
