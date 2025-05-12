import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';

// Placeholder components to reduce external dependencies
const Spinner = () => <div role="status" aria-label="Loading...">Loading...</div>;
const Alert = ({ variant, children }) => <div role="alert" className={`alert alert-${variant}`}>{children}</div>;
const Button = ({ onClick, children, ...props }) => <button onClick={onClick} {...props}>{children}</button>;

// Simplified MedicationCard and MedicationInterface
interface MedicationInterface {
  medication_id: number | string;
  name: string;
  dosage: string;
  frequency: string;
}

const MedicationCard = ({ medication }: { medication: MedicationInterface }) => (
  <div className="medication-card">
    <h4>{medication.name}</h4>
    <p>Dosage: {medication.dosage}</p>
    <p>Frequency: {medication.frequency}</p>
  </div>
);

interface MedicationListProps {
  patientId: string | number;
  compact?: boolean;
  showActions?: boolean;
  maxItems?: number;
  onViewDetails?: (medicationId: number) => void;
  onRefill?: (medicationId: number) => void;
}

const MedicationList: React.FC<MedicationListProps> = ({
  patientId,
  compact = false,
  showActions = true,
  maxItems = 5,
  onViewDetails,
  onRefill
}) => {
  const [medications, setMedications] = useState<MedicationInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const fetchMedications = useCallback(async () => {
    if (!patientId) {
      setError('Patient ID is required');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<MedicationInterface[]>(
        `/api/medical/medications/patient/${patientId}?status=active`
      );
      if (!response.data) {
        throw new Error('No data received from server');
      }
      setMedications(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load medications');
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const displayedMedications = useMemo(() => {
    return showAll ? medications : medications.slice(0, maxItems);
  }, [medications, showAll, maxItems]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (!medications || medications.length === 0) {
    return <Alert variant="info">No active medications found</Alert>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Current Medications</h3>
      <div className="space-y-4">
        {displayedMedications.map((medication) => (
          <MedicationCard
            key={medication.medication_id}
            medication={medication}
          />
        ))}
      </div>
      {medications.length > maxItems && !showAll && (
        <Button 
          onClick={() => setShowAll(true)}
          aria-label={`Show all ${medications.length} medications`}
        >
          Show All Medications ({medications.length})
        </Button>
      )}
      {showAll && medications.length > maxItems && (
        <Button 
          onClick={() => setShowAll(false)}
          aria-label="Show fewer medications"
        >
          Show Less
        </Button>
      )}
    </div>
  );
};

export default MedicationList;