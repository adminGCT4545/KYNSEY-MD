import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

// Register ChartJS components
Chart.register(...registerables);

interface FinancialDashboardProps {
  startDate: string;
  endDate: string;
  location: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

/**
 * Financial Dashboard Component
 * 
 * Displays financial reports and metrics
 */
const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ startDate, endDate, location }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [claimStatusData, setClaimStatusData] = useState<any | null>(null);
  const [dailyRevenueData, setDailyRevenueData] = useState<ChartData | null>(null);
  
  // Fetch financial reports data
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await medicalService.getFinancialReports({
          startDate,
          endDate,
          location
        });
        
        setRevenueData(response.data.revenue);
        setClaimStatusData(response.data.claimStatus);
        setDailyRevenueData(response.data.dailyRevenue);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching financial reports:', err);
        setError('Failed to load financial reports. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchFinancialData();
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
      <h2 className="text-xl font-bold text-gray-800 mb-6">Financial Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs. Expenses */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue vs. Expenses</h3>
          {revenueData && (
            <Bar
              data={revenueData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly Revenue and Expenses'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount ($)'
                    }
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Claim Status */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Claim Status Distribution</h3>
          {claimStatusData && (
            <Pie
              data={{
                labels: claimStatusData.labels,
                datasets: [
                  {
                    data: claimStatusData.data,
                    backgroundColor: claimStatusData.backgroundColor || [
                      '#4caf50', // Approved
                      '#ff9800', // Pending
                      '#f44336'  // Denied
                    ],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  title: {
                    display: true,
                    text: 'Insurance Claim Status'
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Daily Revenue */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Revenue</h3>
          {dailyRevenueData && (
            <Line
              data={dailyRevenueData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Revenue by Day'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue ($)'
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <SummaryCard 
          title="Total Revenue" 
          value={calculateTotalRevenue(revenueData)} 
          trend={10.5} 
          color="green" 
        />
        <SummaryCard 
          title="Total Expenses" 
          value={calculateTotalExpenses(revenueData)} 
          trend={-5.2} 
          color="red" 
        />
        <SummaryCard 
          title="Claim Approval Rate" 
          value={calculateApprovalRate(claimStatusData)} 
          trend={2.3} 
          color="blue" 
          isPercentage={true}
        />
      </div>
    </div>
  );
};

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: number | string;
  trend: number;
  color: string;
  isPercentage?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, trend, color, isPercentage }) => {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };
  
  const getColorClasses = (): { bg: string, text: string } => {
    switch (color) {
      case 'green':
        return { bg: 'bg-green-50', text: 'text-green-700' };
      case 'red':
        return { bg: 'bg-red-50', text: 'text-red-700' };
      case 'blue':
        return { bg: 'bg-blue-50', text: 'text-blue-700' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700' };
    }
  };
  
  const colorClasses = getColorClasses();
  
  return (
    <div className={`${colorClasses.bg} p-4 rounded-md shadow border border-gray-200`}>
      <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
      <div className={`text-2xl font-bold mt-1 ${colorClasses.text}`}>{formatValue(value)}</div>
      <div className="mt-1 flex items-center">
        <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="text-gray-500 text-xs ml-2">vs last period</span>
      </div>
    </div>
  );
};

// Utility functions
const calculateTotalRevenue = (data: ChartData | null): number => {
  if (!data || !data.datasets || data.datasets.length === 0) return 0;
  
  const revenueDataset = data.datasets.find(dataset => dataset.label === 'Revenue');
  if (!revenueDataset) return 0;
  
  return revenueDataset.data.reduce((sum, value) => sum + value, 0);
};

const calculateTotalExpenses = (data: ChartData | null): number => {
  if (!data || !data.datasets || data.datasets.length === 0) return 0;
  
  const expensesDataset = data.datasets.find(dataset => dataset.label === 'Expenses');
  if (!expensesDataset) return 0;
  
  return expensesDataset.data.reduce((sum, value) => sum + value, 0);
};

const calculateApprovalRate = (data: any | null): number => {
  if (!data || !data.labels || !data.data) return 0;
  
  const approvedIndex = data.labels.findIndex((label: string) => 
    label.toLowerCase() === 'approved' || label.toLowerCase() === 'paid'
  );
  
  if (approvedIndex === -1) return 0;
  
  const total = data.data.reduce((sum: number, value: number) => sum + value, 0);
  if (total === 0) return 0;
  
  return (data.data[approvedIndex] / total) * 100;
};

export default FinancialDashboard;