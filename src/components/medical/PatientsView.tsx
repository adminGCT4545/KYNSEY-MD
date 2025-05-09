import React from 'react';
import MedicalLayout from './MedicalLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faEye, faCalendarPlus,
  faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const PatientsView: React.FC = () => {
  return (
    <MedicalLayout title="Patients - KYNSEY MD">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Patient Management</h2>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
          </div>
          <div>
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Patient
            </button>
          </div>
        </div>
        
        {/* Patient List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DOB / Gender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <PatientRow 
                id="PT10045"
                name="Robert Anderson"
                initials="RA"
                dob="05/12/1975"
                gender="Male"
                phone="555-111-2222"
                email="robert.a@example.com"
                lastVisit="Apr 15, 2025"
              />
              <PatientRow 
                id="PT10046"
                name="Jennifer Taylor"
                initials="JT"
                dob="08/23/1982"
                gender="Female"
                phone="555-222-3333"
                email="jennifer.t@example.com"
                lastVisit="May 7, 2025"
                initialsColor="green"
              />
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of <span className="font-medium">125</span> patients
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <FontAwesomeIcon icon={faChevronLeft} />
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">
                1
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </a>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                13
              </a>
              <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
};

interface PatientRowProps {
  id: string;
  name: string;
  initials: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
  initialsColor?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const PatientRow: React.FC<PatientRowProps> = ({
  id, name, initials, dob, gender, phone, email, lastVisit, initialsColor = 'blue'
}) => {
  const backgroundColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${backgroundColors[initialsColor]}`}>
              {initials}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {name}
            </div>
            <div className="text-sm text-gray-500">
              #{id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{dob}</div>
        <div className="text-sm text-gray-500">{gender}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{phone}</div>
        <div className="text-sm text-gray-500">{email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lastVisit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">
          <FontAwesomeIcon icon={faEye} className="mr-1" /> View
        </button>
        <button className="text-green-600 hover:text-green-900">
          <FontAwesomeIcon icon={faCalendarPlus} className="mr-1" /> Schedule
        </button>
      </td>
    </tr>
  );
};

export default PatientsView;