import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Spinner, Alert } from '../../ui/';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendDataPoint {
  test_date: string;
  value: number | string;
  abnormal: boolean;
}

interface LabResultsTrendsProps {
  patientId: number;
  testName: string;
  startDate?: string;
  endDate?: string;
}

const LabResultsTrends: React.FC<LabResultsTrendsProps> = ({ 
  patientId, 
  testName, 
  startDate, 
  endDate 
}) => {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `/api/medical/lab-results/trends/${patientId}/${encodeURIComponent(testName)}`;
        
        // Add query parameters if start/end dates are provided
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await axios.get(url);
        
        // Format data for chart
        const formattedData = response.data.map((item: TrendDataPoint) => ({
          ...item,
          date: new Date(item.test_date).toLocaleDateString(),
          value: typeof item.value === 'string' ? parseFloat(item.value) : item.value
        }));
        
        setTrendData(formattedData);
      } catch (err) {
        setError('Failed to fetch trend data. Please try again later.');
        console.error('Error fetching lab result trends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [patientId, testName, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-4">
        {error}
      </Alert>
    );
  }

  if (trendData.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        No trend data available for {testName}.
      </Alert>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">{testName} - Trend Analysis</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              activeDot={{ r: 8 }}
              name={testName}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default LabResultsTrends;