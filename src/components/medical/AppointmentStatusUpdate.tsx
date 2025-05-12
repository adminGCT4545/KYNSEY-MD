import React, { useState } from 'react';
import appointmentService from '../../services/appointmentService';

interface AppointmentStatusUpdateProps {
  appointmentId: number;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const AppointmentStatusUpdate: React.FC<AppointmentStatusUpdateProps> = ({
  appointmentId,
  currentStatus,
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-gray-100 text-gray-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'arrived', label: 'Arrived', color: 'bg-green-100 text-green-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'no-show', label: 'No Show', color: 'bg-red-50 text-red-600' }
  ];
  
  const currentStatusObj = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];
  
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      onStatusChange(newStatus);
    } catch (error) {
      console.error(`Error updating appointment status to ${newStatus}:`, error);
      alert('Failed to update appointment status. Please try again.');
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };
  
  return (
    <div className="relative">
      <div className="inline-block">
        <button
          type="button"
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${currentStatusObj.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{currentStatusObj.label}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="listbox"
        >
          <div className="py-1" role="none">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${
                  option.value === currentStatus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900`}
                role="option"
                aria-selected={option.value === currentStatus}
                onClick={() => handleStatusChange(option.value)}
                disabled={isUpdating}
              >
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${option.color.replace('text-', 'bg-')}`}></span>
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusUpdate;