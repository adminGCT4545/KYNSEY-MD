import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Appointment } from '../../types/medical';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faEdit, faTimes, faCheck, faClock,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  onViewAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (appointmentId: string, newStatus: string) => void;
}

const ROW_HEIGHT = 80;

const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  isLoading,
  onViewAppointment,
  onEditAppointment,
  onUpdateStatus
}) => {
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';

    switch(status) {
      case 'scheduled':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'confirmed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'arrived':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'in-progress':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'completed':
        bgColor = 'bg-teal-100';
        textColor = 'text-teal-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'no-show':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderActionButtons = (appointment: Appointment) => {
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => onViewAppointment(appointment)}
          className="text-blue-600 hover:text-blue-800"
          title="View Details"
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
        <button
          onClick={() => onEditAppointment(appointment)}
          className="text-green-600 hover:text-green-800"
          title="Edit Appointment"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
          <button
            onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
            className="text-red-600 hover:text-red-800"
            title="Cancel Appointment"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        ) : null}
        {appointment.status === 'scheduled' ? (
          <button
            onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
            className="text-blue-600 hover:text-blue-800"
            title="Confirm Appointment"
          >
            <FontAwesomeIcon icon={faCheck} />
          </button>
        ) : null}
        {appointment.status === 'confirmed' ? (
          <button
            onClick={() => onUpdateStatus(appointment.id, 'arrived')}
            className="text-green-600 hover:text-green-800"
            title="Mark as Arrived"
          >
            <FontAwesomeIcon icon={faClock} />
          </button>
        ) : null}
      </div>
    );
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const appointment = appointments[index];
    
    return (
      <div 
        style={style} 
        className="flex items-center px-6 border-b border-gray-200 hover:bg-gray-50"
      >
        <div className="flex-1 grid grid-cols-6 gap-4">
          <div className="col-span-1">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(appointment.date)}
            </div>
            <div className="text-sm text-gray-500">
              {appointment.startTime} - {appointment.endTime}
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-sm font-medium text-gray-900">
              {appointment.patientName}
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-sm text-gray-900">
              {appointment.providerName}
            </div>
            <div className="text-xs text-gray-500">
              {appointment.locationName}
            </div>
          </div>
          <div className="col-span-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${appointment.appointmentTypeColor}-100 text-${appointment.appointmentTypeColor}-800`}>
              {appointment.appointmentTypeName}
            </span>
          </div>
          <div className="col-span-1">
            {renderStatusBadge(appointment.status)}
          </div>
          <div className="col-span-1">
            {renderActionButtons(appointment)}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} className="text-blue-500 text-3xl animate-spin" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No appointments found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full">
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            itemCount={appointments.length}
            itemSize={ROW_HEIGHT}
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default AppointmentTable;