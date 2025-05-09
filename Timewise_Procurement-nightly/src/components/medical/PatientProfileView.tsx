import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import medicalService from '../../services/medicalService';
import LoadingSpinner from '../LoadingSpinner';
import PatientTimelineView from './patient/PatientTimelineView';
import PatientChartsView from './patient/PatientChartsView';
import PatientBillingView from './patient/PatientBillingView';
import PatientDocumentsView from './patient/PatientDocumentsView';

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
  created_at: string;
  updated_at: string;
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
  
  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const response = await medicalService.getPatientById(patientId);
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to load patient data. Please try again later.');
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={handleGoBack}
        >
          Back to Patients
        </button>
        <button 
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="p-4 text-center">
        <div className="text-yellow-500 mb-4">Patient not found.</div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleGoBack}
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Patient Header */}
      <div className="bg-white p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button 
              className="mr-4 text-blue-500 hover:text-blue-700"
              onClick={handleGoBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Patient Profile: {patient.first_name} {patient.last_name}
            </h1>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleEditPatient}
          >
            Edit Patient
          </button>
        </div>
        
        {/* Patient Summary */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Patient ID</span>
              <span className="font-medium">{patient.patient_id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Date of Birth</span>
              <span className="font-medium">{formatDate(patient.date_of_birth)} (Age: {calculateAge(patient.date_of_birth)})</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="font-medium">{patient.gender}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="font-medium">{patient.phone || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email</span>
              <span className="font-medium">{patient.email || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Insurance</span>
              <span className="font-medium">{patient.insurance_provider || 'N/A'}</span>
            </div>
            <div className="flex flex-col md:col-span-3">
              <span className="text-sm text-gray-500">Address</span>
              <span className="font-medium">
                {patient.address ? `${patient.address}, ${patient.city || ''}, ${patient.state || ''} ${patient.zip_code || ''}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Patient Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('timeline')}
          >
            Timeline
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'charts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('charts')}
          >
            Charts
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'billing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('billing')}
          >
            Billing & Insurance
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('documents')}
          >
            Documents
          </button>
        </div>
      </div>
      
      {/* Patient Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'timeline' && <PatientTimelineView patientId={patientId} />}
        {activeTab === 'charts' && <PatientChartsView patientId={patientId} />}
        {activeTab === 'billing' && <PatientBillingView patientId={patientId} />}
        {activeTab === 'documents' && <PatientDocumentsView patientId={patientId} />}
      </div>
    </div>
  );
};

export default PatientProfileView;