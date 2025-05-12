import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicalLayout from './MedicalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import { 
  Appointment, AppointmentSearchResults, 
  ValidationError,
  AppointmentType
} from '../../types/medical';
import useDebounce from '../../hooks/useDebounce';
import AppointmentTable from './AppointmentTable';
import PatientSearchBar from './PatientSearchBar';
import ErrorBoundary from './common/ErrorBoundary';

const AppointmentManagementView: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ValidationError | null>(null);

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect for fetching appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // This would be an API call in a real application
        // For now, using mock data
        const mockResponse = {
          data: mockAppointments,
          totalCount: mockAppointments.length,
          page: 1,
          pageSize: 20,
          hasMore: false
        };

        setAppointments(mockResponse.data);
      } catch (err) {
        setError({
          field: 'fetch',
          message: 'Failed to fetch appointments. Please try again.'
        });
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [debouncedSearchQuery]);

  // Effect for filtering and sorting appointments
  // Memoized filter and sort function
  const getFilteredAppointments = useMemo(() => {
    return (appointments: Appointment[]) => {
      let filtered = [...appointments];

      // Apply search query
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter(appointment =>
          appointment.patientName.toLowerCase().includes(query) ||
          appointment.providerName.toLowerCase().includes(query) ||
          appointment.appointmentTypeName.toLowerCase().includes(query) ||
          appointment.locationName.toLowerCase().includes(query)
        );
      }

      // Apply date filter
      if (dateFilter) {
        filtered = filtered.filter(appointment => appointment.date === dateFilter);
      }

      // Apply provider filter
      if (providerFilter) {
        filtered = filtered.filter(appointment => appointment.providerId === providerFilter);
      }

      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter(appointment => appointment.status === statusFilter);
      }

      // Apply type filter
      if (typeFilter) {
        filtered = filtered.filter(appointment => appointment.appointmentTypeId === typeFilter);
      }

      // Apply sorting
      return filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'date':
            const aDateTime = `${a.date}T${a.startTime}`;
            const bDateTime = `${b.date}T${b.startTime}`;
            comparison = aDateTime.localeCompare(bDateTime);
            break;
          case 'patient':
            comparison = a.patientName.localeCompare(b.patientName);
            break;
          case 'provider':
            comparison = a.providerName.localeCompare(b.providerName);
            break;
          case 'type':
            comparison = a.appointmentTypeName.localeCompare(b.appointmentTypeName);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          default:
            comparison = a.date.localeCompare(b.date);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    };
  }, [debouncedSearchQuery, dateFilter, providerFilter, statusFilter, typeFilter, sortBy, sortDirection]);

  // Apply filtered and sorted appointments
  useEffect(() => {
    setFilteredAppointments(getFilteredAppointments(appointments));
  }, [
    appointments, 
    debouncedSearchQuery,
    dateFilter, 
    providerFilter, 
    statusFilter, 
    typeFilter,
    sortBy, 
    sortDirection
  ]);

  // Handler functions
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const handleProviderFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProviderFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleCreateAppointment = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsConfirmModalOpen(true);
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // Track loading state for specific appointment
      const loadingId = appointmentId;
      setLoading(true);
      setError(null);

      // Optimistic update
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: newStatus as any,
                updatedAt: new Date().toISOString(),
                isUpdating: true // Add loading indicator
              }
            : appointment
        )
      );

      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Update with confirmed state
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: newStatus as any,
                updatedAt: new Date().toISOString(),
                isUpdating: false // Remove loading indicator
              }
            : appointment
        )
      );

    } catch (err) {
      // Revert optimistic update on error
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: appointment.status, // Revert to original status
                isUpdating: false
              }
            : appointment
        )
      );
      
      setError({
        field: 'update',
        message: 'Failed to update appointment status. Please try again.'
      });
      console.error('Error updating appointment status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MedicalLayout title="Appointment Management - KYNSEY MD">
      <ErrorBoundary>
        <main className="container mx-auto px-4 py-6" role="main" aria-label="Appointment management">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0" tabIndex={0}>
              Appointment Management
            </h1>
            <button
              onClick={handleCreateAppointment}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              aria-label="Create new appointment"
            >
              <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" aria-hidden="true" />
              New Appointment
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6" role="search" aria-label="Appointment filters">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
              <div className="col-span-1 xl:col-span-2">
                <PatientSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  isLoading={loading}
                  placeholder="Search appointments by patient name, provider, or type..."
                  aria-label="Search appointments"
                />
              </div>
              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  aria-label="Filter appointments by date"
                />
              </div>
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  id="statusFilter"
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  aria-label="Filter appointments by status"
                >
                  <option value="">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="arrived">Arrived</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="typeFilter"
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                >
                  <option value="">All Types</option>
                  {mockAppointmentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('');
                  setProviderFilter('');
                  setStatusFilter('');
                  setTypeFilter('');
                  setSortBy('date');
                  setSortDirection('asc');
                }}
                className="text-blue-600 hover:underline"
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6"
              role="alert"
              aria-live="assertive"
            >
              {error.message}
            </div>
          )}

          {/* Loading Status */}
          <div aria-live="polite" className="sr-only">
            {loading ? 'Loading appointments...' : ''}
          </div>

          {/* Appointments Table */}
          <section className="bg-white rounded-lg shadow overflow-hidden" aria-label="Appointments list">
            <AppointmentTable
              appointments={filteredAppointments}
              isLoading={loading}
              onViewAppointment={handleViewAppointment}
              onEditAppointment={handleEditAppointment}
              onUpdateStatus={handleUpdateStatus}
            />
          </section>
        </main>

        {/*
          Modal components would go here in a real application:
          - Create Appointment Modal
          - Edit Appointment Modal
          - View Appointment Modal
          - Confirm Delete Modal
        */}
      </ErrorBoundary>
    </MedicalLayout>
  );
};

