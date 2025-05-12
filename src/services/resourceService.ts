/**
 * Resource Service
 * Handles API calls for resources like locations, operatories, providers, etc.
 */
import { useState, useEffect } from 'react';

// API URL - configure based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

// Feature flag for development
const USE_MOCK_DATA = true; // Set to false to use real API when available

// Mock data for development when API is unavailable
const MOCK_RESOURCES = {
  locations: [
    { id: 1, name: 'Main Clinic', address: '123 Main St', phone: '555-1000', is_active: true },
    { id: 2, name: 'Downtown Office', address: '456 Center Ave', phone: '555-2000', is_active: true },
    { id: 3, name: 'East Side Branch', address: '789 East Blvd', phone: '555-3000', is_active: true }
  ],
  operatories: {
    1: [
      { id: 1, name: 'Operatory 1', location_id: 1, is_active: true },
      { id: 2, name: 'Operatory 2', location_id: 1, is_active: true },
      { id: 3, name: 'Operatory 3', location_id: 1, is_active: true }
    ],
    2: [
      { id: 4, name: 'Room A', location_id: 2, is_active: true },
      { id: 5, name: 'Room B', location_id: 2, is_active: true }
    ],
    3: [
      { id: 6, name: 'Suite 1', location_id: 3, is_active: true },
      { id: 7, name: 'Suite 2', location_id: 3, is_active: true }
    ]
  },
  providers: [
    { id: 2001, name: 'Dr. Smith', specialty: 'General', is_active: true },
    { id: 2002, name: 'Dr. Jones', specialty: 'Pediatric', is_active: true },
    { id: 2003, name: 'Dr. Wilson', specialty: 'Orthodontics', is_active: true }
  ]
};

// Types
export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

export interface Operatory {
  id: number;
  name: string;
  location_id: number;
  is_active: boolean;
}

export interface Provider {
  id: number;
  name: string;
  specialty: string;
  is_active: boolean;
}

// Helper function for API calls with mock data fallback
async function apiCall<T>(url: string, options?: RequestInit, mockData?: T): Promise<T> {
  if (USE_MOCK_DATA && mockData !== undefined) {
    console.log(`Using mock data for ${url}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData;
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in API call to ${url}:`, error);
    
    // Fall back to mock data if available
    if (mockData !== undefined) {
      console.warn(`Falling back to mock data for ${url}`);
      return mockData;
    }
    
    throw error;
  }
}

/**
 * Get all locations
 * @returns Promise with locations array
 */
export const getLocations = async (): Promise<Location[]> => {
  try {
    return await apiCall<Location[]>(
      `${API_URL}/api/medical/locations`, 
      undefined, 
      MOCK_RESOURCES.locations
    );
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

/**
 * Get operatories by location
 * @param locationId - Location ID
 * @returns Promise with operatories array
 */
export const getOperatoriesByLocation = async (locationId?: number): Promise<Operatory[]> => {
  if (!locationId) {
    return [];
  }

  try {
    // Get mock operatories for this location if they exist
    const mockOperatories = MOCK_RESOURCES.operatories[locationId as keyof typeof MOCK_RESOURCES.operatories] || [];

    return await apiCall<Operatory[]>(
      `${API_URL}/api/medical/operatories?locationId=${locationId}`,
      undefined,
      mockOperatories
    );
  } catch (error) {
    console.error(`Error fetching operatories for location ${locationId}:`, error);
    throw error;
  }
};

/**
 * Get all providers
 * @returns Promise with providers array
 */
export const getProviders = async (): Promise<Provider[]> => {
  try {
    return await apiCall<Provider[]>(
      `${API_URL}/api/medical/providers`,
      undefined,
      MOCK_RESOURCES.providers
    );
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
};

// Hook for locations with loading and error states
export const useLocations = () => {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getLocations();
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An error occurred while fetching locations');
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
  }, []);
  
  return { data, loading, error };
};

// Hook for operatories with loading and error states
export const useOperatoriesByLocation = (locationId?: number) => {
  const [data, setData] = useState<Operatory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    if (!locationId) {
      setData([]);
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getOperatoriesByLocation(locationId);
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An error occurred while fetching operatories');
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
  }, [locationId]);
  
  return { data, loading, error };
};

// Hook for providers with loading and error states
export const useProviders = () => {
  const [data, setData] = useState<Provider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getProviders();
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An error occurred while fetching providers');
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
  }, []);
  
  return { data, loading, error };
};

// Default export for named import convenience
const resourceService = {
  getLocations,
  getOperatoriesByLocation,
  getProviders,
  useLocations,
  useOperatoriesByLocation,
  useProviders
};

export default resourceService;