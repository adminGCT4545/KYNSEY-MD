import React from 'react';
import { PatientListItem } from './PatientManagementView';

interface PatientListProps {
  patients: PatientListItem[];
  onPatientSelect: (patient: PatientListItem) => void;
  selectedPatientId?: string;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onPatientSelect,
  selectedPatientId
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {patients.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No patients found
        </div>
      ) : (
        <div className="divide-y">
          {patients.map((patient) => (
            <div
              key={patient.patient_id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedPatientId === patient.patient_id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onPatientSelect(patient)}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  {patient.email && (
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  )}
                </div>
                {patient.phone && (
                  <div className="text-sm text-gray-500">{patient.phone}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;
