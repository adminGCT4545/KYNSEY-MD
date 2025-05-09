import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

interface TimelineEvent {
  id: string;
  event_type: string;
  event_date: string;
  title: string;
  description: string;
  record_id?: string;
  record_type?: string;
  status?: string;
  created_at: string;
  created_by?: string;
  icon?: string;
}

interface PatientTimelineViewProps {
  patientId: string;
}

/**
 * Patient Timeline View Component
 * 
 * Shows a chronological timeline of all patient events including appointments,
 * notes, lab results, and other medical records.
 */
const PatientTimelineView: React.FC<PatientTimelineViewProps> = ({ patientId }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const response = await medicalService.getPatientTimeline(patientId, { 
          type: filter !== 'all' ? filter : undefined 
        });
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient timeline:', err);
        setError('Failed to load patient timeline. Please try again later.');
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [patientId, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };

  const getEventIcon = (eventType: string): JSX.Element => {
    switch (eventType.toLowerCase()) {
      case 'appointment':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'note':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'lab':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      case 'vital':
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case 'prescription':
        return (
          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string | undefined): JSX.Element | null => {
    if (!status) return null;
    
    let colorClass = '';
    
    switch (status.toLowerCase()) {
      case 'completed':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'scheduled':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'canceled':
        colorClass = 'bg-red-100 text-red-800';
        break;
      case 'no-show':
        colorClass = 'bg-gray-100 text-gray-800';
        break;
      case 'pending':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'in-progress':
        colorClass = 'bg-indigo-100 text-indigo-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const handleEventClick = (event: TimelineEvent) => {
    if (!event.record_id) return;
    
    switch (event.record_type?.toLowerCase()) {
      case 'appointment':
        navigate(`/medical/appointments/${event.record_id}`);
        break;
      case 'chart_note':
        navigate(`/medical/charts/${event.record_id}`);
        break;
      case 'lab_result':
        navigate(`/medical/labs/${event.record_id}`);
        break;
      case 'document':
        navigate(`/medical/documents/${event.record_id}`);
        break;
      case 'prescription':
        navigate(`/medical/prescriptions/${event.record_id}`);
        break;
      case 'payment':
        navigate(`/medical/billing/payments/${event.record_id}`);
        break;
      default:
        console.log('No navigation defined for this event type');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center flex-wrap">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Patient Timeline
          </h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('appointment')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'appointment'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => handleFilterChange('note')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'note'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => handleFilterChange('lab')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'lab'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Labs
            </button>
            <button
              onClick={() => handleFilterChange('document')}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filter === 'document'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Documents
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {events.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'This patient has no recorded events yet.'
                : `No ${filter} events found for this patient.`}
            </p>
          </div>
        ) : (
          <ol className="relative border-l border-gray-200 ml-3">
            {events.map((event, index) => (
              <li key={event.id} className="mb-10 ml-6">
                <div className="absolute -left-4">
                  {getEventIcon(event.event_type)}
                </div>
                <div 
                  className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200
                    ${event.record_id ? 'cursor-pointer' : ''}`}
                  onClick={() => event.record_id && handleEventClick(event)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="ml-2">
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                    <time className="mb-1 text-sm font-normal text-gray-500">
                      {formatDate(event.event_date)} at {formatTime(event.event_date)}
                    </time>
                  </div>
                  <p className="text-base font-normal text-gray-700 whitespace-pre-line">
                    {event.description}
                  </p>
                  {event.created_by && (
                    <p className="mt-3 text-xs text-gray-500">
                      Created by: {event.created_by}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default PatientTimelineView;