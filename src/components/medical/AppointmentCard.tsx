import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Appointment } from '../../services/appointmentService';
import { format, parseISO } from 'date-fns';

interface AppointmentCardProps {
  appointment: Appointment;
  allowDrag?: boolean;
  compact?: boolean;
  showOperatory?: boolean;
  onClick?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  allowDrag = true,
  compact = false,
  showOperatory = false,
  onClick
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Calculate appointment duration in minutes
  const getDurationMinutes = () => {
    const startParts = appointment.start_time.split(':');
    const endParts = appointment.end_time.split(':');
    
    const startMinutes = (parseInt(startParts[0]) * 60) + parseInt(startParts[1]);
    const endMinutes = (parseInt(endParts[0]) * 60) + parseInt(endParts[1]);
    
    return endMinutes - startMinutes;
  };
  
  const durationMinutes = getDurationMinutes();
  
  // Setup drag functionality
  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: 'APPOINTMENT',
    item: () => ({ 
      id: appointment.id, 
      patientName: appointment.patient_name,
      time: appointment.start_time
    }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => allowDrag && !modalOpen,
  });

  // Format appointment time for display
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeStr;
    }
  };

  // Get CSS classes based on appointment status
  const getStatusClasses = () => {
    const baseClass = 'rounded-full px-2 py-0.5 text-xs font-medium';
    
    switch (appointment.status.toLowerCase()) {
      case 'confirmed':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'scheduled':
        return `${baseClass} bg-gray-100 text-gray-800`;
      case 'arrived':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'in-progress':
        return `${baseClass} bg-purple-100 text-purple-800`;
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'no-show':
        return `${baseClass} bg-orange-100 text-orange-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };
  
  // Handle click events
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(appointment);
    } else {
      setModalOpen(true);
    }
  };
  
  // Apply drag reference to the card element
  useEffect(() => {
    if (cardRef.current) {
      previewRef(cardRef.current);
      if (allowDrag) {
        dragRef(cardRef.current);
      }
    }
  }, [dragRef, previewRef, allowDrag]);

  // Render the compact version of the appointment card
  if (compact) {
    return (
      <div
        ref={cardRef}
        className={`appointment-card-compact p-1.5 mb-1 rounded border border-gray-200 bg-white
          ${isDragging ? 'opacity-50' : ''}
          ${allowDrag ? 'cursor-grab' : ''}
          transition-all duration-150 ease-in-out`}
        onClick={handleClick}
        aria-label={`Appointment for ${appointment.patient_name} at ${formatTime(appointment.start_time)}`}
        tabIndex={0}
        role="button"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium truncate">
            {formatTime(appointment.start_time)}
          </span>
          <span className={getStatusClasses()}>
            {appointment.status}
          </span>
        </div>
        <div className="text-sm truncate">{appointment.patient_name}</div>
      </div>
    );
  }

  // Render the full appointment card
  return (
    <div
      ref={cardRef}
      className={`appointment-card p-3 mb-2 rounded-lg shadow-sm border-l-4
        ${isDragging ? 'opacity-50 shadow-md' : ''}
        ${allowDrag ? 'cursor-grab active:cursor-grabbing' : ''}
        ${appointment.status === 'cancelled' ? 'border-l-red-500 bg-red-50' : 
          appointment.status === 'confirmed' ? 'border-l-blue-500 bg-white' : 
          appointment.status === 'arrived' ? 'border-l-yellow-500 bg-white' :
          appointment.status === 'in-progress' ? 'border-l-purple-500 bg-white' :
          appointment.status === 'completed' ? 'border-l-green-500 bg-white' :
          'border-l-gray-500 bg-white'}
        transition-all duration-200 ease-in-out hover:shadow-md`}
      onClick={handleClick}
      aria-label={`Appointment for ${appointment.patient_name} at ${formatTime(appointment.start_time)}`}
      tabIndex={0}
      role="button"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-900">
          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
          <span className="ml-1 text-xs text-gray-500">({durationMinutes} min)</span>
        </span>
        <span className={getStatusClasses()}>
          {appointment.status}
        </span>
      </div>
      
      <div className="font-medium mb-1 truncate">
        {appointment.patient_name || `Patient #${appointment.patient_id}`}
      </div>
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>{appointment.appointment_type}</span>
        <span>{appointment.provider_name || `Dr. #${appointment.provider_id}`}</span>
      </div>
      
      {appointment.reason_for_visit && (
        <div className="mt-1.5 text-xs text-gray-500 truncate">
          <span className="font-medium">Reason:</span> {appointment.reason_for_visit}
        </div>
      )}

      {showOperatory && appointment.operatory && (
        <div className="mt-1.5 text-xs text-gray-500 truncate">
          <span className="font-medium">Operatory:</span> {appointment.operatory}
        </div>
      )}
      
      {modalOpen && (
        <div className="appointment-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Appointment Details</h3>
            <p><strong>Patient:</strong> {appointment.patient_name}</p>
            <p><strong>Time:</strong> {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</p>
            <p><strong>Type:</strong> {appointment.appointment_type}</p>
            <p><strong>Provider:</strong> {appointment.provider_name}</p>
            <p><strong>Status:</strong> {appointment.status}</p>
            {appointment.reason_for_visit && (
              <p><strong>Reason:</strong> {appointment.reason_for_visit}</p>
            )}
            {showOperatory && appointment.operatory && (
              <p><strong>Operatory:</strong> {appointment.operatory}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AppointmentCard);
