import React, { useState } from 'react';
import MedicalLayout from './MedicalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faCalendarDay,
  faSearch,
  faClock,
  faUser,
  faFileAlt,
  faCheck,
  faTimes,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

const DailyScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };
  
  // Format date as "Thursday, May 8, 2025"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Time slots for the daily schedule
  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM'
  ];
  
  // Sample appointments data
  const appointments = [
    {
      id: 'APT1001',
      patientName: 'Robert Anderson',
      patientId: 'PT10045',
      time: '9:00 AM',
      duration: 30, // minutes
      type: 'Follow-up',
      status: 'checked-in',
      notes: 'Blood pressure check'
    },
    {
      id: 'APT1002',
      patientName: 'Jennifer Taylor',
      patientId: 'PT10046',
      time: '10:30 AM',
      duration: 60, // minutes
      type: 'Annual Physical',
      status: 'scheduled',
      notes: 'Comprehensive exam'
    },
    {
      id: 'APT1003',
      patientName: 'Michael Reynolds',
      patientId: 'PT10047',
      time: '1:00 PM',
      duration: 30, // minutes
      type: 'Consultation',
      status: 'completed',
      notes: 'Discuss test results'
    },
    {
      id: 'APT1004',
      patientName: 'Sarah Williams',
      patientId: 'PT10048',
      time: '2:30 PM',
      duration: 45, // minutes
      type: 'New Patient',
      status: 'scheduled',
      notes: 'Initial consultation'
    }
  ];
  
  // Get appointment for a specific time slot
  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return appointments.find(apt => apt.time === timeSlot);
  };
  
  return (
    <MedicalLayout title="Daily Schedule - KYNSEY MD">
      <div className="mb-6">
        {/* Date Navigation and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => navigateDate(-1)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            
            <h2 className="text-xl font-bold mx-4">
              {formatDate(currentDate)}
            </h2>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => navigateDate(1)}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            
            <button className="ml-4 flex items-center text-blue-600 hover:text-blue-800">
              <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
              <span>Today</span>
            </button>
          </div>
          
          <div className="flex">
            <div className="relative mr-4">
              <input 
                type="text" 
                placeholder="Search appointments..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
            
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Providers</option>
              <option value="dr-smith">Dr. Smith</option>
              <option value="dr-jones">Dr. Jones</option>
              <option value="dr-lee">Dr. Lee</option>
            </select>
          </div>
        </div>
        
        {/* Schedule Timeline */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {timeSlots.map((time, index) => {
            const appointment = getAppointmentForTimeSlot(time);
            
            return (
              <div 
                key={index} 
                className={`flex border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
              >
                {/* Time Column */}
                <div className="w-24 py-3 px-4 border-r border-gray-200 text-gray-500 text-sm font-medium">
                  {time}
                </div>
                
                {/* Appointment Column */}
                <div className="flex-grow py-2 px-4">
                  {appointment ? (
                    <AppointmentCard appointment={appointment} />
                  ) : (
                    <div className="h-12 flex items-center text-gray-400 text-sm">
                      Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MedicalLayout>
  );
};

interface AppointmentProps {
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
    time: string;
    duration: number;
    type: string;
    status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'no-show';
    notes: string;
  };
}

const AppointmentCard: React.FC<AppointmentProps> = ({ appointment }) => {
  const statusColors = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'checked-in': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    'completed': 'bg-green-100 text-green-800',
    'no-show': 'bg-red-100 text-red-800'
  };
  
  const statusText = {
    'scheduled': 'Scheduled',
    'checked-in': 'Checked In',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'no-show': 'No Show'
  };
  
  return (
    <div className="border border-gray-200 rounded-md p-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
          <div className="text-sm text-gray-500">{appointment.patientId} • {appointment.type}</div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
          {statusText[appointment.status]}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        <FontAwesomeIcon icon={faClock} className="mr-1" />
        {appointment.time} ({appointment.duration} min)
      </div>
      
      {appointment.notes && (
        <div className="text-sm text-gray-600 mb-3">
          <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
          {appointment.notes}
        </div>
      )}
      
      <div className="flex justify-between mt-2">
        <button className="text-blue-600 hover:text-blue-900 text-sm">
          <FontAwesomeIcon icon={faUser} className="mr-1" />
          Patient Info
        </button>
        
        <div className="flex space-x-2">
          {appointment.status === 'scheduled' && (
            <button className="text-green-600 hover:text-green-800 text-sm">
              <FontAwesomeIcon icon={faCheck} className="mr-1" />
              Check In
            </button>
          )}
          
          {appointment.status === 'scheduled' && (
            <button className="text-red-600 hover:text-red-800 text-sm">
              <FontAwesomeIcon icon={faTimes} className="mr-1" />
              Cancel
            </button>
          )}
          
          <button className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyScheduleView;