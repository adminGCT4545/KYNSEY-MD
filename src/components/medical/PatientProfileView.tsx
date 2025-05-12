import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faEdit, 
  faExclamationTriangle,
  faUserCircle,
  faPhone,
  faEnvelope,
  faIdCard,
  faBirthdayCake,
  faVenusMars,
  faMapMarkerAlt,
  faMedkit,
  faFileAlt,
  faChartLine,
  faDollarSign,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import medicalService from '../../services/medicalService';
import LoadingSpinner from '../LoadingSpinner';
import PatientTimelineView from './patient/PatientTimelineView';
import PatientChartsView from './patient/PatientChartsView';
import PatientBillingView from './patient/PatientBillingView';
import PatientDocumentsView from './patient/PatientDocumentsView';
import MedicationList from './Medications/MedicationList';

interface PatientProfileParams {
  patientId: string;
}

interface PatientProfile {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  insurance_provider?: string;
  insurance_id?: string;
  preferred_location_id?: string;
  preferred_provider_id?: string;
  primary_care_provider?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
  allergies?: string[];
  status?: 'active' | 'inactive' | 'new';
  last_visit_date?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: any;
}

/**
 * Patient Profile View Component
 * 
 * Main component for viewing and managing a patient's profile
 */
const PatientProfileView: React.FC = () => {
  const { patientId } = useParams<keyof PatientProfileParams>() as PatientProfileParams;
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('timeline');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Define tabs with icons
  const tabs: TabItem[] = [
    { id: 'timeline', label: 'Timeline', icon: faHistory },
    { id: 'charts', label: 'Charts', icon: faChartLine },
    { id: 'billing', label: 'Billing & Insurance', icon: faDollarSign },
    { id: 'documents', label: 'Documents', icon: faFileAlt },
    { id: 'medications', label: 'Medications', icon: faMedkit }
  ];

  // Fetch patient data with error handling and retry logic
  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicalService.getPatientById(patientId);
      setPatient(response.data);
    } catch (err: any) {
      console.error('Error fetching patient:', err);
      
      // More descriptive error messages based on error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 404) {
          setError('Patient not found. Please check the patient ID and try again.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to view this patient record.');
        } else {
          setError(`Server error (${err.response.status}): ${err.response.data.message || 'Failed to load patient data'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error: The server did not respond. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);
  
  // Fetch patient data on component mount or when patientId changes
  useEffect(() => {
    fetchPatient();
  }, [fetchPatient, retryCount]);
  
  // Handle tab change with keyboard support
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without navigation for deep linking
    window.history.replaceState(
      null, 
      '', 
      `/medical/patients/${patientId}/${tab}`
    );
  };
  
  // Handle keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, tab: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tab);
    }
  };
  
  // Handle patient edit
  const handleEditPatient = () => {
    navigate(`/medical/patients/${patientId}/edit`);
  };
  
  // Handle go back
  const handleGoBack = () => {
    navigate('/medical/patients');
  };
  
  // Format date as MM/DD/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate age from date of birth
  const calculateAge = (dob: string): string => {
    if (!dob) return 'N/A';
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age.toString();
    } catch (e) {
      return 'N/A';
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      new: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const statusClass = statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClass} ml-2`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading patient data...</span>
      </div>
    );
  }
  
  // Error state with retry option
  if (error) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white shadow-md rounded-lg border border-gray-200">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
        </div>
        <h2 className="text-xl font-medium text-center mb-4">Error Loading Patient</h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            onClick={handleGoBack}
            aria-label="Return to patient list"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Patients
          </button>
          <button 
            className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
            onClick={() => setRetryCount(retryCount + 1)}
            aria-label="Try loading patient data again"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Patient not found state
  if (!patient) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white shadow-md rounded-lg border border-gray-200">
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={faUserCircle} className="text-4xl text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-center mb-4">Patient Not Found</h2>
        <p className="text-gray-600 mb-6 text-center">
          The requested patient record could not be found. The patient may have been removed or you may not have permission to view this record.
        </p>
        <div className="flex justify-center">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            onClick={handleGoBack}
            aria-label="Return to patient list"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Patient profile">
      {/* Patient Header */}
      <div className="bg-white p-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <button 
              className="mr-4 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              onClick={handleGoBack}
              aria-label="Back to patients list"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              {patient.first_name} {patient.last_name}
              {renderStatusBadge(patient.status)}
            </h1>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            onClick={handleEditPatient}
            aria-label="Edit patient information"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit Patient
          </button>
        </div>
        
        {/* Patient Summary */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faIdCard} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Patient ID</span>
                <span className="font-medium">{patient.patient_id}</span>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faBirthdayCake} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Date of Birth</span>
                <span className="font-medium">{formatDate(patient.date_of_birth)} (Age: {calculateAge(patient.date_of_birth)})</span>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faVenusMars} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Gender</span>
                <span className="font-medium">{patient.gender || 'Not specified'}</span>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Phone</span>
                <a href={`tel:${patient.phone}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                  {patient.phone || 'N/A'}
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Email</span>
                {patient.email ? (
                  <a href={`mailto:${patient.email}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    {patient.email}
                  </a>
                ) : (
                  <span className="font-medium">N/A</span>
                )}
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faMedkit} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Insurance</span>
                <span className="font-medium">{patient.insurance_provider || 'N/A'}</span>
                {patient.insurance_id && <span className="text-xs text-gray-500">ID: {patient.insurance_id}</span>}
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faUserCircle} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Primary Care Provider</span>
                <span className="font-medium">{patient.primary_care_provider || 'Not assigned'}</span>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faPhone} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Emergency Contact</span>
                <span className="font-medium">{patient.emergency_contact_name || 'Not provided'}</span>
                {patient.emergency_contact_phone && (
                  <a href={`tel:${patient.emergency_contact_phone}`} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    {patient.emergency_contact_phone}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-start sm:col-span-2">
              <div className="text-gray-500 mr-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Address</span>
                <address className="font-medium not-italic">
                  {patient.address 
                    ? `${patient.address}, ${patient.city || ''}, ${patient.state || ''} ${patient.zip_code || ''}` 
                    : 'No address on file'}
                </address>
              </div>
            </div>
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="flex flex-col sm:col-span-2">
                <span className="text-sm text-gray-500 mb-1">Allergies</span>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full border border-red-200">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Patient Navigation Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center mr-2 last:mr-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                aria-selected={activeTab === tab.id}
                role="tab"
                tabIndex={activeTab === tab.id ? 0 : -1}
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Patient Content Area */}
      <div 
        className="flex-1 overflow-auto p-4 bg-gray-50" 
        role="tabpanel" 
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'timeline' && <PatientTimelineView patientId={patientId} />}
        {activeTab === 'charts' && <PatientChartsView patientId={patientId} />}
        {activeTab === 'billing' && <PatientBillingView patientId={patientId} />}
        {activeTab === 'documents' && <PatientDocumentsView patientId={patientId} />}
        {activeTab === 'medications' && <MedicationList patientId={patientId} />}
      </div>
    </div>
  );
};

export default PatientProfileView;