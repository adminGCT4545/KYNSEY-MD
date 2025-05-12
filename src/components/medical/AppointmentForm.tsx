import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import appointmentService, { Appointment, AppointmentData } from '../../services/appointmentService';

// Base type for service form data - properly aligned with AppointmentData['services']
interface ServiceFormData {
  service_id: number;
  fee_charged: number;
  insurance_coverage: number;
  patient_portion: number;
  status: string;
  provider_id?: number;  // Optional field
  notes?: string;  // Optional field
}

// Type for form data
interface FormData {
  patient_id: number;
  provider_id: number;
  location_id: number;
  operatory_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  appointment_type: string;
  reason_for_visit: string;
  notes?: string;  // Optional field
  services: ServiceFormData[];
  created_by?: number;
}

import patientService from '../../services/patientService';
import resourceService, { Provider, Location, Operatory, Service } from '../../services/resourceService';

interface AppointmentFormProps {
  appointmentId?: number;
  initialData?: Partial<AppointmentData>;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  appointmentId, 
  initialData = {}, 
  onSave, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Type assertion for service data
  const mapServiceData = (s: any): ServiceFormData => {
    return {
      service_id: s.service_id ?? 0,
      fee_charged: s.fee_charged ?? 0,
      insurance_coverage: s.insurance_coverage ?? 0,
      patient_portion: s.patient_portion ?? 0,
      status: s.status ?? 'planned',
      provider_id: s.provider_id,
      notes: s.notes
    };
  };
  
  const [formData, setFormData] = useState<FormData>({
    patient_id: initialData.patient_id ?? 0,
    provider_id: initialData.provider_id ?? 0,
    location_id: initialData.location_id ?? 0,
    operatory_id: initialData.operatory_id ?? 0,
    appointment_date: initialData.appointment_date ?? format(new Date(), 'yyyy-MM-dd'),
    start_time: initialData.start_time ?? '08:00',
    end_time: initialData.end_time ?? '08:30',
    status: initialData.status ?? 'scheduled',
    appointment_type: initialData.appointment_type ?? 'Check-up',
    reason_for_visit: initialData.reason_for_visit ?? '',
    notes: initialData.notes,
    services: (initialData.services ?? []).map(mapServiceData)
  });

