import React, { useEffect } from 'react';
import { Appointment } from '../../services/appointmentService';
import AppointmentForm from './AppointmentForm';

interface AppointmentModalProps {
  isOpen: boolean;
  appointmentId?: number;
  initialDate?: Date;
  initialLocationId?: number;
  initialOperatoryId?: number;
  initialProviderId?: number;
  onSave: (appointment: Appointment) => void;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  appointmentId,
  initialDate,
  initialLocationId,
  initialOperatoryId,
  initialProviderId,
  onSave,
  onClose
}) => {
  // Handle escape key to close the modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Prepare initial data for the form
  const initialData: any = {};
  
  if (initialDate) {
    initialData.appointment_date = initialDate.toISOString().split('T')[0];
  }
  
  if (initialLocationId) {
    initialData.location_id = initialLocationId;
  }
  
  if (initialOperatoryId) {
    initialData.operatory_id = initialOperatoryId;
  }
  
  if (initialProviderId) {
    initialData.provider_id = initialProviderId;
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 px-6 py-3 flex justify-between items-center border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {appointmentId ? 'Edit Appointment' : 'New Appointment'}
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <AppointmentForm
            appointmentId={appointmentId}
            initialData={initialData}
            onSave={(appointment) => {
              onSave(appointment);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;