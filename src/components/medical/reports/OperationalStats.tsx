import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Doughnut, Scatter } from 'react-chartjs-2';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

// Register ChartJS components
Chart.register(...registerables);

interface OperationalStatsProps {
  startDate: string;
  endDate: string;
  location: string;
}

/**
 * Operational Stats Component
 * 
 * Displays operational statistics and metrics
 */
const OperationalStats: React.FC<OperationalStatsProps> = ({ startDate, endDate, location }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [providerProductivityData, setProviderProductivityData] = useState<any | null>(null);
  const [operatoryUtilizationData, setOperatoryUtilizationData] = useState<any | null>(null);
  const [noShowRateData, setNoShowRateData] = useState<any | null>(null);
  const [waitTimesData, setWaitTimesData] = useState<any | null>(null);
  
  // Fetch operational reports data
  useEffect(() => {
    const fetchOperationalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await medicalService.getOperationalReports({
          startDate,
          endDate,
          location
        });
        
        setProviderProductivityData(response.data.providerProductivity);
        setOperatoryUtilizationData(response.data.operatoryUtilization);
        setNoShowRateData(response.data.noShowRate);
        setWaitTimesData(response.data.waitTimes);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching operational reports:', err);
        setError('Failed to load operational reports. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOperationalData();
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
      <h2 className="text-xl font-bold text-gray-800 mb-6">Operational Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Productivity */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Provider Productivity</h3>
          {providerProductivityData && (
            <Bar
              data={{
                labels: providerProductivityData.labels,
                datasets: providerProductivityData.datasets
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Appointments Per Hour by Provider'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Appointments Per Hour'
                    }
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Operatory Utilization */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Operatory Utilization</h3>
          {operatoryUtilizationData && (
            <Doughnut
              data={{
                labels: operatoryUtilizationData.labels,
                datasets: [
                  {
                    label: 'Utilization %',
                    data: operatoryUtilizationData.datasets[0].data,
                    backgroundColor: [
                      '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', 
                      '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
                    ]
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
                    text: 'Room Utilization Percentage'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.label || '';
                        let value = context.raw || 0;
                        return `${label}: ${value}% utilization`;
                      }
                    }
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* No-Show Rate Over Time */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">No-Show Rate Over Time</h3>
          {noShowRateData && (
            <Line
              data={noShowRateData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  title: {
                    display: true,
                    text: 'Monthly No-Show Percentage'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'No-Show Rate (%)'
                    },
                    suggestedMax: 30 // Cap at 30% for better visualization
                  }
                }
              }}
            />
          )}
          <div className="mt-4 flex justify-between text-sm">
            <div className="text-red-600">
              <span className="font-medium">High Risk:</span> &gt; 15%
            </div>
            <div className="text-yellow-600">
              <span className="font-medium">Moderate Risk:</span> 5-15%
            </div>
            <div className="text-green-600">
              <span className="font-medium">Low Risk:</span> &lt; 5%
            </div>
          </div>
        </div>
        
        {/* Average Wait Times */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Average Wait Times</h3>
          {waitTimesData && (
            <Bar
              data={waitTimesData}
              options={{
                indexAxis: 'y',
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Average Wait Time by Provider (Minutes)'
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Minutes'
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
      
      {/* Efficiency Score Card */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Efficiency Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Avg Appointment Duration"
            value="42.3 min"
            change={-5.2}
            isGoodChange={true}
            description="Average time spent on appointments"
          />
          <MetricCard
            title="Provider Utilization"
            value="87.4%"
            change={3.1}
            isGoodChange={true}
            description="Provider time utilization rate"
          />
          <MetricCard
            title="Avg Patient Wait Time"
            value="12.8 min"
            change={-2.7}
            isGoodChange={true}
            description="Average patient waiting time"
          />
          <MetricCard
            title="No-Show Rate"
            value="8.2%"
            change={-1.4}
            isGoodChange={true}
            description="Percentage of missed appointments"
          />
        </div>
      </div>
      
      {/* Operational Insights */}
      <div className="mt-8 bg-green-50 p-4 rounded-md border border-green-200">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Operational Insights</h3>
        <ul className="list-disc pl-5 space-y-2 text-green-800">
          <li>
            <strong>Scheduling Efficiency:</strong> Providers with higher productivity rates may have optimal scheduling templates that can be replicated.
          </li>
          <li>
            <strong>Operatory Utilization:</strong> Some treatment rooms show significantly lower utilization. Consider reallocating resources or reevaluating room assignments.
          </li>
          <li>
            <strong>No-Show Management:</strong> No-show rates have improved but remain above target 5% threshold. Continue with appointment reminder initiatives.
          </li>
          <li>
            <strong>Wait Time Reduction:</strong> Average wait times vary significantly by provider. Consider standardizing preparation protocols.
          </li>
        </ul>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  isGoodChange: boolean;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isGoodChange, description }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow border border-gray-200">
      <div className="flex justify-between items-start">
        <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
        <span 
          className={`text-xs font-medium px-2 py-1 rounded ${
            isGoodChange ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {change > 0 ? '+' : ''}{change}%
        </span>
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
};

export default OperationalStats;