  const [patientOptions, setPatientOptions] = useState<Array<{ id: number, name: string }>>([]);
  const [providerOptions, setProviderOptions] = useState<Provider[]>([]);
  const [locationOptions, setLocationOptions] = useState<Location[]>([]);
  const [operatoryOptions, setOperatoryOptions] = useState<Operatory[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  
  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch providers, locations, and services
        const [providersResponse, locationsResponse, servicesResponse] = await Promise.all([
          resourceService.getProviders(),
          resourceService.getLocations(),
          resourceService.getServices()
        ]);
        
        setProviderOptions(providersResponse);
        setLocationOptions(locationsResponse);
        setServiceOptions(servicesResponse);
        
        // If we have a location selected, fetch operatories for that location
        if (formData.location_id) {
          const operatoriesResponse = await resourceService.getOperatories(formData.location_id);
          setOperatoryOptions(operatoriesResponse);
        }

        // If we're editing an existing appointment, fetch its data
        if (appointmentId) {
          const appointmentResponse = await appointmentService.getAppointmentById(appointmentId);
          setFormData({
            patient_id: appointmentResponse.patient_id,
            provider_id: appointmentResponse.provider_id,
            location_id: appointmentResponse.location_id,
            operatory_id: appointmentResponse.operatory_id,
            appointment_date: appointmentResponse.appointment_date,
            start_time: appointmentResponse.start_time,
            end_time: appointmentResponse.end_time,
            status: appointmentResponse.status,
            appointment_type: appointmentResponse.appointment_type,
            reason_for_visit: appointmentResponse.reason_for_visit,
            notes: appointmentResponse.notes,
            services: (appointmentResponse.services ?? []).map(mapServiceData)
          });
          
          // Also fetch the patient to add to patient options
          const patientResponse = await patientService.getPatientById(appointmentResponse.patient_id);
          setPatientOptions([{ 
            id: patientResponse.id, 
            name: `${patientResponse.first_name} ${patientResponse.last_name}` 
          }]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId]);
  
  // Fetch operatories when location changes
  useEffect(() => {
    const fetchOperatories = async () => {
      if (formData.location_id) {
        try {
          const operatoriesResponse = await resourceService.getOperatories(formData.location_id);
          setOperatoryOptions(operatoriesResponse);
          
          // If the currently selected operatory is not in the new location, clear the selection
          if (operatoriesResponse.length > 0) {
            const operatoryExists = operatoriesResponse.some((op: Operatory) => op.id === formData.operatory_id);
            if (!operatoryExists) {
              setFormData(prev => ({ ...prev, operatory_id: operatoriesResponse[0].id }));
            }
          } else {
            setFormData(prev => ({ ...prev, operatory_id: 0 }));
          }
        } catch (err) {
          console.error('Error fetching operatories:', err);
        }
      }
    };
    
    fetchOperatories();
  }, [formData.location_id]);
  
  // Handle patient search
  const handlePatientSearch = async () => {
    if (patientSearchTerm.length < 2) return;
    
    try {
      const patientsResponse = await patientService.searchPatients(patientSearchTerm);
      setPatientOptions(patientsResponse.map((patient: any) => ({ 
        id: patient.id, 
        name: `${patient.first_name} ${patient.last_name}` 
      })));
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Special handling for notes field
      if (name === 'notes') {
        return { ...prev, [name]: value === '' ? undefined : value };
      }
      // Special handling for numeric fields
      if (['patient_id', 'provider_id', 'location_id', 'operatory_id'].includes(name)) {
        const numValue = Number(value);
        return { ...prev, [name]: isNaN(numValue) ? 0 : numValue };
      }
      return { ...prev, [name]: value };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      let result;
      
      // Add a default created_by if this is a new appointment
      const submissionData = {
        ...formData,
        created_by: formData.created_by || 1 // Default to user ID 1 if not provided
      } as AppointmentData;
      
      if (appointmentId) {
        result = await appointmentService.updateAppointment(appointmentId, submissionData);
      } else {
        result = await appointmentService.createAppointment(submissionData);
      }
      
      onSave(result);
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      setError(err.response?.data?.message || 'Failed to save appointment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add a service to the appointment
  const handleAddService = () => {
    if (serviceOptions.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      services: [
        ...(prev.services || []),
        {
          service_id: serviceOptions[0].id,
          fee_charged: serviceOptions[0].default_fee ?? 0,
          insurance_coverage: 0,
          patient_portion: serviceOptions[0].default_fee ?? 0,
          status: 'planned',
          provider_id: formData.provider_id || undefined,
          notes: undefined
        }
      ]
    }));
  };
  
  // Remove a service from the appointment
  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };
  
  // Handle service input changes
  const handleServiceChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => {
        if (i === index) {
          if (field === 'notes') {
            return { ...service, [field]: value === '' ? undefined : value };
          }
          if (['fee_charged', 'insurance_coverage', 'patient_portion'].includes(field)) {
            const numValue = Number(value);
            return { ...service, [field]: isNaN(numValue) ? 0 : numValue };
          }
          if (field === 'service_id') {
            return { ...service, [field]: Number(value) || 0 };
          }
          if (field === 'provider_id') {
            return { ...service, [field]: value ? Number(value) : undefined };
          }
          return { ...service, [field]: value };
        }
        return service;
      })
    }));
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">
        {appointmentId ? 'Edit Appointment' : 'Create New Appointment'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="patient_id">
              Patient
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search patients..."
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
              />
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handlePatientSearch}
              >
                Search
              </button>
            </div>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a patient</option>
              {patientOptions.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          
          {/* Basic Appointment Details */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appointment_date">
              Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="appointment_date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appointment_type">
              Appointment Type
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="appointment_type"
              name="appointment_type"
              value={formData.appointment_type}
              onChange={handleInputChange}
              required
            >
              <option value="Check-up">Check-up</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Procedure">Procedure</option>
              <option value="Emergency">Emergency</option>
              <option value="New Patient">New Patient</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_time">
              Start Time
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_time">
              End Time
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provider_id">
              Provider
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="provider_id"
              name="provider_id"
              value={formData.provider_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a provider</option>
              {providerOptions.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.first_name} {provider.last_name} ({provider.specialty})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_id">
              Location
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="location_id"
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a location</option>
              {locationOptions.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="operatory_id">
              Operatory
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="operatory_id"
              name="operatory_id"
              value={formData.operatory_id}
              onChange={handleInputChange}
              required
              disabled={!formData.location_id || operatoryOptions.length === 0}
            >
              <option value="">Select an operatory</option>
              {operatoryOptions.map(operatory => (
                <option key={operatory.id} value={operatory.id}>{operatory.name}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason_for_visit">
              Reason for Visit
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="reason_for_visit"
              name="reason_for_visit"
              type="text"
              placeholder="Reason for Visit"
              value={formData.reason_for_visit}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="notes"
              name="notes"
              rows={3}
              placeholder="Notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        {/* Services Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <button
              type="button"
              onClick={handleAddService}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Service
            </button>
          </div>
          
          {formData.services && formData.services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Portion</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.services.map((service, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={service.service_id}
                          onChange={(e) => handleServiceChange(index, 'service_id', Number(e.target.value))}
                        >
                          {serviceOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={service.fee_charged}
                          onChange={(e) => handleServiceChange(index, 'fee_charged', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={service.insurance_coverage}
                          onChange={(e) => handleServiceChange(index, 'insurance_coverage', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={service.patient_portion}
                          onChange={(e) => handleServiceChange(index, 'patient_portion', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={service.status}
                          onChange={(e) => handleServiceChange(index, 'status', e.target.value)}
                        >
                          <option value="planned">Planned</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
              No services added yet. Click "Add Service" to add services to this appointment.
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : appointmentId ? 'Update Appointment' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
