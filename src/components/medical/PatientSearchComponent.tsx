import React, { useState, useEffect, useRef } from 'react';
import patientService, { Patient } from '../../services/patientService';
import { debounce } from 'lodash';

interface PatientSearchComponentProps {
  onSelectPatient: (patient: Patient) => void;
  className?: string;
}

const PatientSearchComponent: React.FC<PatientSearchComponentProps> = ({ 
  onSelectPatient,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await patientService.searchPatients(term);
        setPatients(results);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500)
  ).current;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setIsDropdownOpen(false);
    onSelectPatient(patient);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Search patients by name, phone, or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={() => {
            if (searchTerm.length >= 2 && patients.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {isDropdownOpen && patients.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="font-medium text-gray-900">
                {patient.first_name} {patient.last_name}
              </div>
              <div className="text-sm text-gray-500 flex space-x-4">
                <span>{patient.phone || 'No phone'}</span>
                <span>{patient.email || 'No email'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isDropdownOpen && searchTerm.length >= 2 && patients.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-base ring-1 ring-black ring-opacity-5 text-center">
          <div className="text-gray-500">No patients found</div>
        </div>
      )}
    </div>
  );
};

export default PatientSearchComponent;