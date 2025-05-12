import React, { useState } from 'react';
import axios from 'axios';
import { Card, Button, Badge } from '../../ui/';

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

interface ClinicalNoteViewerProps {
  note: ClinicalNote;
  onEdit?: () => void;
  onSign?: () => void;
  onClose: () => void;
  onPrint?: () => void;
  currentProviderId?: number;
}

const ClinicalNoteViewer: React.FC<ClinicalNoteViewerProps> = ({
  note,
  onEdit,
  onSign,
  onClose,
  onPrint,
  currentProviderId
}) => {
  const [isSigning, setIsSigning] = useState(false);

  const isNoteSigned = !!note.signed_at;
  const isCurrentProviderAuthor = currentProviderId === note.provider_id;
  const canSign = !isNoteSigned && isCurrentProviderAuthor;
  const canEdit = !isNoteSigned && isCurrentProviderAuthor && onEdit;

  const handleSignNote = async () => {
    if (!currentProviderId || isNoteSigned) return;
    
    try {
      setIsSigning(true);
      await axios.post(`/api/medical/clinical-notes/${note.note_id}/sign`, {
        provider_id: currentProviderId
      });
      
      if (onSign) {
        onSign();
      }
    } catch (error) {
      console.error('Error signing note:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold">
            {note.note_type} Note
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            {note.provider?.provider_name || `Provider ID: ${note.provider_id}`}
            {note.provider?.credentials && `, ${note.provider.credentials}`}
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-sm text-gray-500 mr-4">
            Created: {formatDate(note.created_at)}
            <br />
            {note.updated_at !== note.created_at && 
              `Updated: ${formatDate(note.updated_at)}`}
          </div>
          {isNoteSigned ? (
            <Badge variant="success">Signed</Badge>
          ) : (
            <Badge variant="warning">Unsigned</Badge>
          )}
        </div>
      </div>

      <div className="mb-6 border-b pb-4">
        <h3 className="font-bold mb-2">Subjective</h3>
        <div className="whitespace-pre-line">{note.subjective || "No data"}</div>
      </div>

      <div className="mb-6 border-b pb-4">
        <h3 className="font-bold mb-2">Objective</h3>
        <div className="whitespace-pre-line">{note.objective || "No data"}</div>
      </div>

      <div className="mb-6 border-b pb-4">
        <h3 className="font-bold mb-2">Assessment</h3>
        <div className="whitespace-pre-line">{note.assessment || "No data"}</div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">Plan</h3>
        <div className="whitespace-pre-line">{note.plan || "No data"}</div>
      </div>

      {isNoteSigned && (
        <div className="mb-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Electronically signed by:</p>
              <p>{note.signature}</p>
              <p className="text-sm text-gray-500">
                Signed on: {formatDate(note.signed_at || '')}
              </p>
            </div>
            <div>
              <img 
                src="/assets/images/signature-verified.svg" 
                alt="Verified Signature" 
                className="h-10"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        {canEdit && (
          <Button
            variant="outlined"
            onClick={onEdit}
          >
            Edit Note
          </Button>
        )}
        
        {canSign && (
          <Button
            variant="success"
            onClick={handleSignNote}
            disabled={isSigning}
          >
            {isSigning ? 'Signing...' : 'Sign Note'}
          </Button>
        )}
        
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

export default ClinicalNoteViewer;