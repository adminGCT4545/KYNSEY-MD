import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Button, Badge, Input } from '../../ui/';

interface Document {
  document_id: number;
  chart_id: number;
  document_type: string;
  title: string;
  file_path: string;
  upload_date: string;
  description: string;
}

interface DocumentsListProps {
  patientId?: number;
  chartId?: number;
  onSelectDocument?: (document: Document) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ 
  patientId, 
  chartId, 
  onSelectDocument 
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (patientId) {
          response = await axios.get(`/api/medical/documents/patient/${patientId}`);
        } else if (chartId) {
          response = await axios.get(`/api/medical/documents/chart/${chartId}`);
        } else {
          throw new Error('Either patientId or chartId must be provided');
        }
        
        setDocuments(response.data);
        setFilteredDocuments(response.data);
      } catch (err) {
        setError('Failed to fetch documents. Please try again later.');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [patientId, chartId]);

  useEffect(() => {
    let filtered = documents;
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === filterType);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(term) || 
        doc.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, filterType, documents]);

  const handleSelectDocument = (document: Document) => {
    if (onSelectDocument) {
      onSelectDocument(document);
    }
  };

  const getDocumentTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      'Imaging': 'blue',
      'Lab Report': 'purple',
      'Referral': 'green',
      'Consent Form': 'orange'
    };
    
    return typeColors[type] || 'gray';
  };

  const getDocumentTypes = (): string[] => {
    const types = documents.map(doc => doc.document_type);
    return ['all', ...new Set(types)];
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

  if (documents.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        No documents found.
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Patient Documents</h3>
        <div className="flex space-x-4">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            className="form-select rounded-md border-gray-300"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {getDocumentTypes().map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Upload Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((document) => (
            <tr key={document.document_id}>
              <td className="font-medium">{document.title}</td>
              <td>
                <Badge
                  variant={getDocumentTypeColor(document.document_type) as any}
                >
                  {document.document_type}
                </Badge>
              </td>
              <td>{new Date(document.upload_date).toLocaleDateString()}</td>
              <td>
                {document.description.length > 50
                  ? `${document.description.substring(0, 50)}...`
                  : document.description}
              </td>
              <td className="space-x-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleSelectDocument(document)}
                >
                  View
                </Button>
                <Button
                  variant="text"
                  size="sm"
                  as="a"
                  href={`/api/medical/documents/download/${document.document_id}`}
                  target="_blank"
                >
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DocumentsList;