import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import medicalService from '../../services/medicalService';
import LoadingSpinner from '../../components/LoadingSpinner';
import PatientSearchBar from './PatientSearchBar';
import PatientList from './PatientList';
import PatientQuickView from './PatientQuickView';

export interface PatientListItem {
  patient_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

/**
 * PatientManagementView Component
 * 
 * Main view for patient management, including search, list, and quick view
 */
interface PatientManagementState {
  patient_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

const PatientManagementView: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientListItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await medicalService.getPatients();
        setPatients(response.data);
        setFilteredPatients(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(
      patient =>
        patient.first_name.toLowerCase().includes(query) ||
        patient.last_name.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone?.includes(query) ||
        patient.patient_id.includes(query)
    );
    
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  // Handle patient selection
  const handlePatientSelect = (patient: PatientListItem) => {
    setSelectedPatient(patient);
  };

  // Handle patient profile navigation
  const handleViewProfile = (patientId: string) => {
    navigate(`/medical/patients/${patientId}`);
  };

  // Handle new patient creation
  const handleCreatePatient = () => {
    navigate('/medical/patients/new');
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Patient Management</h1>
        <div className="flex justify-between items-center">
          <PatientSearchBar 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange} 
          />
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreatePatient}
          >
            New Patient
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 overflow-auto p-4">
          <PatientList 
            patients={filteredPatients} 
            onPatientSelect={handlePatientSelect}
            selectedPatientId={selectedPatient?.patient_id || ''}
          />
        </div>
        <div className="w-1/3 bg-gray-50 p-4 overflow-auto border-l border-gray-200">
          {selectedPatient ? (
            <PatientQuickView 
              patient={selectedPatient} 
              onViewProfile={() => handleViewProfile(selectedPatient.patient_id)} 
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientManagementView;
