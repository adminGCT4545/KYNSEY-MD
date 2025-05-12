import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Alert } from '../../ui/';
import ClinicalNotesList from './ClinicalNotesList';
import ClinicalNoteViewer from './ClinicalNoteViewer';
import ClinicalNoteEditor from './ClinicalNoteEditor';

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

interface ClinicalNotesModuleProps {
  patientId: number;
  chartId: number;
  currentProviderId: number;
}

const ClinicalNotesModule: React.FC<ClinicalNotesModuleProps> = ({ 
  patientId, 
  chartId, 
  currentProviderId 
}) => {
  const [view, setView] = useState<'list' | 'detail' | 'edit' | 'new'>('list');
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleSelectNote = (note: ClinicalNote) => {
    setSelectedNote(note);
    setView('detail');
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setView('new');
  };

  const handleEditNote = () => {
    setView('edit');
  };

  const handleCloseDetail = () => {
    setSelectedNote(null);
    setView('list');
  };

  const handleCancelEdit = () => {
    if (selectedNote) {
      setView('detail');
    } else {
      setView('list');
    }
  };

  const handleSaveNote = (note: ClinicalNote) => {
    setSelectedNote(note);
    setView('detail');
    setSuccessMessage('Clinical note saved successfully');
    setRefreshTrigger(prev => prev + 1);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleSignNote = () => {
    setSelectedNote(prev => {
      if (!prev) return prev;
      
      const providerName = 'Dr. ' + currentProviderId; // This would actually come from the user context
      
      return {
        ...prev,
        signed_at: new Date().toISOString(),
        signature: providerName
      };
    });
    
    setSuccessMessage('Clinical note signed successfully');
    setRefreshTrigger(prev => prev + 1);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handlePrintNote = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Clinical Notes</h2>
        {view === 'list' && (
          <Button 
            variant="primary" 
            onClick={handleCreateNote}
          >
            New Clinical Note
          </Button>
        )}
        {view !== 'list' && (
          <Button 
            variant="outlined" 
            onClick={handleCloseDetail}
          >
            Back to Notes
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {view === 'list' && (
        <ClinicalNotesList 
          patientId={patientId} 
          chartId={chartId} 
          onSelectNote={handleSelectNote}
          key={`notes-list-${refreshTrigger}`}
        />
      )}

      {view === 'detail' && selectedNote && (
        <ClinicalNoteViewer 
          note={selectedNote} 
          onClose={handleCloseDetail}
          onEdit={handleEditNote}
          onSign={handleSignNote}
          onPrint={handlePrintNote}
          currentProviderId={currentProviderId}
        />
      )}

      {view === 'edit' && selectedNote && (
        <ClinicalNoteEditor 
          chartId={chartId}
          providerId={currentProviderId}
          existingNote={selectedNote}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      )}

      {view === 'new' && (
        <ClinicalNoteEditor 
          chartId={chartId}
          providerId={currentProviderId}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default ClinicalNotesModule;