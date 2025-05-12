import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, faCalendarTimes, faCalendarDay, 
  faSpinner, faCheckCircle, faBan, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

interface AppointmentStatus {
  id: string;
  name: string;
}

interface StatusFilterProps {
  statuses: AppointmentStatus[];
  selectedStatuses: string[];
  onStatusSelectionChange: (selectedIds: string[]) => void;
}

/**
 * Component for filtering appointments by status
 */
const StatusFilter: React.FC<StatusFilterProps> = ({ 
  statuses, 
  selectedStatuses, 
  onStatusSelectionChange 
}) => {
  
  const toggleStatus = (statusId: string) => {
    if (selectedStatuses.includes(statusId)) {
      onStatusSelectionChange(selectedStatuses.filter(id => id !== statusId));
    } else {
      onStatusSelectionChange([...selectedStatuses, statusId]);
    }
  };
  
  const selectAll = () => {
    onStatusSelectionChange(statuses.map(s => s.id));
  };
  
  const clearAll = () => {
    onStatusSelectionChange([]);
  };

  // Helper to get the appropriate icon for each status
  const getStatusIcon = (statusId: string) => {
    switch(statusId) {
      case 'scheduled':
        return faCalendarDay;
      case 'confirmed':
        return faCalendarCheck;
      case 'arrived':
        return faCheckCircle;
      case 'in-progress':
        return faSpinner;
      case 'completed':
        return faCheckCircle;
      case 'cancelled':
        return faBan;
      case 'no-show':
        return faExclamationTriangle;
      default:
        return faCalendarDay;
    }
  };

  // Helper to get the appropriate color for each status
  const getStatusColor = (statusId: string) => {
    switch(statusId) {
      case 'scheduled':
        return 'gray';
      case 'confirmed':
        return 'blue';
      case 'arrived':
        return 'green';
      case 'in-progress':
        return 'purple';
      case 'completed':
        return 'teal';
      case 'cancelled':
        return 'red';
      case 'no-show':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <div
      className="status-filter p-4 bg-white rounded-lg shadow"
      role="group"
      aria-labelledby="status-filter-label"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 id="status-filter-label" className="text-sm font-medium text-gray-700">Status Filter</h2>
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Select all status filters"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Clear all status filters"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div
        className="flex flex-wrap gap-3"
        role="group"
        aria-label="Status filter options"
      >
        {statuses.map(status => {
          const color = getStatusColor(status.id);
          const isSelected = selectedStatuses.includes(status.id);
          return (
            <button
              key={status.id}
              onClick={() => toggleStatus(status.id)}
              className={`
                flex items-center px-3 py-2 rounded-full cursor-pointer transition-colors
                focus:outline-none focus:ring-2 focus:ring-${color}-500
                ${isSelected
                  ? `bg-${color}-100 text-${color}-800 border border-${color}-300`
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                }
              `}
              role="switch"
              aria-checked={isSelected}
              aria-label={`Filter by ${status.name} status`}
            >
              <FontAwesomeIcon icon={getStatusIcon(status.id)} className="mr-2" aria-hidden="true" />
              <span>{status.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFilter;
