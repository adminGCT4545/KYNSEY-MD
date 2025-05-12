import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input, Alert, Spinner } from '../../ui/';

interface Medication {
  medication_id?: number;
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

interface MedicationFormProps {
  chartId: number;
  providerId: number;
  existingMedication?: Medication;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  chartId,
  providerId,
  existingMedication,
  onSave,
  onCancel
}) => {
  const [medication, setMedication] = useState<Medication>({
    chart_id: chartId,
    name: '',
    dosage: '',
    frequency: '',
    route: '',
    start_date: new Date().toISOString().split('T')[0],
    prescriber_id: providerId,
    status: 'active',
    reason: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [medicationSuggestions, setMedicationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Routes of administration options
  const routeOptions = [
    { value: 'oral', label: 'Oral' },
    { value: 'topical', label: 'Topical' },
    { value: 'inhalation', label: 'Inhalation' },
    { value: 'intravenous', label: 'Intravenous (IV)' },
    { value: 'intramuscular', label: 'Intramuscular (IM)' },
    { value: 'subcutaneous', label: 'Subcutaneous' },
    { value: 'rectal', label: 'Rectal' },
    { value: 'vaginal', label: 'Vaginal' },
    { value: 'ophthalmic', label: 'Ophthalmic (Eye)' },
    { value: 'otic', label: 'Otic (Ear)' },
    { value: 'nasal', label: 'Nasal' },
    { value: 'sublingual', label: 'Sublingual' },
    { value: 'transdermal', label: 'Transdermal' },
    { value: 'other', label: 'Other' }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily (BID)' },
    { value: 'three_daily', label: 'Three times daily (TID)' },
    { value: 'four_daily', label: 'Four times daily (QID)' },
    { value: 'every_morning', label: 'Every morning (QAM)' },
    { value: 'every_night', label: 'Every night (QHS)' },
    { value: 'every_other_day', label: 'Every other day' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as_needed', label: 'As needed (PRN)' },
    { value: 'other', label: 'Other' }
  ];

  // Load existing medication data if provided
  useEffect(() => {
    if (existingMedication) {
      setMedication(existingMedication);
    }
  }, [existingMedication]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMedication(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMedication(prev => ({ ...prev, name: value }));
    
    // Only search for suggestions if the user has typed at least 3 characters
    if (value.length >= 3) {
      try {
        const response = await axios.get(`/api/medical/medications/search?query=${value}`);
        setMedicationSuggestions(response.data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching medication suggestions:', err);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMedication(prev => ({ ...prev, name: suggestion }));
    setShowSuggestions(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!medication.name || !medication.dosage || !medication.frequency || !medication.route) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      let savedMedication;
      if (existingMedication?.medication_id) {
        // Update existing medication
        const response = await axios.put(`/api/medical/medications/${existingMedication.medication_id}`, medication);
        savedMedication = response.data;
      } else {
        // Create new medication
        const response = await axios.post('/api/medical/medications', medication);
        savedMedication = response.data;
      }
      
      onSave(savedMedication);
    } catch (err) {
      console.error('Error saving medication:', err);
      setError('Failed to save medication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">
        {existingMedication ? 'Edit Medication' : 'Add New Medication'}
      </h2>
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medication Name*
          </label>
          <div className="relative">
            <Input
              name="name"
              value={medication.name}
              onChange={handleMedicationNameChange}
              placeholder="Enter medication name"
              required
              className="w-full"
            />
            
            {showSuggestions && medicationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {medicationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage*
            </label>
            <Input
              name="dosage"
              value={medication.dosage}
              onChange={handleInputChange}
              placeholder="Ex: 500mg, 10ml, etc."
              required
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route of Administration*
            </label>
            <select
              name="route"
              value={medication.route}
              onChange={handleInputChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select route</option>
              {routeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency*
            </label>
            <select
              name="frequency"
              value={medication.frequency}
              onChange={handleInputChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status*
            </label>
            <select
              name="status"
              value={medication.status}
              onChange={handleInputChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date*
            </label>
            <Input
              type="date"
              name="start_date"
              value={medication.start_date}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              name="end_date"
              value={medication.end_date || ''}
              onChange={handleInputChange}
              className="w-full"
            />
            <span className="text-xs text-gray-500">Leave blank if ongoing</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Medication*
          </label>
          <Input
            name="reason"
            value={medication.reason}
            onChange={handleInputChange}
            placeholder="Enter reason for medication"
            required
            className="w-full"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={medication.notes || ''}
            onChange={handleInputChange}
            placeholder="Additional notes about this medication"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : existingMedication ? 'Update Medication' : 'Add Medication'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MedicationForm;