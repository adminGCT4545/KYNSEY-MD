import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { medicalService } from '../../services/medicalService';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  size: number;
  uploadedBy: string;
  url: string;
  thumbnailUrl?: string;
}

interface PatientDocumentsManagementProps {
  patientId: string;
}

export const PatientDocumentsManagement: React.FC<PatientDocumentsManagementProps> = ({ patientId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document categories for filter
  const documentCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'lab', label: 'Lab Results' },
    { value: 'imaging', label: 'Imaging & Radiology' },
    { value: 'referral', label: 'Referrals' },
    { value: 'consent', label: 'Consent Forms' },
    { value: 'insurance', label: 'Insurance Documents' },
    { value: 'other', label: 'Other' }
  ];
  
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would fetch data from the API
        // const response = await medicalService.getPatientDocuments(patientId);
        // setDocuments(response.data);
        
        // Using mock data for now
        setTimeout(() => {
          const mockDocuments: Document[] = [
            {
              id: '1',
              name: 'Blood_Test_Results_Apr2025.pdf',
              type: 'application/pdf',
              category: 'lab',
              uploadDate: '2025-04-18T14:30:00',
              size: 2500000, // 2.5MB
              uploadedBy: 'Dr. Robert Johnson',
              url: '/mock-files/blood-test.pdf',
              thumbnailUrl: '/mock-files/blood-test-thumb.jpg'
            },
            {
              id: '2',
              name: 'Chest_X-Ray.jpg',
              type: 'image/jpeg',
              category: 'imaging',
              uploadDate: '2025-03-22T09:15:00',
              size: 4800000, // 4.8MB
              uploadedBy: 'Dr. Maria Rodriguez',
              url: '/mock-files/chest-xray.jpg',
              thumbnailUrl: '/mock-files/chest-xray-thumb.jpg'
            },
            {
              id: '3',
              name: 'Patient_Consent_Form.pdf',
              type: 'application/pdf',
              category: 'consent',
              uploadDate: '2025-01-15T10:45:00',
              size: 850000, // 850KB
              uploadedBy: 'Sarah Johnson (Patient)',
              url: '/mock-files/consent-form.pdf'
            },
            {
              id: '4',
              name: 'Insurance_Card_Scan.png',
              type: 'image/png',
              category: 'insurance',
              uploadDate: '2025-01-10T16:20:00',
              size: 1200000, // 1.2MB
              uploadedBy: 'Front Desk Staff',
              url: '/mock-files/insurance-card.png',
              thumbnailUrl: '/mock-files/insurance-card-thumb.jpg'
            },
            {
              id: '5',
              name: 'Cardiology_Referral.pdf',
              type: 'application/pdf',
              category: 'referral',
              uploadDate: '2025-02-28T14:10:00',
              size: 1050000, // 1.05MB
              uploadedBy: 'Dr. Robert Johnson',
              url: '/mock-files/referral.pdf'
            }
          ];
          
          setDocuments(mockDocuments);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load patient documents. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [patientId]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // In a real implementation, this would upload the file to the server
    // Simulating upload progress
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add the uploaded file to the documents list
          const newDocument: Document = {
            id: `temp-${Date.now()}`,
            name: file.name,
            type: file.type,
            category: 'other', // Default category
            uploadDate: new Date().toISOString(),
            size: file.size,
            uploadedBy: 'Current User',
            url: URL.createObjectURL(file)
          };
          
          setDocuments(prev => [newDocument, ...prev]);
          setUploadProgress(null);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          return null;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    
    // If it's an image or PDF, show preview
    if (doc.type.startsWith('image/') || doc.type === 'application/pdf') {
      setShowPreview(true);
    }
  };
  
  const handleDeleteDocument = (id: string) => {
    // In a real implementation, this would delete the file from the server
    // For now, just remove it from the local state
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
      setShowPreview(false);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filters.category === 'all' || doc.category === filters.category;
    const matchesSearch = doc.name.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-xl font-bold mb-4 md:mb-0">Patient Documents</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            {uploadProgress !== null ? (
              <div className="flex flex-col">
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div 
                    className="h-full bg-blue-500 rounded" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Uploading... {uploadProgress}%
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="search"
            placeholder="Search documents..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        
        <div>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded"
          >
            {documentCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          No documents found for the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {showPreview && selectedDocument && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Document Preview</h3>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="border rounded p-4">
                {selectedDocument.type.startsWith('image/') ? (
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.name}
                    className="max-w-full max-h-96 mx-auto"
                  />
                ) : selectedDocument.type === 'application/pdf' ? (
                  <div className="bg-gray-100 p-4 text-center">
                    <p className="mb-2">PDF preview not available in the mock interface.</p>
                    <a 
                      href={selectedDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Open PDF in new tab
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 text-center">
                    <p>No preview available for this file type.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Uploaded
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id}
                    className={`${selectedDocument?.id === doc.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                          {doc.type.startsWith('image/') ? (
                            <span className="text-xl">🖼️</span>
                          ) : doc.type === 'application/pdf' ? (
                            <span className="text-xl">📄</span>
                          ) : doc.type.includes('word') ? (
                            <span className="text-xl">📝</span>
                          ) : (
                            <span className="text-xl">📁</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Uploaded by: {doc.uploadedBy}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {documentCategories.find(c => c.value === doc.category)?.label || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(doc.uploadDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSelectDocument(doc)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDocumentsManagement;