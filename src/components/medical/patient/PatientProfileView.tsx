import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Routes, Route, Outlet } from 'react-router-dom';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';
import PatientTimelineView from './PatientTimelineView';
import PatientChartsView from './PatientChartsView';
import PatientBillingView from './PatientBillingView';
import PatientDocumentsView from './PatientDocumentsView';

interface Patient {
  id: string;
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
  mrn: string;
  insurance_provider?: string;
  insurance_id?: string;
  primary_provider_id?: string;
  primary_provider_name?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Patient Profile View Component
 * 
 * Main component for displaying patient profile with navigation tabs to different sections
 */
const PatientProfileView: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        if (!patientId) {
          throw new Error('Patient ID is required');
        }
        
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
    navigate(`/medical/patients/${patientId}/${tab === 'overview' ? '' : tab}`);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <p className="text-yellow-700">Patient not found.</p>
        <button
          className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
          onClick={() => navigate('/medical/patients')}
        >
          Return to Patient List
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Patient Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center flex-wrap">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
                  {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h1>
                <div className="flex items-center mt-1 text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>
                      {patient.gender}, {calculateAge(patient.date_of_birth)} yrs
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>DOB: {formatDate(patient.date_of_birth)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>MRN: {patient.mrn}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(patient.status)}`}>
                {patient.status.toUpperCase()}
              </span>
              
              <button
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-1 px-3 rounded text-sm flex items-center"
                onClick={() => navigate(`/medical/patients/${patientId}/edit`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Patient
              </button>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm flex items-center"
                onClick={() => navigate(`/medical/appointments/new?patientId=${patientId}`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Appointment
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              
              <button
                className={`${
                  activeTab === 'timeline'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange('timeline')}
              >
                Timeline
              </button>
              
              <button
                className={`${
                  activeTab === 'charts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange('charts')}
              >
                Charts & Vitals
              </button>
              
              <button
                className={`${
                  activeTab === 'billing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange('billing')}
              >
                Billing & Insurance
              </button>
              
              <button
                className={`${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleTabChange('documents')}
              >
                Documents
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Personal Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact Information</h4>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="mt-1 text-sm text-gray-900">{patient.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="mt-1 text-sm text-gray-900">{patient.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Address</h4>
                    <div className="mt-3">
                      <p className="text-sm text-gray-900">
                        {patient.address || 'No address on file'}
                        {patient.address && patient.city && <><br />{patient.city}, {patient.state} {patient.zip_code}</>}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Primary Provider</h4>
                    <div className="mt-3">
                      <p className="text-sm text-gray-900">
                        {patient.primary_provider_name || 'No provider assigned'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {patient.notes && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Notes</h4>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-line">
                        {patient.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Recent Appointments */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium leading-6 text-gray-900">
                    Recent Appointments
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <p className="text-sm text-gray-500">Loading appointments...</p>
                  <div className="mt-4 text-sm">
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => navigate(`/medical/patients/${patientId}/appointments`)}
                    >
                      View all appointments →
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Recent Vitals */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium leading-6 text-gray-900">
                    Recent Vitals
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <p className="text-sm text-gray-500">Loading vital signs...</p>
                  <div className="mt-4 text-sm">
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => handleTabChange('charts')}
                    >
                      View all vitals →
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Insurance */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium leading-6 text-gray-900">
                    Insurance
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <p className="text-sm text-gray-500">
                    {patient.insurance_provider || 'No insurance information'}
                    {patient.insurance_provider && patient.insurance_id && 
                      <span className="block mt-1">ID: {patient.insurance_id}</span>
                    }
                  </p>
                  <div className="mt-4 text-sm">
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => handleTabChange('billing')}
                    >
                      View insurance details →
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Account Status */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium leading-6 text-gray-900">
                    Account Info
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">Status:</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Created: {formatDate(patient.created_at)}</p>
                    <p>Last Updated: {formatDate(patient.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && <PatientTimelineView patientId={patientId!} />}
        {activeTab === 'charts' && <PatientChartsView patientId={patientId!} />}
        {activeTab === 'billing' && <PatientBillingView patientId={patientId!} />}
        {activeTab === 'documents' && <PatientDocumentsView patientId={patientId!} />}
      </div>
    </div>
  );
};

export default PatientProfileView;