// Mock data
const mockAppointmentTypes: AppointmentType[] = [
  { id: 'type1', name: 'New Patient', duration: 60, color: 'blue' },
  { id: 'type2', name: 'Recall', duration: 45, color: 'green' },
  { id: 'type3', name: 'Procedure', duration: 90, color: 'purple' },
  { id: 'type4', name: 'Emergency', duration: 30, color: 'red' },
  { id: 'type5', name: 'Consultation', duration: 60, color: 'teal' }
];

const mockAppointments: Appointment[] = [
  {
    id: 'appt1',
    patientId: 'pat1',
    patientName: 'Robert Anderson',
    providerId: 'prov1',
    providerName: 'Dr. John Smith',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    operatoryId: 'op1',
    operatoryName: 'Operatory 1',
    appointmentTypeId: 'type2',
    appointmentTypeName: 'Recall',
    appointmentTypeColor: 'green',
    date: '2025-05-10',
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Regular checkup',
    insuranceVerified: true,
    createdAt: '2025-04-25T10:30:00',
    updatedAt: '2025-04-25T10:30:00'
  },
  {
    id: 'appt2',
    patientId: 'pat2',
    patientName: 'Jennifer Taylor',
    providerId: 'prov2',
    providerName: 'Dr. Emily Johnson',
    locationId: 'loc1',
    locationName: 'Main Clinic',
    operatoryId: 'op2',
    operatoryName: 'Operatory 2',
    appointmentTypeId: 'type4',
    appointmentTypeName: 'Emergency',
    appointmentTypeColor: 'red',
    date: '2025-05-09',
    startTime: '10:30',
    endTime: '11:00',
    duration: 30,
    status: 'completed',
    notes: 'Tooth pain',
    insuranceVerified: false,
    createdAt: '2025-05-09T08:15:00',
    updatedAt: '2025-05-09T11:05:00'
  }
];

export default AppointmentManagementView;