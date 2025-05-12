import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faUsers,
  faChartLine,
  faBars,
  faSignOutAlt,
  faCog,
  faBell,
  faAngleLeft,
  faUserCircle,
  faMedkit,
  faClipboardList,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

interface MedicalLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MedicalLayout: React.FC<MedicalLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if viewport is mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Update document title on component mount or title changes
  useEffect(() => {
    document.title = title;
    return () => {
      // Restore original title on unmount
      document.title = "KYNSEY MD";
    };
  }, [title]);
  
  // Close sidebar when route changes on mobile devices
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  }, [location]);
  
  // Main navigation items
  const mainNavItems = [
    { path: '/medical/daily', label: 'Daily Schedule', icon: faCalendarDay },
    { path: '/medical/patients', label: 'Patients', icon: faUsers },
    { path: '/medical/reports', label: 'Reports', icon: faChartLine },
    { path: '/medical/medications', label: 'Medications', icon: faMedkit },
    { path: '/medical/charts', label: 'Patient Charts', icon: faClipboardList },
    { path: '/medical/documents', label: 'Documents', icon: faFileAlt }
  ];
  
  // Handle keyboard navigation for sidebar toggle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSidebar();
    }
  };
  
  return (
    <div className="medical-layout flex h-screen bg-gray-100">
      {/* Sidebar - hidden on mobile unless toggled */}
      <aside
        className={`sidebar fixed md:static z-30 h-full bg-blue-800 text-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${isMobileMenuOpen ? 'left-0' : '-left-full md:left-0'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          {!sidebarCollapsed && (
            <div className="text-xl font-bold text-white">KYNSEY MD</div>
          )}
          <button 
            onClick={toggleSidebar} 
            onKeyDown={handleKeyDown}
            className="text-white p-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            <FontAwesomeIcon icon={sidebarCollapsed ? faBars : faAngleLeft} />
          </button>
        </div>
        
        <nav className="mt-6 space-y-1 px-2" role="navigation" aria-label="Main navigation">
          {mainNavItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) =>
                `nav-item flex items-center p-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-900 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`
              }
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <FontAwesomeIcon icon={item.icon} className={`${sidebarCollapsed ? 'text-xl mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 px-2 pb-4 border-t border-blue-700 space-y-1">
          {!sidebarCollapsed && (
            <div className="text-xs text-blue-300 mb-2 px-2">SETTINGS</div>
          )}
          
          <NavLink 
            to="/medical/settings" 
            className={({ isActive }) =>
              `nav-item flex items-center p-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-900 text-white' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FontAwesomeIcon icon={faCog} className={`${sidebarCollapsed ? 'text-xl mx-auto' : 'mr-3'}`} />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
          
          <button 
            className="nav-item flex items-center w-full p-2 rounded-md transition-colors text-blue-100 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Sign out"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className={`${sidebarCollapsed ? 'text-xl mx-auto' : 'mr-3'}`} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow w-full md:w-auto md:flex-1 min-h-0">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-20">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button 
                className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
              
              <h1 className="text-xl font-semibold text-gray-800 truncate">
                {title.split(' - ')[0]}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notifications"
              >
                <FontAwesomeIcon icon={faBell} />
                <span 
                  className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" 
                  aria-label="You have new notifications"
                ></span>
              </button>
              
              <div className="flex items-center space-x-2 group relative">
                <button 
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1" 
                  aria-label="User menu" 
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    <FontAwesomeIcon icon={faUserCircle} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">John Smith</span>
                </button>
                
                {/* User dropdown menu - shown on hover or focus */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block focus-within:block">
                  <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </a>
                  <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <a href="#logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Breadcrumbs - optional */}
          <div className="px-4 py-2 text-sm">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/medical" className="text-blue-600 hover:text-blue-800">
                    Medical
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-600">{title.split(' - ')[0]}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </header>
        
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden" 
            onClick={toggleMobileMenu}
            aria-hidden="true"
          ></div>
        )}
        
        {/* Main Content */}
        <main className="flex-grow p-4 overflow-auto">
          {children}
        </main>
        
        {/* Footer - optional */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} KYNSEY MD. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default MedicalLayout;
