import React from 'react';
import { Card, Button, Badge } from '../../ui/';

interface Medication {
  medication_id: number;
  chart_id: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date?: string;
  prescriber_id: number;
  prescriber_name?: string;
  status: 'active' | 'discontinued' | 'completed';
  reason: string;
  notes?: string;
}

interface MedicationDetailProps {
  medication: Medication;
  onEdit: () => void;
  onClose: () => void;
  onDiscontinue?: () => void;
  canEdit: boolean;
}

const MedicationDetail: React.FC<MedicationDetailProps> = ({
  medication,
  onEdit,
  onClose,
  onDiscontinue,
  canEdit = true
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Ongoing';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusVariants = {
      'active': 'success',
      'discontinued': 'error',
      'completed': 'info'
    };
    
    return (
      <Badge variant={statusVariants[status as keyof typeof statusVariants] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRouteDisplay = (route: string): string => {
    const routes: Record<string, string> = {
      'oral': 'Oral',
      'topical': 'Topical',
      'inhalation': 'Inhalation',
      'intravenous': 'Intravenous (IV)',
      'intramuscular': 'Intramuscular (IM)',
      'subcutaneous': 'Subcutaneous',
      'rectal': 'Rectal',
      'vaginal': 'Vaginal',
      'ophthalmic': 'Ophthalmic (Eye)',
      'otic': 'Otic (Ear)',
      'nasal': 'Nasal',
      'sublingual': 'Sublingual',
      'transdermal': 'Transdermal',
      'other': 'Other'
    };
    
    return routes[route] || route;
  };

  const getFrequencyDisplay = (frequency: string): string => {
    const frequencies: Record<string, string> = {
      'once_daily': 'Once daily',
      'twice_daily': 'Twice daily (BID)',
      'three_daily': 'Three times daily (TID)',
      'four_daily': 'Four times daily (QID)',
      'every_morning': 'Every morning (QAM)',
      'every_night': 'Every night (QHS)',
      'every_other_day': 'Every other day',
      'weekly': 'Weekly',
      'as_needed': 'As needed (PRN)',
      'other': 'Other'
    };
    
    return frequencies[frequency] || frequency;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">{medication.name}</h2>
        {getStatusBadge(medication.status)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Dosage</h3>
          <p className="text-base">{medication.dosage}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Route</h3>
          <p className="text-base">{getRouteDisplay(medication.route)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
          <p className="text-base">{getFrequencyDisplay(medication.frequency)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Duration</h3>
          <p className="text-base">
            {formatDate(medication.start_date)} - {formatDate(medication.end_date)}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Reason</h3>
          <p className="text-base">{medication.reason}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Prescriber</h3>
          <p className="text-base">{medication.prescriber_name || `Provider ID: ${medication.prescriber_id}`}</p>
        </div>
      </div>
      
      {medication.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{medication.notes}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Close
        </Button>
        
        {canEdit && medication.status === 'active' && onDiscontinue && (
          <Button
            variant="error"
            onClick={onDiscontinue}
          >
            Discontinue
          </Button>
        )}
        
        {canEdit && (
          <Button
            variant="primary"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MedicationDetail;