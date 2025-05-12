import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Button, Badge, Input } from '../../ui/';

interface Provider {
  provider_id: number;
  provider_name: string;
  credentials: string;
}

interface ClinicalNote {
  note_id: number;
  chart_id: number;
  provider_id: number;
  provider?: Provider;
  note_type: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at: string;
  updated_at: string;
  signature?: string;
  signed_at?: string;
}

interface ClinicalNotesListProps {
  patientId?: number;
  chartId?: number;
  onSelectNote?: (note: ClinicalNote) => void;
}

const ClinicalNotesList: React.FC<ClinicalNotesListProps> = ({ 
  patientId, 
  chartId, 
  onSelectNote 
}) => {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSigned, setFilterSigned] = useState<string>('all');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (patientId) {
          response = await axios.get(`/api/medical/clinical-notes/patient/${patientId}`);
        } else if (chartId) {
          response = await axios.get(`/api/medical/clinical-notes/chart/${chartId}`);
        } else {
          throw new Error('Either patientId or chartId must be provided');
        }
        
        setNotes(response.data);
        setFilteredNotes(response.data);
      } catch (err) {
        setError('Failed to fetch clinical notes. Please try again later.');
        console.error('Error fetching clinical notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [patientId, chartId]);

  useEffect(() => {
    let filtered = notes;
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(note => note.note_type === filterType);
    }
    
    // Apply signed status filter
    if (filterSigned === 'signed') {
      filtered = filtered.filter(note => note.signed_at);
    } else if (filterSigned === 'unsigned') {
      filtered = filtered.filter(note => !note.signed_at);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.subjective.toLowerCase().includes(term) || 
        note.objective.toLowerCase().includes(term) ||
        note.assessment.toLowerCase().includes(term) ||
        note.plan.toLowerCase().includes(term) ||
        (note.provider?.provider_name?.toLowerCase().includes(term))
      );
    }
    
    setFilteredNotes(filtered);
  }, [searchTerm, filterType, filterSigned, notes]);

  const handleSelectNote = (note: ClinicalNote) => {
    if (onSelectNote) {
      onSelectNote(note);
    }
  };

  const getNoteTypes = (): string[] => {
    const types = notes.map(note => note.note_type);
    return ['all', ...new Set(types)];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (notes.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        No clinical notes found.
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            className="form-select rounded-md border-gray-300"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {getNoteTypes().map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Note Types' : type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-shrink-0">
          <select
            className="form-select rounded-md border-gray-300"
            value={filterSigned}
            onChange={(e) => setFilterSigned(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="signed">Signed Only</option>
            <option value="unsigned">Unsigned Only</option>
          </select>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Provider</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotes.map((note) => (
            <tr key={note.note_id}>
              <td className="font-medium">{formatDate(note.created_at)}</td>
              <td>{note.note_type} Note</td>
              <td>
                {note.provider?.provider_name || `Provider ID: ${note.provider_id}`}
              </td>
              <td>
                {note.signed_at ? (
                  <Badge variant="success">Signed</Badge>
                ) : (
                  <Badge variant="warning">Unsigned</Badge>
                )}
              </td>
              <td>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleSelectNote(note)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ClinicalNotesList;