import React from 'react';
import { Appointment } from '../../services/appointmentService';
import { Operatory } from '../../services/resourceService';
import AppointmentCard from './AppointmentCard';

interface OperatoryColumnProps {
  operatory: Pick<Operatory, 'id' | 'name' | 'location_id' | 'is_active'>;
  appointments: Appointment[];
  showAddButton?: boolean;
  onAddAppointment?: (operatoryId: number) => void;
  onViewAppointment: (appointmentId: number) => void;
  onRescheduleAppointment?: (appointmentId: number) => void;
  onCancelAppointment?: (appointmentId: number) => void;
  onStatusChange: (appointmentId: number, newStatus: string) => void;
}

const OperatoryColumn: React.FC<OperatoryColumnProps> = ({
  operatory,
  appointments,
  showAddButton = true,
  onAddAppointment,
  onViewAppointment,
  onRescheduleAppointment,
  onCancelAppointment,
  onStatusChange,
}) => {
  return (
    <section 
      className="bg-gray-50 rounded-lg p-4 shadow-sm"
      aria-labelledby={`operatory-${operatory.id}-heading`}
    >
      <h3 
        id={`operatory-${operatory.id}-heading`}
        className="font-medium text-lg mb-4 pb-2 border-b border-gray-200 flex items-center"
      >
        <svg className="h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {operatory.name}
      </h3>
      
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onView={onViewAppointment}
              onReschedule={onRescheduleAppointment}
              onCancel={onCancelAppointment}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div
            className="text-center py-8 text-gray-500"
            role="status"
            aria-label={`No appointments scheduled for ${operatory.name}`}
          >
            No appointments
          </div>
        )}
      </div>
      
      {showAddButton && (
        <button
          className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => onAddAppointment && onAddAppointment(operatory.id)}
          aria-label={`Add new appointment to ${operatory.name}`}
        >
          <div className="text-gray-400">
            <svg className="h-6 w-6 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="mt-1">Add Appointment</p>
          </div>
        </button>
      )}
    </section>
  );
};

export default OperatoryColumn;
