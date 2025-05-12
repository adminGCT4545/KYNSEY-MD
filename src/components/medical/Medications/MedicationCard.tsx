import * as React from 'react';
import type { FC } from 'react';
import { Card, Button } from '../../ui';
import { getStatusColor } from './utils/medicationUtils';

interface MedicationInterface {
  medication_id: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'discontinued' | 'completed';
  instructions?: string;
  prescriber_name?: string;
}

interface MedicationCardProps {
  medication: MedicationInterface;
  compact?: boolean;
  showActions?: boolean;
  onViewDetails?: (medicationId: number) => void;
  onRefill?: (medicationId: number) => void;
}

export const MedicationCard: FC<MedicationCardProps> = ({
  medication,
  compact = false,
  showActions = true,
  onViewDetails,
  onRefill
}: MedicationCardProps) => {
  const handleViewDetails = React.useCallback(() => {
    if (onViewDetails) {
      onViewDetails(medication.medication_id);
    }
  }, [medication.medication_id, onViewDetails]);

  const handleRefill = React.useCallback(() => {
    if (onRefill) {
      onRefill(medication.medication_id);
    }
  }, [medication.medication_id, onRefill]);

  return (
    <Card 
      className={`${compact ? 'p-3' : 'p-4'} border-l-4 border-l-blue-500`}
      role="article"
      aria-label={`Medication: ${medication.name}`}
    >
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-lg">{medication.name}</h4>
            <span 
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(medication.status)}`}
              role="status"
            >
              {medication.status}
            </span>
          </div>
          
          <p className="text-gray-700">
            {medication.dosage} • {medication.route} • {medication.frequency}
          </p>
          
          {!compact && medication.instructions && (
            <p className="text-gray-600 mt-2 text-sm">{medication.instructions}</p>
          )}
          
          {!compact && medication.prescriber_name && (
            <p className="text-gray-500 text-sm mt-1">
              Prescribed by: {medication.prescriber_name}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-start space-x-2">
            <Button 
              variant="outlined" 
              size="sm" 
              onClick={handleViewDetails}
              aria-label={`View details for ${medication.name}`}
            >
              Details
            </Button>
            <Button 
              variant="filled" 
              size="sm" 
              onClick={handleRefill}
              aria-label={`Request refill for ${medication.name}`}
            >
              Refill
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export type { MedicationInterface };
export default React.memo(MedicationCard);