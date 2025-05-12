import React, { useState } from 'react';
import { Card, Button, Badge } from '../../ui/';

interface Document {
  document_id: number;
  chart_id: number;
  document_type: string;
  title: string;
  file_path: string;
  upload_date: string;
  description: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onDelete?: (documentId: number) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  onClose, 
  onDelete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getDocumentTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      'Imaging': 'blue',
      'Lab Report': 'purple',
      'Referral': 'green',
      'Consent Form': 'orange'
    };
    
    return typeColors[type] || 'gray';
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      await onDelete(document.document_id);
      setIsDeleting(false);
    }
  };

  const getDocumentExtension = (filePath: string): string => {
    const parts = filePath.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  const fileExtension = getDocumentExtension(document.file_path);
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold">{document.title}</h2>
          <div className="flex items-center mt-1">
            <Badge
              variant={getDocumentTypeColor(document.document_type) as any}
              className="mr-2"
            >
              {document.document_type}
            </Badge>
            <span className="text-gray-600">
              Uploaded: {new Date(document.upload_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div>
          <Button
            variant="outlined"
            size="sm"
            as="a"
            href={`/api/medical/documents/download/${document.document_id}`}
            target="_blank"
            className="mr-2"
          >
            Download
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      {document.description && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p>{document.description}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">Document Preview</p>
        <div className="border rounded-md p-2 bg-gray-50 min-h-[300px] flex justify-center items-center">
          {isImage ? (
            <img
              src={`/api/medical/documents/download/${document.document_id}`}
              alt={document.title}
              className="max-h-[500px] max-w-full object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={`/api/medical/documents/download/${document.document_id}`}
              title={document.title}
              className="w-full h-[500px]"
            />
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-500 mb-2">
                Preview not available for this file type ({fileExtension})
              </p>
              <Button
                as="a"
                href={`/api/medical/documents/download/${document.document_id}`}
                target="_blank"
              >
                Download to View
              </Button>
            </div>
          )}
        </div>
      </div>

      {onDelete && (
        <div className="mt-6 border-t pt-4">
          <Button
            variant="error"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Document'}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Warning: This action cannot be undone.
          </p>
        </div>
      )}
    </Card>
  );
};

export default DocumentViewer;