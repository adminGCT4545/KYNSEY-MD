import React, { useState, useEffect } from 'react';
import medicalService from '../../services/medicalService';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;
}

interface Location {
  id: string;
  name: string;
}

/**
 * Location Selector Component
 * 
 * Component for selecting a location to filter data
 */
const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocation, onLocationChange }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await medicalService.getLocations();
        setLocations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations');
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []);

  return (
    <div className="w-48">
      <label htmlFor="location-selector" className="block text-sm font-medium text-gray-700 mb-1">
        Location
      </label>
      <select
        id="location-selector"
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        disabled={loading || !!error}
      >
        <option value="all">All Locations</option>
        
        {loading ? (
          <option value="" disabled>Loading...</option>
        ) : error ? (
          <option value="" disabled>Error loading locations</option>
        ) : (
          locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default LocationSelector;
