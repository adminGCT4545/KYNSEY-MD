import React from 'react';

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

// Status options with labels and colors
const statusOptions = [
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'arrived', label: 'Arrived', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'no-show', label: 'No Show', color: 'bg-gray-100 text-gray-800 border-gray-200' }
];

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatuses, onStatusChange }) => {
  // Toggle a status in the selected statuses array
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  // Select all statuses
  const selectAll = () => {
    onStatusChange(statusOptions.map(option => option.value));
  };

  // Clear all selected statuses
  const clearAll = () => {
    onStatusChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Filter by Status</h3>
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => toggleStatus(option.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full border ${
              selectedStatuses.includes(option.value)
                ? option.color
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
            {selectedStatuses.includes(option.value) && (
              <span className="ml-1">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
