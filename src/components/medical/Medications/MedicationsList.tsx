import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Button, Badge, Input } from '../../ui/';

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

interface MedicationsListProps {
  patientId?: number;
  chartId?: number;
  onSelectMedication?: (medication: Medication) => void;
}

const MedicationsList: React.FC<MedicationsListProps> = ({ 
  patientId, 
  chartId, 
  onSelectMedication 
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (patientId) {
          response = await axios.get(`/api/medical/medications/patient/${patientId}`);
        } else if (chartId) {
          response = await axios.get(`/api/medical/medications/chart/${chartId}`);
        } else {
          throw new Error('Either patientId or chartId must be provided');
        }
        
        setMedications(response.data);
        setFilteredMedications(response.data);
      } catch (err) {
        setError('Failed to fetch medications. Please try again later.');
        console.error('Error fetching medications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patientId, chartId]);

  useEffect(() => {
    let filtered = medications;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(med => med.status === filterStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(term) || 
        med.dosage.toLowerCase().includes(term) || 
        med.frequency.toLowerCase().includes(term) ||
        med.reason.toLowerCase().includes(term) ||
        (med.notes && med.notes.toLowerCase().includes(term))
      );
    }
    
    setFilteredMedications(filtered);
  }, [searchTerm, filterStatus, medications]);

  const handleSelectMedication = (medication: Medication) => {
    if (onSelectMedication) {
      onSelectMedication(medication);
    }
  };

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

  if (medications.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        No medications found.
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            className="form-select rounded-md border-gray-300"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Medications</option>
            <option value="active">Active Only</option>
            <option value="discontinued">Discontinued</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Dates</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedications.map((medication) => (
            <tr key={medication.medication_id}>
              <td className="font-medium">{medication.name}</td>
              <td>{medication.dosage}</td>
              <td>{medication.frequency}</td>
              <td>
                {formatDate(medication.start_date)} - {formatDate(medication.end_date)}
              </td>
              <td>{getStatusBadge(medication.status)}</td>
              <td>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleSelectMedication(medication)}
                >
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MedicationsList;