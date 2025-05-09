import React, { useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

// Register ChartJS components
Chart.register(...registerables);

interface CustomReportBuilderProps {
  startDate: string;
  endDate: string;
  location: string;
}

interface ReportParams {
  dataSource: string;
  dimensions: string[];
  metrics: string[];
  filters: {
    providerIds?: number[];
    statuses?: string[];
    appointmentTypes?: string[];
  };
}

/**
 * Custom Report Builder Component
 * 
 * Allows users to build custom reports by selecting data sources,
 * dimensions, metrics, and filters
 */
const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ startDate, endDate, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [chartType, setChartType] = useState<string>('bar');
  const [reportParams, setReportParams] = useState<ReportParams>({
    dataSource: 'appointments',
    dimensions: ['month'],
    metrics: ['count'],
    filters: {}
  });
  
  // Available data sources
  const dataSources = [
    { value: 'appointments', label: 'Appointments' },
    { value: 'patients', label: 'Patients' },
    { value: 'claims', label: 'Claims' },
    { value: 'payments', label: 'Payments' }
  ];
  
  // Available dimensions
  const dimensions = [
    { value: 'month', label: 'Month' },
    { value: 'provider', label: 'Provider' },
    { value: 'patient', label: 'Patient' },
    { value: 'status', label: 'Status' },
    { value: 'appointmentType', label: 'Appointment Type' },
    { value: 'insurance', label: 'Insurance' }
  ];
  
  // Available metrics
  const metrics = [
    { value: 'count', label: 'Count' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'avgDuration', label: 'Average Duration' },
    { value: 'noShowRate', label: 'No-Show Rate' },
    { value: 'claimApprovalRate', label: 'Claim Approval Rate' }
  ];
  
  // Available chart types
  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'doughnut', label: 'Doughnut Chart' }
  ];
  
  // Handle input changes
  const handleInputChange = (field: keyof ReportParams, value: any) => {
    setReportParams({
      ...reportParams,
      [field]: value
    });
  };
  
  // Handle dimension selection
  const handleDimensionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    handleInputChange('dimensions', selectedOptions);
  };
  
  // Handle metric selection
  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    handleInputChange('metrics', selectedOptions);
  };
  
  // Generate the report
  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await medicalService.getCustomReports({
        startDate,
        endDate,
        location,
        ...reportParams
      });
      
      setReportData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error generating custom report:', err);
      setError('Failed to generate report. Please try again or adjust your parameters.');
      setLoading(false);
    }
  };
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    if (!reportData || !reportData.chartData) {
      return null;
    }
    
    const chartProps = {
      data: reportData.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: `Custom Report: ${reportParams.dimensions.join(', ')} by ${reportParams.metrics.join(', ')}`
          }
        }
      }
    };
    
    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Custom Report Builder</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Configure Report</h3>
          
          {/* Data Source Selection */}
          <div className="mb-4">
            <label htmlFor="data-source" className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label>
            <select
              id="data-source"
              value={reportParams.dataSource}
              onChange={(e) => handleInputChange('dataSource', e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {dataSources.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Dimensions Selection */}
          <div className="mb-4">
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions (Group By)
            </label>
            <select
              id="dimensions"
              multiple
              value={reportParams.dimensions}
              onChange={handleDimensionChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              size={4}
            >
              {dimensions.map((dimension) => (
                <option 
                  key={dimension.value} 
                  value={dimension.value}
                  disabled={
                    (dimension.value === 'insurance' && reportParams.dataSource !== 'patients') ||
                    (dimension.value === 'appointmentType' && reportParams.dataSource !== 'appointments')
                  }
                >
                  {dimension.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          
          {/* Metrics Selection */}
          <div className="mb-4">
            <label htmlFor="metrics" className="block text-sm font-medium text-gray-700 mb-1">
              Metrics (Values to Calculate)
            </label>
            <select
              id="metrics"
              multiple
              value={reportParams.metrics}
              onChange={handleMetricChange}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              size={3}
            >
              {metrics.map((metric) => (
                <option 
                  key={metric.value} 
                  value={metric.value}
                  disabled={
                    (metric.value === 'revenue' && !['claims', 'payments'].includes(reportParams.dataSource)) ||
                    (metric.value === 'avgDuration' && reportParams.dataSource !== 'appointments') ||
                    (metric.value === 'noShowRate' && reportParams.dataSource !== 'appointments') ||
                    (metric.value === 'claimApprovalRate' && reportParams.dataSource !== 'claims')
                  }
                >
                  {metric.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          
          {/* Chart Type Selection */}
          <div className="mb-4">
            <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type
            </label>
            <select
              id="chart-type"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {chartTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Generate Report Button */}
          <div className="mt-6">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
        
        {/* Report Results */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Report Results</h3>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {!loading && !error && reportData && (
            <div className="h-64">
              {renderChart()}
            </div>
          )}
          
          {!loading && !error && !reportData && (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <p>Configure your report parameters and click "Generate Report"</p>
              <p className="text-sm mt-2">Your custom report will appear here</p>
            </div>
          )}
          
          {/* Report Data Table */}
          {!loading && !error && reportData && reportData.rawData && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Data Table</h4>
              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {reportData.rawData.length > 0 && Object.keys(reportData.rawData[0]).map((header) => (
                        <th 
                          key={header}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          {header.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.rawData.map((row: any, index: number) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, i: number) => (
                          <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {typeof value === 'number' ? 
                              (String(value).includes('.') ? parseFloat(value).toFixed(2) : value) :
                              (value ? String(value) : '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Export Buttons (for future implementation) */}
          {!loading && !error && reportData && (
            <div className="mt-4 flex justify-end space-x-2">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded text-sm">
                Export CSV
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded text-sm">
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;