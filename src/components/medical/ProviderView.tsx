import React, { useMemo } from 'react';
import { Appointment } from '../../services/appointmentService';
import AppointmentCard from './AppointmentCard';

interface ProviderViewProps {
  provider: {
    id: number;
    name: string;
    appointments?: Appointment[];
  };
  appointments?: Appointment[];
}

const ProviderView: React.FC<ProviderViewProps> = ({ provider, appointments: propAppointments }) => {
  // Use appointments from either provider object or direct prop, ensure it's an array
  const appointmentsToUse = useMemo(() => {
    return provider.appointments || propAppointments || [];
  }, [provider.appointments, propAppointments]);

  // Sort appointments by start time
  const sortedAppointments = useMemo(() => {
    if (!appointmentsToUse || appointmentsToUse.length === 0) {
      return [];
    }
    return [...appointmentsToUse].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  }, [appointmentsToUse]);

  // Group appointments by status for better visual organization
  const appointmentsByStatus = useMemo(() => {
    const groups: Record<string, typeof sortedAppointments> = {
      active: [],
      completed: [],
      cancelled: []
    };
    
    sortedAppointments.forEach(appointment => {
      if (appointment.status === 'completed') {
        groups.completed.push(appointment);
      } else if (appointment.status === 'cancelled' || appointment.status === 'no-show') {
        groups.cancelled.push(appointment);
      } else {
        groups.active.push(appointment);
      }
    });
    
    return groups;
  }, [sortedAppointments]);

  // Calculate utilization rate for this provider
  const utilizationRate = useMemo(() => {
    const totalAppointments = appointmentsToUse.length;
    const completedAppointments = appointmentsToUse.filter(
      apt => apt.status === 'completed'
    ).length;
    
    return totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 0;
  }, [appointmentsToUse]);
  
  return (
    <div 
      className="provider-view border rounded-lg shadow-sm p-4"
      aria-label={`Provider ${provider.name}`}
      role="region"
    >
      <div className="provider-header border-b pb-2 mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{provider.name}</h3>
          <p className="text-sm text-gray-500">
            {appointmentsToUse.length} appointment{appointmentsToUse.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Utilization indicator */}
        <div className="flex items-center">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                utilizationRate > 75 ? 'bg-green-500' : 
                utilizationRate > 50 ? 'bg-yellow-500' : 
                utilizationRate > 25 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${utilizationRate}%` }}
            />
          </div>
          <span className="ml-2 text-xs text-gray-500">{utilizationRate}%</span>
        </div>
      </div>
      
      <div className="provider-body space-y-4">
        {/* Active appointments */}
        {appointmentsByStatus.active.length > 0 && (
          <div className="appointment-group mb-2">
            {appointmentsByStatus.active.map(appointment => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                allowDrag={true}
                showOperatory={true}
              />
            ))}
          </div>
        )}
        
        {/* Completed appointments */}
        {appointmentsByStatus.completed.length > 0 && (
          <div className="completed-appointments">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Completed</h4>
            <div className="appointment-group opacity-70">
              {appointmentsByStatus.completed.map(appointment => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  allowDrag={false}
                  compact={true}
                  showOperatory={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Cancelled appointments */}
        {appointmentsByStatus.cancelled.length > 0 && (
          <div className="cancelled-appointments">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Cancelled / No Show</h4>
            <div className="appointment-group opacity-60">
              {appointmentsByStatus.cancelled.map(appointment => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment}
                  allowDrag={false}
                  compact={true}
                  showOperatory={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {appointmentsToUse.length === 0 && (
          <div className="empty-provider p-4 text-center border border-dashed border-gray-300 rounded">
            <p className="text-gray-500">No appointments scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProviderView);