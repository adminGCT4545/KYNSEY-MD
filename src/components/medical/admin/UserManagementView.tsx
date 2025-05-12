import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { useHasRoles } from '../../../auth/AuthUtils';
import UserForm from './UserForm';
import MFAEnrollmentModal from './MFAEnrollmentModal';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  roles: string[];
  active: boolean;
  mfaEnabled: boolean;
  lastLogin: string | null;
  createdAt: string;
}

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();
  const isAdmin = useHasRoles(['admin']);
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      user =>
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  const handleUserFormSubmit = async (userData: any) => {
    try {
      if (isEditMode && selectedUser) {
        // Update existing user
        await axios.put(`/api/admin/users/${selectedUser.id}`, userData);
        
        // Update users list
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === selectedUser.id ? { ...user, ...userData } : user
          )
        );
      } else {
        // Create new user
        const response = await axios.post('/api/admin/users', userData);
        
        // Add new user to the list
        setUsers(prevUsers => [...prevUsers, response.data]);
      }
      
      setIsFormOpen(false);
      
      // Check if MFA enrollment is required
      if (!isEditMode && userData.requireMfa) {
        setMfaUserId(userData.id);
        setShowMFAEnrollment(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };
  
  const handleToggleUserStatus = async (user: User) => {
    try {
      const newStatus = !user.active;
      
      await axios.patch(`/api/admin/users/${user.id}/status`, {
        active: newStatus
      });
      
      // Update user in the list
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, active: newStatus } : u
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };
  
  const handleSetupMFA = (user: User) => {
    setMfaUserId(user.id);
    setShowMFAEnrollment(true);
  };
  
  const handleMFASetupComplete = () => {
    setShowMFAEnrollment(false);
    setMfaUserId(null);
    
    // Refresh users list
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        console.error('Failed to refresh users', err);
      }
    };
    
    fetchUsers();
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-medium text-gray-700">Loading users...</span>
        </div>
      </div>
    );
  }
  
  // Render error message
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <div className="ml-auto pl-3">
            <button 
              onClick={() => setError(null)}
              className="inline-flex text-red-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          {isAdmin && (
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New User
            </button>
          )}
        </div>
        
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search users by name, email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className={!user.active ? 'bg-gray-100' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={!isAdmin && currentUser?.id !== user.id}
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={user.active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </button>
                          {!user.mfaEnabled && (
                            <button
                              onClick={() => handleSetupMFA(user)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Setup MFA
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* User Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit User' : 'Add New User'}
            </h2>
            <UserForm
              user={selectedUser}
              onSubmit={handleUserFormSubmit}
              onCancel={handleCloseForm}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      )}
      
      {/* MFA Enrollment Modal */}
      {showMFAEnrollment && mfaUserId && (
        <MFAEnrollmentModal
          userId={mfaUserId}
          onComplete={handleMFASetupComplete}
          onClose={() => setShowMFAEnrollment(false)}
        />
      )}
    </div>
  );
};

export default UserManagementView;