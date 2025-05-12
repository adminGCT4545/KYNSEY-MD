/**
 * Appointment Service
 * Handles all API calls related to appointments with proper error handling and caching
 */
import { useState, useEffect } from 'react';

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 60 seconds
const cache: Record<string, { data: any; timestamp: number }> = {};

// API URL - configure based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Feature flags for development
const USE_MOCK_DATA = true; // Set to false to use real API when available
const ENABLE_WEBSOCKETS = false; // Set to true when WebSocket server is running

// Mock data for development when API is unavailable
const MOCK_APPOINTMENTS: Record<string, any> = {
  'daily-schedule': {
    date: new Date().toISOString().split('T')[0],
    locationId: 1,
    operatories: [
      {
        id: 1,
        name: 'Operatory 1',
        location_id: 1,
        is_active: true,
        appointments: [
          {
            id: 101,
            patient_id: 1001,
            patient_name: 'John Doe',
            provider_id: 2001,
            provider_name: 'Dr. Smith',
            location_id: 1,
            operatory_id: 1,
            appointment_date: new Date().toISOString().split('T')[0],
            start_time: '09:00:00',
            end_time: '10:00:00',
            appointment_type: 'Checkup',
            status: 'confirmed',
            reason_for_visit: 'Annual checkup',
          },
          {
            id: 102,
            patient_id: 1002,
            patient_name: 'Jane Smith',
            provider_id: 2001,
            provider_name: 'Dr. Smith',
            location_id: 1,
            operatory_id: 1,
            appointment_date: new Date().toISOString().split('T')[0],
            start_time: '10:30:00',
            end_time: '11:30:00',
            appointment_type: 'Follow-up',
            status: 'pending',
            reason_for_visit: 'Follow-up on treatment',
          }
        ]
      },
      {
        id: 2,
        name: 'Operatory 2',
        location_id: 1,
        is_active: true,
        appointments: [
          {
            id: 103,
            patient_id: 1003,
            patient_name: 'Robert Johnson',
            provider_id: 2002,
            provider_name: 'Dr. Jones',
            location_id: 1,
            operatory_id: 2,
            appointment_date: new Date().toISOString().split('T')[0],
            start_time: '09:30:00',
            end_time: '10:15:00',
            appointment_type: 'Emergency',
            status: 'arrived',
            reason_for_visit: 'Severe pain',
          }
        ]
      },
      {
        id: 3,
        name: 'Operatory 3',
        location_id: 1,
        is_active: true,
        appointments: []
      }
    ]
  },
  'wait-list': [
    {
      id: 201,
      patient_id: 1004,
      patient_name: 'Emily Davis',
      reason: 'Toothache',
      requested_date: new Date().toISOString().split('T')[0],
      contact_number: '555-1234',
      status: 'waiting',
      notes: 'Prefers afternoon',
      requested_provider_id: 2001,
      requested_provider_name: 'Dr. Smith'
    },
    {
      id: 202,
      patient_id: 1005,
      patient_name: 'Michael Wilson',
      reason: 'Cleaning',
      requested_date: new Date().toISOString().split('T')[0],
      contact_number: '555-5678',
      status: 'waiting',
      notes: 'Available anytime',
      requested_provider_id: null,
      requested_provider_name: null
    }
  ]
};

// Types
export interface Appointment {
  id: number | string;
  patient_id: number;
  patient_name?: string;
  provider_id: number;
  provider_name?: string;
  location_id: number;
  operatory_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  status: string;
  reason_for_visit?: string;
  notes?: string;
  insurance_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DailyScheduleOperatory {
  id: number;
  name: string;
  location_id: number;
  is_active: boolean;
  appointments: Appointment[];
}

export interface DailySchedule {
  date: string;
  locationId: number;
  operatories: DailyScheduleOperatory[];
}

// Helper function for API calls with error handling and mock data fallback
async function apiCall<T>(url: string, options?: RequestInit, mockData?: T): Promise<T> {
  if (USE_MOCK_DATA && mockData) {
    console.log(`Using mock data for ${url}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData as T;
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle different response types (json, text, blob)
    if (url.includes('format=csv') || url.includes('export') && !url.includes('format=pdf')) {
      return await response.text() as unknown as T;
    }
    
    if (url.includes('format=pdf')) {
      return await response.blob() as unknown as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${url}:`, error);
    
    // Fall back to mock data if available
    if (mockData) {
      console.warn(`Falling back to mock data for ${url}`);
      return mockData as T;
    }
    
    throw error;
  }
}

/**
 * Get all appointments with optional filtering
 * @param filters - Optional filters (e.g., { date, locationId, providerId, status })
 * @returns Promise with appointments array
 */
export const getAppointments = async (filters: Record<string, any> = {}): Promise<Appointment[]> => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const cacheKey = `appointments-${queryString}`;

    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    // Get filtered appointments from mock data
    const mockAppointments = MOCK_APPOINTMENTS['daily-schedule'].operatories
      .flatMap(op => op.appointments)
      .filter(apt => {
        if (filters.date && apt.appointment_date !== filters.date) return false;
        if (filters.providerId && apt.provider_id !== Number(filters.providerId)) return false;
        if (filters.status && apt.status !== filters.status) return false;
        return true;
      });

    // Fetch data
    const data = await apiCall<Appointment[]>(
      `${API_URL}/api/medical/appointments?${queryString}`, 
      undefined, 
      mockAppointments
    );
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Get daily schedule
 * @param date - Date in YYYY-MM-DD format
 * @param locationId - Location ID
 * @returns Promise with daily schedule object
 */
export const getDailySchedule = async (date: string, locationId: number): Promise<DailySchedule> => {
  try {
    const cacheKey = `daily-schedule-${date}-${locationId}`;

    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    // Create a copy of mock data and update date and locationId
    const mockData = JSON.parse(JSON.stringify(MOCK_APPOINTMENTS['daily-schedule']));
    mockData.date = date;
    mockData.locationId = locationId;
    mockData.operatories.forEach((op: any) => {
      op.appointments.forEach((apt: any) => {
        apt.appointment_date = date;
      });
    });

    const data = await apiCall<DailySchedule>(
      `${API_URL}/api/medical/appointments/daily-schedule?date=${date}&locationId=${locationId}`,
      undefined,
      mockData
    );
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return data;
  } catch (error) {
    console.error('Error fetching daily schedule:', error);
    throw error;
  }
};

/**
 * Get appointment by ID
 * @param id - Appointment ID
 * @returns Promise with appointment object
 */
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  try {
    const cacheKey = `appointment-${id}`;

    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    const response = await fetch(`${API_URL}/api/medical/appointments/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return data;
  } catch (error) {
    console.error(`Error fetching appointment with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new appointment
 * @param appointmentData - Appointment data
 * @returns Promise with created appointment
 */
export const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear relevant cache entries to ensure data is fresh
    clearCacheWithPattern('appointments-');
    clearCacheWithPattern('daily-schedule-');

    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Update an existing appointment
 * @param id - Appointment ID
 * @param appointmentData - Updated appointment data
 * @returns Promise with updated appointment
 */
export const updateAppointment = async (id: number, appointmentData: Partial<Appointment>): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear relevant cache entries
    clearCacheWithPattern('appointments-');
    clearCacheWithPattern('daily-schedule-');
    clearCacheWithPattern(`appointment-${id}`);

    return data;
  } catch (error) {
    console.error(`Error updating appointment with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update appointment status
 * @param id - Appointment ID
 * @param status - New status
 * @returns Promise with updated appointment
 */
export const updateAppointmentStatus = async (id: number, status: string): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear relevant cache entries
    clearCacheWithPattern('appointments-');
    clearCacheWithPattern('daily-schedule-');
    clearCacheWithPattern(`appointment-${id}`);

    return data;
  } catch (error) {
    console.error(`Error updating status for appointment with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an appointment
 * @param id - Appointment ID
 * @returns Promise with success message
 */
export const deleteAppointment = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear relevant cache entries
    clearCacheWithPattern('appointments-');
    clearCacheWithPattern('daily-schedule-');
    clearCacheWithPattern(`appointment-${id}`);

    return data;
  } catch (error) {
    console.error(`Error deleting appointment with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Check for appointment conflicts
 * @param appointmentData - Appointment data to check
 * @returns Promise with array of conflicting appointments, empty if none
 */
export const checkAppointmentConflicts = async (appointmentData: Partial<Appointment>): Promise<Appointment[]> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/check-conflicts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking appointment conflicts:', error);
    throw error;
  }
};

/**
 * Bulk update appointment statuses
 * @param appointmentIds - Array of appointment IDs
 * @param status - New status
 * @returns Promise with success message
 */
export const bulkUpdateAppointmentStatus = async (appointmentIds: number[], status: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/bulk-status-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ appointmentIds, status })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear all appointment-related cache
    clearCacheWithPattern('appointments-');
    clearCacheWithPattern('daily-schedule-');
    appointmentIds.forEach(id => clearCacheWithPattern(`appointment-${id}`));

    return data;
  } catch (error) {
    console.error('Error performing bulk status update:', error);
    throw error;
  }
};

/**
 * Export schedule to CSV format
 * @param date - Date in YYYY-MM-DD format
 * @param locationId - Location ID
 * @returns Promise with CSV data as string
 */
export const exportScheduleToCSV = async (date: string, locationId: number): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/export?date=${date}&locationId=${locationId}&format=csv`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error exporting schedule to CSV:', error);
    throw error;
  }
};

/**
 * Export schedule to PDF format
 * @param date - Date in YYYY-MM-DD format
 * @param locationId - Location ID
 * @returns Promise with PDF data as blob
 */
export const exportScheduleToPDF = async (date: string, locationId: number): Promise<Blob> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/export?date=${date}&locationId=${locationId}&format=pdf`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.blob();
    return data;
  } catch (error) {
    console.error('Error exporting schedule to PDF:', error);
    throw error;
  }
};

/**
 * Get provider schedule for a specific date
 * @param providerId - Provider ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with provider schedule
 */
export const getProviderSchedule = async (providerId: number, date: string): Promise<Appointment[]> => {
  try {
    const cacheKey = `provider-schedule-${providerId}-${date}`;

    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    const response = await fetch(`${API_URL}/api/medical/appointments?providerId=${providerId}&date=${date}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return data;
  } catch (error) {
    console.error(`Error fetching schedule for provider ${providerId}:`, error);
    throw error;
  }
};

/**
 * Get appointment statistics
 * @param date - Date in YYYY-MM-DD format
 * @param locationId - Optional location ID
 * @returns Promise with appointment statistics
 */
export const getAppointmentStatistics = async (date: string, locationId?: number): Promise<Record<string, number>> => {
  try {
    let url = `${API_URL}/api/medical/appointments/statistics?date=${date}`;
    if (locationId) {
      url += `&locationId=${locationId}`;
    }
    
    const cacheKey = `appointment-statistics-${date}-${locationId || 'all'}`;

    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return data;
  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    throw error;
  }
};

/**
 * Create a recurring appointment series
 * @param recurringAppointmentData - Data for recurring appointments
 * @returns Promise with created appointments
 */
export const createRecurringAppointments = async (recurringAppointmentData: {
  baseAppointment: Partial<Appointment>;
  pattern: 'daily' | 'weekly' | 'monthly';
  endDate: string;
  daysOfWeek?: number[];
}): Promise<Appointment[]> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/recurring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recurringAppointmentData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear relevant cache entries
    clearCacheWithPattern('appointments-');
    clearCacheWithPattern('daily-schedule-');

    return data;
  } catch (error) {
    console.error('Error creating recurring appointments:', error);
    throw error;
  }
};

/**
 * Get wait list entries
 * @returns Promise with wait list entries
 */
export const getWaitList = async (): Promise<any[]> => {
  try {
    const cacheKey = 'wait-list';

    // Check cache
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      return cache[cacheKey].data;
    }

    const data = await apiCall<any[]>(
      `${API_URL}/api/medical/appointments/wait-list`,
      undefined,
      MOCK_APPOINTMENTS['wait-list']
    );
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: now
    };

    return data;
  } catch (error) {
    console.error('Error fetching wait list:', error);
    throw error;
  }
};

/**
 * Add patient to wait list
 * @param waitListData - Wait list entry data
 * @returns Promise with created wait list entry
 */
export const addToWaitList = async (waitListData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/wait-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(waitListData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear wait list cache
    delete cache['wait-list'];

    return data;
  } catch (error) {
    console.error('Error adding to wait list:', error);
    throw error;
  }
};

/**
 * Remove patient from wait list
 * @param waitListId - Wait list entry ID
 * @returns Promise with success message
 */
export const removeFromWaitList = async (waitListId: number): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/medical/appointments/wait-list/${waitListId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Clear wait list cache
    delete cache['wait-list'];

    return data;
  } catch (error) {
    console.error(`Error removing wait list entry ${waitListId}:`, error);
    throw error;
  }
};

/**
 * Set up WebSocket for real-time updates
 * @param onMessage - Callback for handling incoming messages
 * @returns WebSocket instance and cleanup function
 */
export const setupRealTimeUpdates = (
  onMessage: (data: any) => void
): { socket: WebSocket | null; cleanup: () => void } => {
  if (!ENABLE_WEBSOCKETS) {
    console.warn('WebSockets disabled. Real-time updates will not be available.');
    
    // Set up a mock socket for development
    const mockSocket = {
      close: () => {}
    };
    
    // Simulate a periodic update for development
    const interval = setInterval(() => {
      onMessage({
        type: 'mock-update',
        message: 'This is a simulated update for development',
        timestamp: new Date().toISOString()
      });
    }, 30000); // Every 30 seconds
    
    return { 
      socket: null,
      cleanup: () => clearInterval(interval)
    };
  }
  
  try {
    // Use secure WebSocket in production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    const socket = new WebSocket(`${protocol}//${host}/ws`);
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Clear relevant cache based on message type
        if (data.type === 'appointment-updated' || data.type === 'appointment-created' || data.type === 'appointment-deleted') {
          clearCacheWithPattern('appointments-');
          clearCacheWithPattern('daily-schedule-');
          if (data.appointmentId) {
            clearCacheWithPattern(`appointment-${data.appointmentId}`);
          }
        }
        
        onMessage(data);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    const cleanup = () => {
      socket.close();
    };
    
    return { socket, cleanup };
  } catch (error) {
    console.error('Error setting up WebSocket connection:', error);
    
    // Return a no-op cleanup function
    return { 
      socket: null, 
      cleanup: () => {} 
    };
  }
};

// Hook for data fetching with loading and error states
export const useAppointments = (filters: Record<string, any> = {}) => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState<number>(0);
  
  // Generate cache key from filters
  const generateCacheKey = () => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  };
  
  const refresh = () => setRefreshFlag(prev => prev + 1);
  
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getAppointments(filters);
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An error occurred while fetching appointments');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [generateCacheKey(), refreshFlag]);
  
  return { data, loading, error, refresh };
};

// Hook for daily schedule with loading and error states
export const useDailySchedule = (date: string, locationId?: number) => {
  const [data, setData] = useState<DailySchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState<number>(0);
  
  const refresh = () => setRefreshFlag(prev => prev + 1);
  
  useEffect(() => {
    let mounted = true;
    
    if (!locationId) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getDailySchedule(date, locationId);
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An error occurred while fetching daily schedule');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, [date, locationId, refreshFlag]);
  
  return { data, loading, error, refresh };
};

// Private helper function to clear cache entries matching a pattern
const clearCacheWithPattern = (pattern: string): void => {
  Object.keys(cache).forEach(key => {
    if (key.includes(pattern)) {
      delete cache[key];
    }
  });
};

// Default export for named import convenience
const appointmentService = {
  getAppointments,
  getDailySchedule,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  checkAppointmentConflicts,
  bulkUpdateAppointmentStatus,
  exportScheduleToCSV,
  exportScheduleToPDF,
  getProviderSchedule,
  getAppointmentStatistics,
  createRecurringAppointments,
  getWaitList,
  addToWaitList,
  removeFromWaitList,
  setupRealTimeUpdates,
  useAppointments,
  useDailySchedule
};

export default appointmentService;