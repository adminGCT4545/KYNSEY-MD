import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

interface PatientChartsViewProps {
  patientId: string;
}

interface VitalSign {
  id: string;
  patient_id: string;
  date: string;
  vital_type: string;
  value: number;
  unit: string;
  notes?: string;
}

interface ChartEntry {
  id: string;
  patient_id: string;
  date: string;
  provider_id: string;
  provider_name: string;
  entry_type: string;
  chief_complaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis_codes?: string[];
  procedure_codes?: string[];
}

/**
 * Patient Charts View Component
 * 
 * Displays patient medical charts and vital signs
 */
const PatientChartsView: React.FC<PatientChartsViewProps> = ({ patientId }) => {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [chartEntries, setChartEntries] = useState<ChartEntry[]>([]);
  const [selectedVitalType, setSelectedVitalType] = useState<string>('blood_pressure');
  const [selectedEntry, setSelectedEntry] = useState<ChartEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<boolean>(false);
  
  // Available vital sign types
  const vitalTypes = [
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'respiratory_rate', label: 'Respiratory Rate' },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation' },
    { value: 'weight', label: 'Weight' },
    { value: 'height', label: 'Height' },
    { value: 'bmi', label: 'BMI' }
  ];
  
  // Fetch vital signs and chart entries on component mount
  useEffect(() => {
    const fetchChartData = async (isRetry = false) => {
      try {
        setLoading(true);
        setError(null);
        if (isRetry) setRetrying(true);
        
        const [vitalSignsResponse, chartEntriesResponse] = await Promise.all([
          medicalService.getVitalSigns(patientId),
          medicalService.getPatientChart(patientId)
        ]);
        
        setVitalSigns(vitalSignsResponse.data);
        setChartEntries(chartEntriesResponse.data);
        
        if (chartEntriesResponse.data.length > 0) {
          setSelectedEntry(chartEntriesResponse.data[0]);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching chart data:', err);
        const errorMessage = err.statusCode === 404
          ? 'Patient chart not found.'
          : !navigator.onLine
          ? 'No internet connection. Please check your network and try again.'
          : 'Failed to load chart data. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };

    fetchChartData();
  }, [patientId]);
  
  // Filter vital signs by selected type
  const filteredVitalSigns = vitalSigns.filter(vs => vs.vital_type === selectedVitalType);
  
  // Sort chart entries by date (newest first)
  const sortedChartEntries = [...chartEntries].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Prepare vital signs chart data
  const vitalSignsChartData = {
    labels: filteredVitalSigns.map(vs => formatDate(vs.date)),
    datasets: [
      {
        label: vitalTypes.find(vt => vt.value === selectedVitalType)?.label || selectedVitalType,
        data: filteredVitalSigns.map(vs => vs.value),
        fill: false,
        backgroundColor: 'rgb(66, 153, 225)',
        borderColor: 'rgba(66, 153, 225, 0.8)',
        tension: 0.1
      }
    ]
  };
  
  // Get vital signs chart options based on selected type
  const getChartOptions = () => {
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    };
    
    // Customize based on vital type
    switch (selectedVitalType) {
      case 'blood_pressure':
        return {
          ...defaultOptions,
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 60,
              suggestedMax: 180,
              title: {
                display: true,
                text: 'mmHg'
              }
            }
          }
        };
      case 'heart_rate':
        return {
          ...defaultOptions,
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 40,
              suggestedMax: 120,
              title: {
                display: true,
                text: 'bpm'
              }
            }
          }
        };
      case 'temperature':
        return {
          ...defaultOptions,
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 95,
              suggestedMax: 105,
              title: {
                display: true,
                text: '°F'
              }
            }
          }
        };
      default:
        return defaultOptions;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner />
        {retrying && (
          <p className="mt-4 text-gray-600">Retrying connection...</p>
        )}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-300 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
        <button
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={() => fetchChartData(true)}
          disabled={retrying}
        >
          {retrying ? 'Retrying...' : 'Retry Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Vital Signs Section */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Vital Signs</h2>
          
          <select
            value={selectedVitalType}
            onChange={(e) => setSelectedVitalType(e.target.value)}
            className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {vitalTypes.map((vitalType) => (
              <option key={vitalType.value} value={vitalType.value}>
                {vitalType.label}
              </option>
            ))}
          </select>
        </div>
        
        {filteredVitalSigns.length > 0 ? (
          <div className="h-64">
            <Line 
              data={vitalSignsChartData}
              options={getChartOptions()}
            />
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No {vitalTypes.find(vt => vt.value === selectedVitalType)?.label} data available.</p>
          </div>
        )}
        
        {filteredVitalSigns.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVitalSigns.slice().reverse().map((vs) => (
                  <tr key={vs.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(vs.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vs.value} {vs.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vs.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Chart Entries Section */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Chart Entries</h2>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Chart Entry List */}
          <div className="w-full md:w-1/3">
            <div className="bg-gray-50 rounded-md border border-gray-200 h-96 overflow-y-auto">
              {sortedChartEntries.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {sortedChartEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className={`cursor-pointer hover:bg-gray-100 p-4 ${selectedEntry?.id === entry.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">
                          {entry.entry_type === 'soap_note' ? 'SOAP Note' : entry.entry_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {entry.chief_complaint || entry.assessment || 'No chief complaint'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Provider: {entry.provider_name}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No chart entries available.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chart Entry Detail */}
          <div className="w-full md:w-2/3 bg-gray-50 rounded-md border border-gray-200 p-4">
            {selectedEntry ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedEntry.entry_type === 'soap_note' ? 'SOAP Note' : selectedEntry.entry_type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedEntry.date)} | Provider: {selectedEntry.provider_name}
                    </p>
                  </div>
                </div>
                
                {/* Chief Complaint */}
                {selectedEntry.chief_complaint && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Chief Complaint</h4>
                    <p className="p-2 bg-white border border-gray-200 rounded">{selectedEntry.chief_complaint}</p>
                  </div>
                )}
                
                {/* SOAP Note Content */}
                {selectedEntry.entry_type === 'soap_note' && (
                  <>
                    {/* Subjective */}
                    {selectedEntry.subjective && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Subjective</h4>
                        <div className="p-2 bg-white border border-gray-200 rounded whitespace-pre-line">
                          {selectedEntry.subjective}
                        </div>
                      </div>
                    )}
                    
                    {/* Objective */}
                    {selectedEntry.objective && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Objective</h4>
                        <div className="p-2 bg-white border border-gray-200 rounded whitespace-pre-line">
                          {selectedEntry.objective}
                        </div>
                      </div>
                    )}
                    
                    {/* Assessment */}
                    {selectedEntry.assessment && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Assessment</h4>
                        <div className="p-2 bg-white border border-gray-200 rounded whitespace-pre-line">
                          {selectedEntry.assessment}
                        </div>
                      </div>
                    )}
                    
                    {/* Plan */}
                    {selectedEntry.plan && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Plan</h4>
                        <div className="p-2 bg-white border border-gray-200 rounded whitespace-pre-line">
                          {selectedEntry.plan}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Diagnosis Codes */}
                {selectedEntry.diagnosis_codes && selectedEntry.diagnosis_codes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Diagnosis Codes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.diagnosis_codes.map((code, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Procedure Codes */}
                {selectedEntry.procedure_codes && selectedEntry.procedure_codes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase mb-1">Procedure Codes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.procedure_codes.map((code, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                <p className="text-gray-500">Select a chart entry to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChartsView;