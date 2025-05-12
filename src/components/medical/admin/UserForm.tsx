import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  roles: string[];
  active: boolean;
  mfaEnabled: boolean;
}

interface UserFormProps {
  user: User | null;
  onSubmit: (userData: any) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isEditMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    roles: [] as string[],
    requireMfa: false,
    active: true,
  });
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Fetch available roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await axios.get('/api/admin/roles');
        setRoles(response.data);
        setLoadingRoles(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch roles');
        setLoadingRoles(false);
      }
    };
    
    fetchRoles();
  }, []);
  
  // Initialize form data if in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        name: user.name || '',
        roles: user.roles || [],
        requireMfa: user.mfaEnabled || false,
        active: user.active !== undefined ? user.active : true,
      });
    }
  }, [isEditMode, user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => {
      const isRoleSelected = prev.roles.includes(roleId);
      
      if (isRoleSelected) {
        // Remove role
        return {
          ...prev,
          roles: prev.roles.filter((r) => r !== roleId),
        };
      } else {
        // Add role
        return {
          ...prev,
          roles: [...prev.roles, roleId],
        };
      }
    });
  };
  
  const validateForm = () => {
    // Validate required fields
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!isEditMode && !formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (formData.roles.length === 0) {
      setError('At least one role must be assigned');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare submission data (exclude confirmPassword)
      const dataToSubmit = {
        ...formData,
        confirmPassword: undefined,
      };
      
      // If editing and password is empty, don't send it
      if (isEditMode && !formData.password) {
        delete dataToSubmit.password;
      }
      
      onSubmit(dataToSubmit);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            disabled={isEditMode} // Cannot edit username
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password{!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditMode}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
          {isEditMode && (
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to keep current password
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password{!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isEditMode}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles<span className="text-red-500">*</span>
          </label>
          {loadingRoles ? (
            <p className="text-sm text-gray-500">Loading roles...</p>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`role-${role.id}`}
                      name={`role-${role.id}`}
                      type="checkbox"
                      checked={formData.roles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`role-${role.id}`} className="font-medium text-gray-700">
                      {role.name}
                    </label>
                    <p className="text-gray-500">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="requireMfa"
                name="requireMfa"
                type="checkbox"
                checked={formData.requireMfa}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="requireMfa" className="font-medium text-gray-700">
                Require Multi-Factor Authentication
              </label>
              <p className="text-gray-500">
                Users will be required to set up MFA during their first login
              </p>
            </div>
          </div>
        </div>
        
        {isEditMode && (
          <div className="md:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="active" className="font-medium text-gray-700">
                  Active
                </label>
                <p className="text-gray-500">
                  Inactive users cannot login to the system
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;