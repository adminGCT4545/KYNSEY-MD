import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import medicalService from '../../services/medicalService';

// Simple inline patient search component
const PatientSearchBox = ({ onSearch, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search patients by name or ID..."
      />
      <button 
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
      >
        Search
      </button>
    </form>
  );
};

/**
 * Charts View Component
 * Main component for accessing patient charts and vital signs
 */
const ChartsView = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await medicalService.getPatients();
        setPatients(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patient data. Please try again later.');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle patient selection
  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);
    navigate(`/medical/patients/${patientId}`);
  };

  // Handle patient search
  const handleSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await medicalService.getPatients({ searchTerm });
      setPatients(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('Failed to search patients. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Patient Charts</h1>
        <p className="text-gray-600 mb-4">
          Search for a patient to view their medical charts and vital signs
        </p>
        
        {/* Patient Search */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Find Patient</h2>
          <PatientSearchBox onSearch={handleSearch} onSelectPatient={handlePatientSelect} />
        </div>
      </div>
      
      {/* Patient Results */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600">No patients found. Try searching for a patient above.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOB
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.last_name}, {patient.first_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {patient.patient_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handlePatientSelect(patient.patient_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md"
                      >
                        View Charts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsView;