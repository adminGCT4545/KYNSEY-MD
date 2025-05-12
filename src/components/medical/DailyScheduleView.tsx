import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import appointmentService, { DailySchedule, Appointment } from '../../services/appointmentService';
import resourceService, { Location, Provider } from '../../services/resourceService';
import OperatoryView from './OperatoryView';
import ProviderView from './ProviderView';
import DateNavigator from './DateNavigator';
import LoadingSpinner from '../common/LoadingPlaceholder';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Status options for filtering
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' }
];

// View options
const VIEW_OPTIONS = [
  { value: 'day', label: 'Day View' },
  { value: 'week', label: 'Week View' },
  { value: 'month', label: 'Month View' }
];

// View mode options
const VIEW_MODE_OPTIONS = [
  { value: 'operatory', label: 'By Operatory' },
  { value: 'provider', label: 'By Provider' }
];

const DailyScheduleView: React.FC = () => {
  // URL parameters
  const { date: urlDate, locationId: urlLocationId } = useParams<{ date?: string; locationId?: string }>();

  // State for filters and view options
  const [date, setDate] = useState<string>(urlDate || new Date().toISOString().split('T')[0]);
  const [locationId, setLocationId] = useState<number>(urlLocationId ? Number(urlLocationId) : 0);
  const [selectedView, setSelectedView] = useState<string>('day');
  const [viewMode, setViewMode] = useState<string>('operatory'); // 'operatory' or 'provider'
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [providerId, setProviderId] = useState<number>(0); // 0 means all providers
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  
  // Data state
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // WebSocket connection reference
  const wsConnection = useRef<{ socket: WebSocket | null; cleanup: () => void } | null>(null);
  
  // Auto-refresh interval reference
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await resourceService.getLocations();
        setLocations(locationsData);
        if (!locationId && locationsData.length > 0) {
          setLocationId(locationsData[0].id);
        }
      } catch (err) {
        setError('Failed to load locations. Please check your connection and try again.');
      }
    };

    fetchLocations();
  }, []);

  // Load providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providersData = await resourceService.getProviders();
        setProviders(providersData);
      } catch (err) {
        setError('Failed to load providers. Please check your connection and try again.');
      }
    };

    fetchProviders();
  }, []);

  // Load schedule data when date or location changes
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!locationId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const scheduleData = await appointmentService.getDailySchedule(date, locationId);
        setSchedule(scheduleData);
      } catch (err: any) {
        setError(`Failed to load schedule: ${err.message || 'Unknown error'}`);
        console.error('Schedule loading error:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchSchedule();
  }, [date, locationId]);

  // Set up WebSocket for real-time updates
  useEffect(() => {
    // Only set up WebSocket if we have a valid location
    if (!locationId) return;
    
    // Clean up any existing connection
    if (wsConnection.current) {
      wsConnection.current.cleanup();
    }
    
    // Handle incoming WebSocket messages
    const handleWebSocketMessage = (data: any) => {
      // Only process relevant updates
      if (data.type?.includes('appointment') && 
          (!data.locationId || data.locationId === locationId) &&
          (!data.date || data.date === date)) {
        // Refresh the schedule data
        refreshSchedule();
      }
    };
    
    // Set up WebSocket connection
    wsConnection.current = appointmentService.setupRealTimeUpdates(handleWebSocketMessage);
    
    // Cleanup on unmount
    return () => {
      if (wsConnection.current) {
        wsConnection.current.cleanup();
      }
    };
  }, [locationId, date]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        refreshSchedule();
      }, 60000); // Refresh every minute
    } else if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
      refreshInterval.current = null;
    }
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  // Filter appointments based on status, provider, and search term
  const filteredOperatories = useMemo(() => {
    if (!schedule) return [];
    
    return schedule.operatories.map(operatory => {
      // Deep clone to avoid modifying original data
      const filteredOperatory = { ...operatory };
      
      // Filter appointments
      filteredOperatory.appointments = operatory.appointments.filter(appointment => {
        // Status filter
        if (statusFilter && appointment.status !== statusFilter) {
          return false;
        }
        
        // Provider filter
        if (providerId && appointment.provider_id !== providerId) {
          return false;
        }
        
        // Search filter (patient name, appointment type, notes)
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          
          return (
            appointment.patient_name?.toLowerCase().includes(searchTermLower) ||
            appointment.appointment_type?.toLowerCase().includes(searchTermLower) ||
            appointment.reason_for_visit?.toLowerCase().includes(searchTermLower) ||
            appointment.notes?.toLowerCase().includes(searchTermLower)
          );
        }
        
        return true;
      });
      
      return filteredOperatory;
    });
  }, [schedule, statusFilter, providerId, searchTerm]);

  const filteredProviders = useMemo(() => {
    if (!schedule) return [];
    
    // If providers array doesn't exist in the schedule data, create it from appointments
    if (!schedule.providers) {
      // Create a map to deduplicate providers from appointments
      const providerMap = new Map();
      
      // Go through all operatories and their appointments
      schedule.operatories.forEach(operatory => {
        operatory.appointments.forEach(appointment => {
          if (appointment.provider_id && appointment.provider_name) {
            // Use provider_id as key to avoid duplicates
            if (!providerMap.has(appointment.provider_id)) {
              providerMap.set(appointment.provider_id, {
                id: appointment.provider_id,
                name: appointment.provider_name,
                appointments: []
              });
            }
            
            // Add this appointment to the provider's appointments array
            providerMap.get(appointment.provider_id).appointments.push({
              ...appointment,
              operatory: operatory.name // Add operatory name to appointment for display
            });
          }
        });
      });
      
      // Return the values from the map as an array
      return Array.from(providerMap.values());
    }
    
    // If providers exist in the schedule, filter them normally
    return schedule.providers.map(provider => {
      // Deep clone to avoid modifying original data
      const filteredProvider = { ...provider };
      
      // Filter appointments
      filteredProvider.appointments = provider.appointments.filter(appointment => {
        // Status filter
        if (statusFilter && appointment.status !== statusFilter) {
          return false;
        }
        
        // Search filter (patient name, appointment type, notes)
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          
          return (
            appointment.patient_name?.toLowerCase().includes(searchTermLower) ||
            appointment.appointment_type?.toLowerCase().includes(searchTermLower) ||
            appointment.reason_for_visit?.toLowerCase().includes(searchTermLower) ||
            appointment.notes?.toLowerCase().includes(searchTermLower)
          );
        }
        
        return true;
      });
      
      return filteredProvider;
    });
  }, [schedule, statusFilter, searchTerm]);

  // Calculate schedule statistics
  const scheduleStats = useMemo(() => {
    if (!schedule) return { total: 0, confirmed: 0, arrived: 0, completed: 0, cancelled: 0 };
    
    const stats = {
      total: 0,
      confirmed: 0,
      arrived: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0
    };
    
    schedule.operatories.forEach(operatory => {
      operatory.appointments.forEach(appointment => {
        stats.total++;
        
        if (appointment.status in stats) {
          stats[appointment.status as keyof typeof stats]++;
        }
      });
    });
    
    return stats;
  }, [schedule]);

  // Handler functions
  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate.toISOString().split('T')[0]);
  }, []);

  const handleLocationChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationId(Number(event.target.value));
  }, []);

  const handleViewChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(event.target.value);
  }, []);

  const handleViewModeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(event.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  }, []);

  const handleProviderChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setProviderId(Number(event.target.value));
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const refreshSchedule = useCallback(() => {
    setIsRefreshing(true);
    // Force a refresh by creating a new date string with the same date
    const currentDate = new Date(date);
    setDate(currentDate.toISOString().split('T')[0]);
  }, [date]);

  const handleAppointmentDrop = useCallback(async (appointmentId: number, newOperatoryId: number) => {
    setLoading(true);
    
    try {
      // Find the appointment in the current schedule
      let appointmentToUpdate: Appointment | undefined;
      let oldOperatoryId: number | undefined;
      
      for (const operatory of schedule?.operatories || []) {
        const appointment = operatory.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
          appointmentToUpdate = appointment;
          oldOperatoryId = operatory.id;
          break;
        }
      }
      
      if (!appointmentToUpdate || !oldOperatoryId) {
        throw new Error('Appointment not found in schedule');
      }
      
      // Check for conflicts in the target operatory
      const conflicts = await appointmentService.checkAppointmentConflicts({
        ...appointmentToUpdate,
        operatory_id: newOperatoryId
      });
      
      // If conflicts exist, show a warning
      if (conflicts && conflicts.length > 0) {
        if (!window.confirm(`This will create a scheduling conflict with ${conflicts.length} other appointment(s). Continue anyway?`)) {
          setLoading(false);
          return;
        }
      }
      
      // Update the appointment's operatory_id
      await appointmentService.updateAppointment(
        Number(appointmentToUpdate.id), 
        { ...appointmentToUpdate, operatory_id: newOperatoryId }
      );
      
      // Refresh the schedule
      refreshSchedule();
      
    } catch (err: any) {
      setError(`Failed to move appointment: ${err.message || 'Unknown error'}`);
      console.error('Appointment move error:', err);
    } finally {
      setLoading(false);
    }
  }, [schedule, refreshSchedule]);

  // Export functions
  const handleExportCSV = useCallback(async () => {
    if (!locationId) return;
    
    try {
      const csvData = await appointmentService.exportScheduleToCSV(date, locationId);
      
      // Create a download link
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `schedule-${date}-location-${locationId}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(`Failed to export CSV: ${err.message || 'Unknown error'}`);
    }
  }, [date, locationId]);

  const handleExportPDF = useCallback(async () => {
    if (!locationId) return;
    
    try {
      const pdfBlob = await appointmentService.exportScheduleToPDF(date, locationId);
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `schedule-${date}-location-${locationId}.pdf`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(`Failed to export PDF: ${err.message || 'Unknown error'}`);
    }
  }, [date, locationId]);

  // Error retry handler
  const handleErrorRetry = useCallback(() => {
    setError(null);
    refreshSchedule();
  }, [refreshSchedule]);

  // Render schedule content
  const renderContent = () => {
    if (loading && !isRefreshing) {
      return (
        <LoadingSpinner 
          isLoading={true}
          message="Loading schedule..."
          height="300px"
        />
      );
    }

    if (error) {
      return (
        <div className="error-state p-4 bg-red-50 border border-red-300 rounded-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            onClick={handleErrorRetry}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Retry loading schedule"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!schedule || (!filteredOperatories.length && !filteredProviders.length)) {
      return (
        <div className="empty-state p-8 text-center bg-gray-50 border border-gray-200 rounded-md">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-lg font-medium text-gray-600">No appointments available for this date and location.</p>
          <p className="text-sm text-gray-500">Try changing the date, location, or removing filters.</p>
        </div>
      );
    }

    if (viewMode === 'provider') {
      return (
        <div className="providers-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <ProviderView
                key={provider.id}
                provider={provider}
                // Ensure appointments is always defined
                appointments={provider.appointments || []}
              />
            ))
          ) : (
            <div className="col-span-3 empty-state p-8 text-center bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-500">No provider appointments match your filter criteria.</p>
              <p className="text-sm text-gray-400">Try changing your filters or selecting a different date.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="operatories-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredOperatories.map(operatory => (
          <OperatoryView
            key={operatory.id}
            operatory={operatory}
            onAppointmentDrop={handleAppointmentDrop}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="daily-schedule-view p-4">
      <div className="schedule-header flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Daily Schedule</h2>
        
        {/* Stats summary */}
        {schedule && (
          <div className="stats-summary flex flex-wrap gap-2 mt-2 md:mt-0">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
              Total: {scheduleStats.total}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
              Confirmed: {scheduleStats.confirmed}
            </span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
              Arrived: {scheduleStats.arrived}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
              In Progress: {scheduleStats['in-progress']}
            </span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-medium">
              Completed: {scheduleStats.completed}
            </span>
          </div>
        )}
      </div>

      {/* Controls section */}
      <div className="schedule-controls bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date control */}
          <div className="flex items-center">
            <DateNavigator 
              selectedDate={new Date(date)} 
              onDateChange={handleDateChange}
            />
          </div>
          
          {/* Location dropdown */}
          <div>
            <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              id="location-select"
              value={locationId || ''}
              onChange={handleLocationChange}
              className="location-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          
          {/* View type dropdown */}
          <div>
            <label htmlFor="view-select" className="block text-sm font-medium text-gray-700 mb-1">View</label>
            <select
              id="view-select"
              value={selectedView}
              onChange={handleViewChange}
              className="view-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {VIEW_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* View mode toggle switch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('operatory')}
                className={`px-4 py-2 rounded-l-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  viewMode === 'operatory'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                By Operatory
              </button>
              <button
                onClick={() => setViewMode('provider')}
                className={`px-4 py-2 rounded-r-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  viewMode === 'provider'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                By Provider
              </button>
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="status-filter block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {/* Provider filter - only show when viewMode is operatory */}
          {viewMode === 'operatory' && (
            <div>
              <label htmlFor="provider-select" className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                id="provider-select"
                value={providerId || ''}
                onChange={handleProviderChange}
                className="provider-select block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={0}>All Providers</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search input */}
          <div className={viewMode === 'provider' ? 'lg:col-span-2' : ''}>
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search patient, type..."
              className="search-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-end space-x-2">
            <button
              onClick={refreshSchedule}
              className="refresh-button px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={loading}
              aria-label="Refresh schedule"
            >
              <svg className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            <button
              onClick={toggleAutoRefresh}
              className={`auto-refresh-toggle px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                autoRefresh ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              aria-label={`${autoRefresh ? 'Disable' : 'Enable'} auto refresh`}
            >
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            <div className="relative group">
              <button
                className="export-button px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                aria-label="Export options"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                <div className="py-1">
                  <button
                    onClick={handleExportCSV}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export to CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export to PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <DndProvider backend={HTML5Backend}>
        {renderContent()}
      </DndProvider>
    </div>
  );
};

export default DailyScheduleView;
