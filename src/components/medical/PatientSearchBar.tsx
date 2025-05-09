import React from 'react';

interface PatientSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="w-full max-w-lg">
      <input
        type="text"
        placeholder="Search patients by name, email, or ID..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default PatientSearchBar;
