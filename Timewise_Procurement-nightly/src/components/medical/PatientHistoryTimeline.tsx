import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { medicalService } from '../../services/medicalService';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'appointment' | 'note' | 'lab' | 'medication' | 'procedure' | 'billing';
  title: string;
  description: string;
  provider?: string;
  status?: string;
  result?: string;
}

interface PatientHistoryTimelineProps {
  patientId: string;
}

export const PatientHistoryTimeline: React.FC<PatientHistoryTimelineProps> = ({ patientId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    types: string[];
  }>({
    startDate: '',
    endDate: '',
    types: ['appointment', 'note', 'lab', 'medication', 'procedure', 'billing'],
  });

  useEffect(() => {
    const fetchPatientHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would fetch data from the API
        // const response = await medicalService.getPatientHistory(patientId, filters);
        // setEvents(response.data);

        // Using mock data for now
        setTimeout(() => {
          const mockEvents: TimelineEvent[] = [
            {
              id: '1',
              date: '2025-04-15T10:30:00',
              type: 'appointment',
              title: 'Annual Physical Examination',
              description: 'Completed annual physical exam with blood work',
              provider: 'Dr. Robert Johnson',
              status: 'completed'
            },
            {
              id: '2',
              date: '2025-04-15T11:00:00',
              type: 'note',
              title: 'Progress Note',
              description: 'Patient reports feeling well. All vitals normal. Maintaining healthy diet and regular exercise.',
              provider: 'Dr. Robert Johnson'
            },
            {
              id: '3',
              date: '2025-04-18T09:15:00',
              type: 'lab',
              title: 'Blood Work Results',
              description: 'Complete blood count, metabolic panel, lipid profile',
              result: 'All values within normal range. Cholesterol slightly elevated but within acceptable limits.'
            },
            {
              id: '4',
              date: '2025-04-20T14:00:00',
              type: 'medication',
              title: 'Prescription Refill',
              description: 'Refilled Lisinopril 10mg, 30-day supply',
              provider: 'Dr. Robert Johnson'
            },
            {
              id: '5',
              date: '2025-05-01T15:30:00',
              type: 'procedure',
              title: 'Dental Cleaning',
              description: 'Regular 6-month dental cleaning and check-up',
              provider: 'Dr. Susan Miller',
              status: 'completed'
            },
            {
              id: '6',
              date: '2025-05-02T09:00:00',
              type: 'billing',
              title: 'Insurance Claim Submitted',
              description: 'Claim #INS-12345 submitted for dental cleaning',
              status: 'pending'
            },
            {
              id: '7',
              date: '2025-05-05T13:45:00',
              type: 'appointment',
              title: 'Follow-up Appointment',
              description: 'Follow-up for blood pressure check',
              provider: 'Dr. Robert Johnson',
              status: 'scheduled'
            }
          ];

          setEvents(mockEvents);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load patient history. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPatientHistory();
  }, [patientId, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      const eventType = name as 'appointment' | 'note' | 'lab' | 'medication' | 'procedure' | 'billing';
      
      setFilters(prev => {
        if (checked) {
          return { 
            ...prev, 
            types: [...prev.types, eventType] 
          };
        } else {
          return { 
            ...prev, 
            types: prev.types.filter(type => type !== eventType) 
          };
        }
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'note':
        return '📝';
      case 'lab':
        return '🧪';
      case 'medication':
        return '💊';
      case 'procedure':
        return '🩺';
      case 'billing':
        return '💵';
      default:
        return '📋';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 border-blue-500';
      case 'note':
        return 'bg-gray-100 border-gray-500';
      case 'lab':
        return 'bg-purple-100 border-purple-500';
      case 'medication':
        return 'bg-green-100 border-green-500';
      case 'procedure':
        return 'bg-yellow-100 border-yellow-500';
      case 'billing':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-white border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group events by date (show only the date part, not time)
  const groupEventsByDate = () => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.date);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(event);
    });
    
    // Sort each group by time
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
    
    return groups;
  };

  const eventGroups = groupEventsByDate();
  const sortedDates = Object.keys(eventGroups).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Medical History Timeline</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Types</label>
          <div className="grid grid-cols-2 gap-2">
            {['appointment', 'note', 'lab', 'medication', 'procedure', 'billing'].map(type => (
              <label key={type} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name={type}
                  checked={filters.types.includes(type)}
                  onChange={handleFilterChange}
                  className="mr-2"
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
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
      ) : events.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          No medical history found for the selected filters.
        </div>
      ) : (
        <div className="relative">
          {/* Timeline center line */}
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {sortedDates.map(dateKey => (
            <div key={dateKey} className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold z-10">
                  {new Date(dateKey).getDate()}
                </div>
                <div className="ml-4 text-lg font-semibold">
                  {new Date(dateKey).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="ml-12">
                {eventGroups[dateKey].map(event => (
                  <div 
                    key={event.id} 
                    className={`mb-4 p-4 border-l-4 rounded-md shadow-sm ${getEventTypeColor(event.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-xl mr-2" aria-hidden="true">
                          {getEventTypeIcon(event.type)}
                        </span>
                        <h3 className="text-lg font-medium">
                          {event.title}
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-600">
                      {event.description}
                    </p>
                    
                    {event.provider && (
                      <p className="mt-1 text-sm text-gray-500">
                        Provider: {event.provider}
                      </p>
                    )}
                    
                    {event.status && (
                      <p className="mt-1 text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={
                          event.status === 'completed' ? 'text-green-600' :
                          event.status === 'scheduled' ? 'text-blue-600' :
                          event.status === 'cancelled' ? 'text-red-600' :
                          'text-yellow-600'
                        }>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </p>
                    )}
                    
                    {event.result && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium">Results:</p>
                        <p>{event.result}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistoryTimeline;