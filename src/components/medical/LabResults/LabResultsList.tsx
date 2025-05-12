import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Spinner, Alert, Badge } from '../../ui/';

interface LabResult {
  lab_id: number;
  chart_id: number;
  test_name: string;
  test_date: string;
  result: string;
  reference_range: string;
  units: string;
  abnormal: boolean;
  notes: string;
}

interface LabResultsListProps {
  patientId?: number;
  chartId?: number;
  onSelectResult?: (result: LabResult) => void;
}

const LabResultsList: React.FC<LabResultsListProps> = ({ 
  patientId, 
  chartId, 
  onSelectResult 
}) => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (patientId) {
          response = await axios.get(`/api/medical/lab-results/patient/${patientId}`);
        } else if (chartId) {
          response = await axios.get(`/api/medical/lab-results/chart/${chartId}`);
        } else {
          throw new Error('Either patientId or chartId must be provided');
        }
        
        setLabResults(response.data);
      } catch (err) {
        setError('Failed to fetch lab results. Please try again later.');
        console.error('Error fetching lab results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, [patientId, chartId]);

  const handleSelectResult = (result: LabResult) => {
    if (onSelectResult) {
      onSelectResult(result);
    }
  };

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

  if (labResults.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        No lab results found.
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Lab Results</h3>
      <Table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Date</th>
            <th>Result</th>
            <th>Reference Range</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {labResults.map((result) => (
            <tr key={result.lab_id} className={result.abnormal ? 'bg-red-50' : ''}>
              <td className="font-medium">{result.test_name}</td>
              <td>{new Date(result.test_date).toLocaleDateString()}</td>
              <td>
                {result.result} {result.units}
              </td>
              <td>{result.reference_range}</td>
              <td>
                {result.abnormal ? (
                  <Badge variant="error">Abnormal</Badge>
                ) : (
                  <Badge variant="success">Normal</Badge>
                )}
              </td>
              <td>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleSelectResult(result)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default LabResultsList;