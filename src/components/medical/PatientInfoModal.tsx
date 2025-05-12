import React, { useEffect, useState } from 'react';
import { Appointment, useAppointments } from '../../services/appointmentService';

interface PatientInfoModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onStatusChange?: (id: number | string, status: string) => void;
}

/**
 * Modal for displaying patient information and appointment history
 */
const PatientInfoModal: React.FC<PatientInfoModalProps> = ({
  appointment,
  onClose,
  onStatusChange
}) => {
  const patientId = appointment?.patient_id;
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  
  // Get appointment history for this patient
  const { 
    data: patientAppointments, 
    loading: loadingAppointments 
  } = useAppointments(
    patientId ? { patientId } : {}
  );

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...patientAppointments].sort((a, b) => {
    const dateA = new Date(`${a.appointment_date}T${a.start_time}`);
    const dateB = new Date(`${b.appointment_date}T${b.start_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Format date string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time string
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Patient Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-blue-50">
          <h3 className="text-lg font-medium">{appointment.patient_name}</h3>
          <div className="flex flex-wrap mt-2 text-sm text-gray-600">
            <div className="w-full sm:w-1/2 mb-2">
              <span className="font-medium">Appointment Date:</span> {formatDate(appointment.appointment_date)}
            </div>
            <div className="w-full sm:w-1/2 mb-2">
              <span className="font-medium">Time:</span> {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </div>
            <div className="w-full sm:w-1/2 mb-2">
              <span className="font-medium">Provider:</span> {appointment.provider_name || 'Not assigned'}
            </div>
            <div className="w-full sm:w-1/2 mb-2">
              <span className="font-medium">Status:</span> {appointment.status}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appointment Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Patient History
            </button>
          </nav>
        </div>

        <div className="p-4 min-h-[300px] max-h-[400px] overflow-auto">
          {activeTab === 'details' ? (
            <div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Appointment Type</h4>
                <p>{appointment.appointment_type}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Reason for Visit</h4>
                <p>{appointment.reason_for_visit || 'Not specified'}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
                <p className="whitespace-pre-wrap">{appointment.notes || 'No notes available'}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Insurance Verified</h4>
                <p>{appointment.insurance_verified ? 'Yes' : 'No'}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['pending', 'confirmed', 'arrived', 'in-progress', 'completed', 'canceled', 'no-show'].map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusChange && onStatusChange(appointment.id, status)}
                      className={`px-3 py-1 text-sm rounded capitalize
                        ${appointment.status === status 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Appointment History</h4>
              
              {loadingAppointments ? (
                <div className="flex justify-center items-center h-40">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : sortedAppointments.length === 0 ? (
                <p className="text-gray-500">No appointment history found.</p>
              ) : (
                <div className="space-y-4">
                  {sortedAppointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className={`p-3 border rounded ${
                        apt.id === appointment.id ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{formatDate(apt.appointment_date)}</div>
                        <div className={`text-sm px-2 py-0.5 rounded-full ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Type: {apt.appointment_type}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Provider: {apt.provider_name || 'Not assigned'}
                      </div>
                      {apt.notes && (
                        <div className="text-sm text-gray-600 mt-2 border-t pt-1">
                          {apt.notes.length > 100 ? `${apt.notes.substring(0, 100)}...` : apt.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded mr-2"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Edit Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoModal;