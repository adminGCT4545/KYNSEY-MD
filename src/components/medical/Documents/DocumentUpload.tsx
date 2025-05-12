import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Card, Button, Input, Alert } from '../../ui/';

interface DocumentUploadProps {
  chartId: number;
  onUploadSuccess: () => void;
  onCancel: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  chartId, 
  onUploadSuccess, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    'Imaging',
    'Lab Report',
    'Referral',
    'Consultation',
    'Discharge Summary',
    'Consent Form',
    'Insurance',
    'Other'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      
      // If no title entered yet, use the file name as a default title
      if (!title) {
        const fileName = e.target.files[0].name;
        // Remove file extension for the title
        setTitle(fileName.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    if (!title) {
      setError('Please enter a title for the document.');
      return;
    }
    
    if (!documentType) {
      setError('Please select a document type.');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('chart_id', chartId.toString());
      formData.append('document_type', documentType);
      formData.append('title', title);
      formData.append('description', description);
      
      await axios.post('/api/medical/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onUploadSuccess();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Upload Document</h2>
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Title*
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            required
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type*
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select document type</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select File*
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.tif,.tiff"
          />
          <div className="flex items-center">
            <Button
              type="button"
              variant="outlined"
              onClick={triggerFileSelect}
              className="mr-3"
            >
              Browse Files
            </Button>
            <span className="text-gray-500">
              {selectedFile ? selectedFile.name : 'No file selected'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: PDF, JPEG, PNG, TIFF, DOC, DOCX, TXT (Max 10MB)
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DocumentUpload;