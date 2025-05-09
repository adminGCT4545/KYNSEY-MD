import React from 'react';

interface AppointmentCardProps {
  appointment: {
    id: number;
    patientName: string;
    time: string;
    duration: number;
    type: string;
    status: string;
    operatory: string;
    provider: string;
    notes?: string;
    phone?: string;
    isNew: boolean;
  };
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  // Get status color based on appointment status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format time for display (e.g., "9:00 AM")
  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (err) {
      return time;
    }
  };

  // Format duration for display (e.g., "1 hr 30 min")
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} hr ${remainingMinutes} min`;
    } else if (hours > 0) {
      return `${hours} hr`;
    } else {
      return `${remainingMinutes} min`;
    }
  };

  return (
    <div className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header with time and status */}
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-gray-900">
          {formatTime(appointment.time)} ({formatDuration(appointment.duration)})
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
      
      {/* Patient name with new indicator if applicable */}
      <div className="flex items-center mb-2">
        <div className="font-semibold text-gray-800">
          {appointment.patientName}
          {appointment.isNew && (
            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              New
            </span>
          )}
        </div>
      </div>
      
      {/* Appointment details */}
      <div className="text-sm text-gray-600 mb-2">
        <div>{appointment.type}</div>
        <div>{appointment.provider}</div>
        {appointment.phone && <div>{appointment.phone}</div>}
      </div>
      
      {/* Notes if available */}
      {appointment.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <p className="line-clamp-2">{appointment.notes}</p>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
        <button className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
          Details
        </button>
        <button className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
          Check In
        </button>
        <button className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none">
          Reschedule
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
