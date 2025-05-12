import React from 'react';
import { Card, Button, Badge } from '../../ui/';

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

interface LabResultsDetailProps {
  result: LabResult;
  onClose: () => void;
  onPrint?: () => void;
}

const LabResultsDetail: React.FC<LabResultsDetailProps> = ({ 
  result, 
  onClose, 
  onPrint 
}) => {
  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{result.test_name}</h2>
        <div>
          {result.abnormal ? (
            <Badge variant="error" className="mr-2">Abnormal</Badge>
          ) : (
            <Badge variant="success" className="mr-2">Normal</Badge>
          )}
          <span className="text-gray-600">
            {new Date(result.test_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Result</p>
          <p className="text-lg font-medium">
            {result.result} {result.units}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Reference Range</p>
          <p className="text-lg">{result.reference_range}</p>
        </div>
      </div>

      {result.notes && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Notes</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p>{result.notes}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-2">
        {onPrint && (
          <Button 
            variant="outlined" 
            onClick={onPrint}
            startIcon="print"
          >
            Print
          </Button>
        )}
        <Button 
          variant="primary" 
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Card>
  );
};

export default LabResultsDetail;