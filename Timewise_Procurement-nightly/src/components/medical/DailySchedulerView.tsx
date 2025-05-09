import React from 'react';
import MedicalLayout from './MedicalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, faChevronRight, faEye, 
  faCheckCircle, faPlayCircle, faDoorOpen, faPlusCircle
} from '@fortawesome/free-solid-svg-icons';

const DailySchedulerView: React.FC = () => {
  // Current date would typically come from a state or context
  const currentDate = new Date('May 8, 2025');
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return (
    <MedicalLayout title="Daily Schedule - KYNSEY MD">
      {/* Location and Date Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div className="location-selector">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select className="border border-gray-300 rounded-md px-3 py-2 w-64">
            <option>Main Clinic</option>
            <option>Downtown Office</option>
            <option>Westside Branch</option>
          </select>
        </div>
        <div className="date-navigator flex items-center space-x-2">
          <button className="btn btn-secondary">
            <FontAwesomeIcon icon={faChevronLeft} className="mr-1" /> Previous
          </button>
          <div className="text-center">
            <div className="text-sm text-gray-500">Today</div>
            <div className="font-semibold">{formattedDate}</div>
          </div>
          <button className="btn btn-secondary">
            Next <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="text-sm text-gray-500">Total Appointments</div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-gray-500">Confirmed</div>
          <div className="text-2xl font-bold text-blue-600">8</div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-gray-500">Arrived</div>
          <div className="text-2xl font-bold text-green-600">3</div>
        </div>
        <div className="stat-card">
          <div className="text-sm text-gray-500">Available Slots</div>
          <div className="text-2xl font-bold text-gray-600">5</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="status-filter mb-6 p-4 bg-white rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-600" defaultChecked />
            <span className="ml-2">Scheduled</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-600" defaultChecked />
            <span className="ml-2">Confirmed</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-600" defaultChecked />
            <span className="ml-2">Arrived</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span className="ml-2">Completed</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-600" />
            <span className="ml-2">Cancelled</span>
          </label>
        </div>
      </div>

      {/* Appointment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Operatory 1 */}
        <OperatoryColumn 
          name="Operatory 1" 
          appointments={[
            {
              id: "1",
              patientName: "Robert Anderson",
              timeSlot: "9:00 AM - 10:00 AM (60 min)",
              status: "confirmed",
              type: "Recall",
              provider: "Dr. John Smith",
              phone: "555-111-2222",
              notes: "Regular checkup and cleaning"
            },
            {
              id: "2",
              patientName: "Michael Brown",
              timeSlot: "11:00 AM - 12:00 PM (60 min)",
              status: "arrived",
              type: "Procedure",
              provider: "Dr. John Smith",
              phone: "555-777-8888",
              notes: "Crown preparation"
            }
          ]}
        />

        {/* Operatory 2 */}
        <OperatoryColumn 
          name="Operatory 2" 
          appointments={[
            {
              id: "3",
              patientName: "Jennifer Taylor",
              timeSlot: "10:30 AM - 11:30 AM (60 min)",
              status: "confirmed",
              type: "Emergency",
              provider: "Dr. John Smith",
              phone: "555-222-3333",
              notes: "Tooth pain"
            },
            {
              id: "4",
              patientName: "Robert Anderson",
              timeSlot: "1:30 PM - 2:30 PM (60 min)",
              status: "confirmed",
              type: "Procedure",
              provider: "Dr. John Smith",
              phone: "555-111-2222",
              notes: "Filling"
            }
          ]}
        />

        {/* Operatory 3 */}
        <OperatoryColumn 
          name="Operatory 3" 
          appointments={[
            {
              id: "5",
              patientName: "Elizabeth Johnson",
              timeSlot: "1:00 PM - 2:00 PM (60 min)",
              status: "confirmed",
              type: "Recall",
              provider: "Sarah Wilson",
              phone: "555-444-5555",
              notes: "Regular cleaning"
            }
          ]}
          showAddButton={true}
        />
      </div>
    </MedicalLayout>
  );
};

interface AppointmentProps {
  id: string;
  patientName: string;
  timeSlot: string;
  status: "confirmed" | "arrived" | "completed" | "cancelled";
  type: string;
  provider: string;
  phone: string;
  notes?: string;
}

interface OperatoryColumnProps {
  name: string;
  appointments: AppointmentProps[];
  showAddButton?: boolean;
}

const OperatoryColumn: React.FC<OperatoryColumnProps> = ({ name, appointments, showAddButton }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        <FontAwesomeIcon icon={faDoorOpen} className="mr-2 text-blue-600" />
        {name}
      </h3>
      
      {appointments.map(appointment => (
        <AppointmentCard key={appointment.id} {...appointment} />
      ))}
      
      {showAddButton && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
          <div className="text-gray-400">
            <FontAwesomeIcon icon={faPlusCircle} className="text-2xl" />
            <p className="mt-1">Add Appointment</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AppointmentCard: React.FC<AppointmentProps> = ({ 
  patientName, timeSlot, status, type, provider, phone, notes
}) => {
  const renderStatusBadge = () => {
    switch(status) {
      case 'confirmed':
        return <span className="status-badge status-confirmed">Confirmed</span>;
      case 'arrived':
        return <span className="status-badge status-arrived">Arrived</span>;
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    switch(status) {
      case 'confirmed':
        return (
          <>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              <FontAwesomeIcon icon={faEye} className="mr-1" /> View
            </button>
            <button className="text-sm text-green-600 hover:text-green-800">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Check In
            </button>
          </>
        );
      case 'arrived':
        return (
          <>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              <FontAwesomeIcon icon={faEye} className="mr-1" /> View
            </button>
            <button className="text-sm text-purple-600 hover:text-purple-800">
              <FontAwesomeIcon icon={faPlayCircle} className="mr-1" /> Start
            </button>
          </>
        );
      default:
        return (
          <button className="text-sm text-blue-600 hover:text-blue-800">
            <FontAwesomeIcon icon={faEye} className="mr-1" /> View
          </button>
        );
    }
  };

  return (
    <div className="appointment-card">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold">{patientName}</div>
          <div className="text-sm text-gray-500">{timeSlot}</div>
        </div>
        {renderStatusBadge()}
      </div>
      <div className="text-sm mb-2">
        <div><span className="font-medium">Type:</span> {type}</div>
        <div><span className="font-medium">Provider:</span> {provider}</div>
        <div><span className="font-medium">Phone:</span> {phone}</div>
      </div>
      {notes && <div className="text-sm text-gray-600">{notes}</div>}
      <div className="mt-3 flex justify-end space-x-2">
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default DailySchedulerView;
