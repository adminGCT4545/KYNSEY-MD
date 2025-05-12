import React, { useState, useEffect, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { DailyScheduleOperatory } from '../../services/appointmentService';
import AppointmentCard from './AppointmentCard';

interface OperatoryViewProps {
  operatory: DailyScheduleOperatory;
  onAppointmentDrop: (appointmentId: number, operatoryId: number) => void;
}

const OperatoryView: React.FC<OperatoryViewProps> = ({ operatory, onAppointmentDrop }) => {
  const [dropTargetActive, setDropTargetActive] = useState(false);
  
  // Sort appointments by start time
  const sortedAppointments = useMemo(() => {
    return [...operatory.appointments].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  }, [operatory.appointments]);

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

  // Setup drop functionality with enhanced feedback
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: 'APPOINTMENT',
    drop: (item: { id: number }) => {
      onAppointmentDrop(item.id, operatory.id);
      setDropTargetActive(false);
    },
    hover: () => {
      setDropTargetActive(true);
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Reset drop target active state when not hovering
  useEffect(() => {
    if (!isOver) {
      setDropTargetActive(false);
    }
  }, [isOver]);

  // Calculate utilization rate for this operatory
  const utilizationRate = useMemo(() => {
    const totalAppointments = operatory.appointments.length;
    const completedAppointments = operatory.appointments.filter(
      apt => apt.status === 'completed'
    ).length;
    
    return totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 0;
  }, [operatory.appointments]);

  // Determine the visual state of the drop target
  const dropTargetClass = useMemo(() => {
    if (isOver && canDrop) {
      return 'border-green-500 bg-green-50';
    }
    if (dropTargetActive) {
      return 'border-blue-300 bg-blue-50';
    }
    return '';
  }, [isOver, canDrop, dropTargetActive]);
  
  return (
    <div 
      ref={dropRef} 
      className={`operatory-view border rounded-lg shadow-sm p-4 transition-all duration-200 ${dropTargetClass}`}
      aria-label={`Operatory ${operatory.name}`}
      role="region"
    >
      <div className="operatory-header border-b pb-2 mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{operatory.name}</h3>
          <p className="text-sm text-gray-500">
            {operatory.appointments.length} appointment{operatory.appointments.length !== 1 ? 's' : ''}
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
      
      <div className="operatory-body space-y-4">
        {/* Drop area messaging */}
        {isOver && (
          <div className="drop-indicator p-2 text-center text-green-600 bg-green-50 rounded border border-green-200 mb-2">
            <p className="text-sm">Drop to assign appointment here</p>
          </div>
        )}
        
        {/* Active appointments */}
        {appointmentsByStatus.active.length > 0 && (
          <div className="appointment-group mb-2">
            {appointmentsByStatus.active.map(appointment => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                allowDrag={true}
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
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {operatory.appointments.length === 0 && (
          <div className="empty-operatory p-4 text-center border border-dashed border-gray-300 rounded">
            <p className="text-gray-500">No appointments scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Drag appointments here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OperatoryView);