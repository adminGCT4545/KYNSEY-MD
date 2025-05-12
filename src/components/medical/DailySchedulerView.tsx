import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import MedicalLayout from '@medical/MedicalLayout';
import AppointmentModal from '@medical/AppointmentModal';
import OperatoryColumn from '@medical/OperatoryColumn';
import PatientSearchComponent from '@medical/PatientSearchComponent';
import ErrorBoundary from '@medical/common/ErrorBoundary';
import appointmentService, { Appointment, DailySchedule, DailyScheduleOperatory } from '@services/appointmentService';
import resourceService, { Location, Provider, Operatory } from '@services/resourceService';

// Status options constant
const STATUS_OPTIONS = [
  { id: 'scheduled', name: 'Scheduled', color: 'bg-gray-100 text-gray-800' },
  { id: 'confirmed', name: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { id: 'arrived', name: 'Arrived', color: 'bg-green-100 text-green-800' },
  { id: 'in-progress', name: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'completed', name: 'Completed', color: 'bg-purple-100 text-purple-800' },
  { id: 'cancelled', name: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { id: 'no-show', name: 'No Show', color: 'bg-red-50 text-red-600' }
] as const;

const DailySchedulerView: React.FC = () => {
  // State for date, location, and filters
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['scheduled', 'confirmed', 'arrived', 'in-progress']);
  
  // State for data from API
  const [locations, setLocations] = useState<Location[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | undefined>(undefined);
  const [selectedOperatoryId, setSelectedOperatoryId] = useState<number | undefined>(undefined);
  
  // Format date for display
  const formattedDate = format(currentDate, 'MMMM d, yyyy');
  const formattedDateForAPI = format(currentDate, 'yyyy-MM-dd');
  
  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load locations and providers
        const [locationsData, providersData] = await Promise.all([
          resourceService.getLocations(),
          resourceService.getProviders()
        ]);
        
        setLocations(locationsData);
        setProviders(providersData);
        
        // Set default selection if none selected yet
        if (locationsData.length > 0 && !selectedLocationId) {
          setSelectedLocationId(locationsData[0].id);
        }
        
        if (providersData.length > 0 && selectedProviderIds.length === 0) {
          setSelectedProviderIds(providersData.map((provider: Provider) => provider.id));
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load locations and providers. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Load schedule when date or location changes
  useEffect(() => {
    const loadSchedule = async () => {
      if (!selectedLocationId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const scheduleData = await appointmentService.getDailySchedule(
          formattedDateForAPI,
          selectedLocationId
        );
        
        setSchedule(scheduleData);
      } catch (err) {
        console.error('Error loading schedule:', err);
        setError('Failed to load schedule. Please try again.');
        setSchedule(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSchedule();
  }, [currentDate, selectedLocationId]);
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, -1));
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle location change
  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = parseInt(event.target.value);
    setSelectedLocationId(locationId);
  };
  
  // Handle provider filter change
  const handleProviderFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const providerId = parseInt(event.target.value);
    
    setSelectedProviderIds(prevSelected => {
      if (event.target.checked) {
        return [...prevSelected, providerId];
      } else {
        return prevSelected.filter(id => id !== providerId);
      }
    });
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const status = event.target.value;
    
    setSelectedStatuses(prevSelected => {
      if (event.target.checked) {
        return [...prevSelected, status];
      } else {
        return prevSelected.filter(s => s !== status);
      }
    });
  };
  
  // Open appointment detail modal
  const handleViewAppointment = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsAppointmentModalOpen(true);
  };
  
  // Open modal to add a new appointment
  const handleAddAppointment = (operatoryId?: number) => {
    setSelectedAppointmentId(undefined);
    setSelectedOperatoryId(operatoryId);
    setIsAppointmentModalOpen(true);
  };
  
  // Handle appointment status change
  const handleAppointmentStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      // Refresh schedule after status change
      if (selectedLocationId) {
        const updatedSchedule = await appointmentService.getDailySchedule(
          formattedDateForAPI,
          selectedLocationId
        );
        setSchedule(updatedSchedule);
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status. Please try again.');
    }
  };
  
  // Handle appointment save (create/update)
  const handleAppointmentSave = async (appointment: Appointment) => {
    if (selectedLocationId) {
      const updatedSchedule = await appointmentService.getDailySchedule(
        formattedDateForAPI,
        selectedLocationId
      );
      setSchedule(updatedSchedule);
    }
  };
  
  // Filter operatories and appointments based on selected providers and statuses
  // Extend DailyScheduleOperatory with Operatory fields
  type ExtendedOperatory = DailyScheduleOperatory & {
    created_at: string;
    updated_at: string;
  };

  const filteredSchedule = useMemo(() => {
    if (!schedule) return null;
    
    const now = new Date().toISOString();
    return {
      ...schedule,
      operatories: schedule.operatories.map(operatory => {
        // Filter appointments based on selected filters
        const filteredAppointments = operatory.appointments.filter(appointment => {
          const providerMatch = selectedProviderIds.length === 0 || 
            selectedProviderIds.includes(appointment.provider_id);
          const statusMatch = selectedStatuses.length === 0 || 
            selectedStatuses.includes(appointment.status);
          return providerMatch && statusMatch;
        });

        // Create extended operatory with required fields
        const extendedOperatory: ExtendedOperatory = {
          ...operatory,
          created_at: now,
          updated_at: now,
          appointments: filteredAppointments
        };

        return extendedOperatory;
      })
    };
  }, [schedule, selectedProviderIds, selectedStatuses]);
  
  // Calculate appointment stats
  const totalAppointments = filteredSchedule?.operatories.reduce(
    (sum, op) => sum + op.appointments.length, 0
  ) || 0;
  
  const appointmentsByStatus = filteredSchedule?.operatories.reduce(
    (stats, op) => {
      op.appointments.forEach((appointment: Appointment) => {
        stats[appointment.status] = (stats[appointment.status] || 0) + 1;
      });
      return stats;
    },
    {} as Record<string, number>
  ) || {};
  
  const confirmedAppointments = appointmentsByStatus['confirmed'] || 0;
  const arrivedAppointments = (appointmentsByStatus['arrived'] || 0) + 
    (appointmentsByStatus['in-progress'] || 0);
  
  // This would be calculated based on business hours and operatory availability in a real app
  const availableSlots = 20 - totalAppointments;
  
  // Status options for filtering
  const statusOptions = [
    { id: 'scheduled', name: 'Scheduled', color: 'bg-gray-100 text-gray-800' },
    { id: 'confirmed', name: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { id: 'arrived', name: 'Arrived', color: 'bg-green-100 text-green-800' },
    { id: 'in-progress', name: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'completed', name: 'Completed', color: 'bg-purple-100 text-purple-800' },
    { id: 'cancelled', name: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { id: 'no-show', name: 'No Show', color: 'bg-red-50 text-red-600' }
  ];
  
  return (
    <MedicalLayout title="Daily Schedule - KYNSEY MD">
      <main className="scheduler-view p-4" role="main" aria-label="Daily Schedule">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {/* Location and Date Controls */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div className="location-selector">
            <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="location-select"
              className="border border-gray-300 rounded-md px-3 py-2 w-64"
              value={selectedLocationId || ''}
              onChange={handleLocationChange}
              disabled={isLoading || locations.length === 0}
            >
              {locations.length === 0 && (
                <option value="">Loading locations...</option>
              )}
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          
          <div className="date-navigator flex items-center space-x-4">
            <button
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              onClick={goToPreviousDay}
              disabled={isLoading}
            >
              &lt; Previous
            </button>
            
            <button
              className="px-3 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={goToToday}
              disabled={isLoading}
            >
              Today
            </button>
            
            <div className="text-center">
              <div className="font-semibold">{formattedDate}</div>
            </div>
            
            <button
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              onClick={goToNextDay}
              disabled={isLoading}
            >
              Next &gt;
            </button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">Total Appointments</h3>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">Confirmed</h3>
            <div className="text-2xl font-bold text-blue-600">{confirmedAppointments}</div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">Arrived/In Progress</h3>
            <div className="text-2xl font-bold text-green-600">{arrivedAppointments}</div>
          </div>
          
          <div className="stat-card bg-white rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500">Available Slots</h3>
            <div className="text-2xl font-bold text-gray-600">{availableSlots}</div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Status Filters */}
          <div className="filter-section bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <label key={status.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    value={status.id}
                    checked={selectedStatuses.includes(status.id)}
                    onChange={handleStatusFilterChange}
                  />
                  <span className={`ml-2 ${status.color} px-2 py-0.5 rounded-full text-xs`}>
                    {status.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Provider Filters */}
          <div className="filter-section bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Filter by Provider</h3>
            <div className="flex flex-wrap gap-2">
              {providers.map(provider => (
                <label key={provider.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    value={provider.id}
                    checked={selectedProviderIds.includes(provider.id)}
                    onChange={handleProviderFilterChange}
                  />
                  <span className="ml-2">
                    {provider.first_name} {provider.last_name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            onClick={() => handleAddAppointment()}
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            New Appointment
          </button>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Loading schedule...</p>
          </div>
        )}
        
        {/* No Data State */}
        {!isLoading && (!schedule || schedule.operatories.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="h-16 w-16 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-gray-600">No schedule data available for this date and location.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleAddAppointment()}
            >
              Create First Appointment
            </button>
          </div>
        )}
        
        {/* Appointment Grid */}
        {!isLoading && filteredSchedule && filteredSchedule.operatories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSchedule.operatories.map(operatory => (
              <OperatoryColumn
                key={operatory.id}
                operatory={operatory}
                appointments={operatory.appointments}
                showAddButton={true}
                onAddAppointment={handleAddAppointment}
                onViewAppointment={handleViewAppointment}
                onStatusChange={handleAppointmentStatusChange}
                onRescheduleAppointment={handleViewAppointment}
                onCancelAppointment={(appointmentId) => handleAppointmentStatusChange(appointmentId, 'cancelled')}
              />
            ))}
          </div>
        )}
        
        {/* Appointment Modal */}
        <ErrorBoundary>
          {isAppointmentModalOpen && selectedLocationId && (
            <AppointmentModal
              isOpen={isAppointmentModalOpen}
              appointmentId={selectedAppointmentId ?? 0}
              initialDate={currentDate}
              initialLocationId={selectedLocationId}
              initialOperatoryId={selectedOperatoryId ?? 0}
              onSave={handleAppointmentSave}
              onClose={() => {
                setIsAppointmentModalOpen(false);
                setSelectedAppointmentId(undefined);
                setSelectedOperatoryId(undefined);
              }}
            />
          )}
        </ErrorBoundary>
      </main>
    </MedicalLayout>
  );
};

export default DailySchedulerView;
