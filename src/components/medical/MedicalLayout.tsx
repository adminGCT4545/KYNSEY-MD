import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faUsers,
  faChartLine,
  faBars,
  faSignOutAlt,
  faCog,
  faBell,
  faAngleLeft
} from '@fortawesome/free-solid-svg-icons';

interface MedicalLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MedicalLayout: React.FC<MedicalLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  React.useEffect(() => {
    // Update document title when component mounts or title changes
    document.title = title;
    return () => {
      // Restore original title on unmount (optional)
      document.title = "KYNSEY MD";
    };
  }, [title]);
  
  return (
    <div className="medical-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          {!sidebarCollapsed && (
            <div className="text-xl font-bold text-white">KYNSEY MD</div>
          )}
          <button 
            onClick={toggleSidebar} 
            className="text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            {sidebarCollapsed ? (
              <FontAwesomeIcon icon={faBars} />
            ) : (
              <FontAwesomeIcon icon={faAngleLeft} />
            )}
          </button>
        </div>
        
        <nav className="mt-6 space-y-1">
          <NavLink 
            to="/medical/daily" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faCalendarDay} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Daily Schedule</span>}
          </NavLink>
          
          <NavLink 
            to="/medical/patients" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUsers} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Patients</span>}
          </NavLink>
          
          <NavLink 
            to="/medical/reports" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faChartLine} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Reports</span>}
          </NavLink>
        </nav>
        
        <div className="mt-auto pt-6">
          {!sidebarCollapsed && (
            <div className="text-xs text-gray-300 mb-2">SETTINGS</div>
          )}
          
          <NavLink 
            to="/medical/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faCog} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
          
          <button className="nav-item mt-4">
            <FontAwesomeIcon icon={faSignOutAlt} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navigation */}
        <div className="topnav">
          <h1 className="text-xl font-semibold text-gray-800">
            {title.split(' - ')[0]}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <FontAwesomeIcon icon={faBell} className="text-gray-600" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                JS
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">John Smith</span>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MedicalLayout;
