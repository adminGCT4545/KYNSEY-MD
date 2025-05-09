import React from 'react';

interface ReportSelectorProps {
  selectedReport: string;
  onReportChange: (reportType: string) => void;
}

/**
 * Report Selector Component
 * 
 * Component for selecting different types of reports
 */
const ReportSelector: React.FC<ReportSelectorProps> = ({ selectedReport, onReportChange }) => {
  // Report types
  const reportTypes = [
    { id: 'financial', name: 'Financial' },
    { id: 'clinical', name: 'Clinical' },
    { id: 'operational', name: 'Operational' },
    { id: 'custom', name: 'Custom Report' }
  ];

  return (
    <div className="w-64">
      <label htmlFor="report-selector" className="block text-sm font-medium text-gray-700 mb-1">
        Report Type
      </label>
      <select
        id="report-selector"
        value={selectedReport}
        onChange={(e) => onReportChange(e.target.value)}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        {reportTypes.map((report) => (
          <option key={report.id} value={report.id}>
            {report.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ReportSelector;