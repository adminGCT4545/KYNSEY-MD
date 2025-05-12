import React, { useState } from 'react';
import axios from 'axios';
import { Button, Alert } from '../../ui/';
import DocumentsList from './DocumentsList';
import DocumentViewer from './DocumentViewer';
import DocumentUpload from './DocumentUpload';

interface Document {
  document_id: number;
  chart_id: number;
  document_type: string;
  title: string;
  file_path: string;
  upload_date: string;
  description: string;
}

interface DocumentsModuleProps {
  patientId: number;
  chartId: number;
}

const DocumentsModule: React.FC<DocumentsModuleProps> = ({ patientId, chartId }) => {
  const [view, setView] = useState<'list' | 'detail' | 'upload'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    setView('detail');
  };

  const handleCloseDetail = () => {
    setSelectedDocument(null);
    setView('list');
  };

  const handleUploadClick = () => {
    setView('upload');
  };

  const handleCancelUpload = () => {
    setView('list');
  };

  const handleUploadSuccess = () => {
    setView('list');
    setSuccessMessage('Document uploaded successfully');
    setRefreshTrigger(prev => prev + 1);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      setError(null);
      await axios.delete(`/api/medical/documents/${documentId}`);
      
      setSuccessMessage('Document deleted successfully');
      setSelectedDocument(null);
      setView('list');
      setRefreshTrigger(prev => prev + 1);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Patient Documents</h2>
        {view === 'list' && (
          <Button variant="primary" onClick={handleUploadClick}>
            Upload New Document
          </Button>
        )}
        {view !== 'list' && (
          <Button variant="outlined" onClick={handleCloseDetail}>
            Back to Documents
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
        <DocumentsList 
          patientId={patientId} 
          chartId={chartId} 
          onSelectDocument={handleSelectDocument}
          key={`document-list-${refreshTrigger}`}
        />
      )}

      {view === 'detail' && selectedDocument && (
        <DocumentViewer 
          document={selectedDocument} 
          onClose={handleCloseDetail} 
          onDelete={handleDeleteDocument}
        />
      )}

      {view === 'upload' && (
        <DocumentUpload 
          chartId={chartId} 
          onUploadSuccess={handleUploadSuccess} 
          onCancel={handleCancelUpload} 
        />
      )}
    </div>
  );
};

export default DocumentsModule;