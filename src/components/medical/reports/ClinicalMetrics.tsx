import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

// Register ChartJS components
Chart.register(...registerables);

interface ClinicalMetricsProps {
  startDate: string;
  endDate: string;
  location: string;
}

/**
 * Clinical Metrics Component
 * 
 * Displays clinical reports and metrics
 */
const ClinicalMetrics: React.FC<ClinicalMetricsProps> = ({ startDate, endDate, location }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commonConditionsData, setCommonConditionsData] = useState<any | null>(null);
  const [vitalSignsData, setVitalSignsData] = useState<any | null>(null);
  const [abnormalLabsData, setAbnormalLabsData] = useState<any | null>(null);
  const [medicationsData, setMedicationsData] = useState<any | null>(null);
  
  // Fetch clinical reports data
  useEffect(() => {
    const fetchClinicalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await medicalService.getClinicalReports({
          startDate,
          endDate,
          location
        });
        
        setCommonConditionsData(response.data.commonConditions);
        setVitalSignsData(response.data.vitalSigns);
        setAbnormalLabsData(response.data.abnormalLabs);
        setMedicationsData(response.data.medications);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clinical reports:', err);
        setError('Failed to load clinical reports. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchClinicalData();
  }, [startDate, endDate, location]);
  
  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Clinical Metrics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Conditions */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Most Common Conditions</h3>
          {commonConditionsData && (
            <Bar
              data={{
                labels: commonConditionsData.labels,
                datasets: commonConditionsData.datasets
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Patient Count by Condition'
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Patients'
                    }
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Abnormal Labs */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Abnormal Lab Results</h3>
          {abnormalLabsData && (
            <Pie
              data={{
                labels: abnormalLabsData.labels,
                datasets: [
                  {
                    data: abnormalLabsData.data,
                    backgroundColor: abnormalLabsData.backgroundColor
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  title: {
                    display: true,
                    text: 'Distribution of Abnormal Results'
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Vital Signs by Age Group */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Vital Signs by Age Group</h3>
          {vitalSignsData && (
            <Radar
              data={{
                labels: vitalSignsData.ageGroups,
                datasets: vitalSignsData.datasets
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Average Vital Signs Measurements'
                  }
                },
                scales: {
                  r: {
                    angleLines: {
                      display: true
                    },
                    suggestedMin: 0
                  }
                }
              }}
            />
          )}
          <div className="mt-4 text-xs text-gray-500">
            <p>Note: Values are normalized for visualization purposes. Actual measurements vary by vital sign.</p>
          </div>
        </div>
        
        {/* Top Prescribed Medications */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Most Prescribed Medications</h3>
          {medicationsData && (
            <Bar
              data={{
                labels: medicationsData.labels,
                datasets: [
                  {
                    label: 'Prescription Count',
                    data: medicationsData.data,
                    backgroundColor: medicationsData.backgroundColor || '#3f51b5'
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Top Medications by Prescription Count'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Prescription Count'
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
      
      {/* Clinical Insights Summary */}
      <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Clinical Insights</h3>
        <ul className="list-disc pl-5 space-y-2 text-blue-800">
          <li>
            <strong>BMI Tracking:</strong> Average BMI increases with age groups, with the highest in the 51-65 age range.
          </li>
          <li>
            <strong>Blood Pressure:</strong> Systolic pressure shows a steady increase across age groups, while diastolic varies less.
          </li>
          <li>
            <strong>Lab Testing:</strong> The most common abnormal results are in cholesterol and A1C tests, suggesting focus areas for patient education.
          </li>
          <li>
            <strong>Medication Analysis:</strong> Consider medication review for patients with multiple prescriptions from the most common categories.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ClinicalMetrics;