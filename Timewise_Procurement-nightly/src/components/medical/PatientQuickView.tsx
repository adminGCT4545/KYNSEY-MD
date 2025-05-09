import React from 'react';
import { PatientListItem } from './PatientManagementView';

interface PatientQuickViewProps {
  patient: PatientListItem;
  onViewProfile: () => void;
}

const PatientQuickView: React.FC<PatientQuickViewProps> = ({ patient, onViewProfile }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">
          {patient.first_name} {patient.last_name}
        </h2>
        <button
          onClick={onViewProfile}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          View Full Profile
        </button>
      </div>

      <div className="space-y-3">
        {patient.email && (
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p>{patient.email}</p>
          </div>
        )}

        {patient.phone && (
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p>{patient.phone}</p>
          </div>
        )}

        <div>
          <label className="text-sm text-gray-500">Patient ID</label>
          <p>{patient.patient_id}</p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onViewProfile}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Open Patient Profile
        </button>
      </div>
    </div>
  );
};

export default PatientQuickView;
