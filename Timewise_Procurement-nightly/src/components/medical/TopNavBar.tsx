import React from 'react';

const TopNavBar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">KYNSEY MD</h1>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex space-x-6">
          <NavTab label="Daily" active={true} />
          <NavTab label="Performance" active={false} />
          <NavTab label="Planner" active={false} />
          <NavTab label="Huddle" active={false} />
          <NavTab label="Worklist" active={false} />
          <NavTab label="Production Goals" active={false} />
          <NavTab label="Dashboard" active={false} />
        </nav>

        {/* User Profile and Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800">
            <span className="sr-only">Notifications</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="flex items-center">
            <img 
              className="h-8 w-8 rounded-full object-cover"
              src="https://randomuser.me/api/portraits/women/75.jpg" 
              alt="User profile" 
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Dr. Sarah Johnson</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Helper component for navigation tabs
interface NavTabProps {
  label: string;
  active: boolean;
}

const NavTab: React.FC<NavTabProps> = ({ label, active }) => {
  return (
    <button 
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
};

export default TopNavBar;
