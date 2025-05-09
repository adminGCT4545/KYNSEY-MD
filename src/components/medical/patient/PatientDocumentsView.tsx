import React from 'react';
import { PatientDocumentsManagement } from '../PatientDocumentsManagement';

interface PatientDocumentsViewProps {
  patientId: string;
}

/**
 * Patient Documents View Component
 * 
 * Shows and manages patient documents including upload, viewing, and categorization.
 */
const PatientDocumentsView: React.FC<PatientDocumentsViewProps> = ({ patientId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <PatientDocumentsManagement patientId={patientId} />
    </div>
  );
};

export default PatientDocumentsView;