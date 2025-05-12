import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useDebounce from '../../hooks/useDebounce';
import { ValidationError } from '../../types/medical';

interface PatientSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => Promise<void>;
  isLoading?: boolean;
  minLength?: number;
  placeholder?: string;
  className?: string;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  isLoading = false,
  minLength = 2,
  placeholder = "Search patients by name, email, or ID...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [error, setError] = useState<ValidationError | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce the search query
  const debouncedSearchQuery = useDebounce(inputValue, 500);

  // Validate input
  const validateInput = (value: string): ValidationError | null => {
    if (value && value.length < minLength) {
      return {
        field: 'search',
        message: `Search term must be at least ${minLength} characters`
      };
    }
    
    // Add more validation rules here if needed
    if (value && /[<>]/.test(value)) {
      return {
        field: 'search',
        message: 'Search term contains invalid characters'
      };
    }
    
    return null;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const validationError = validateInput(value);
    setError(validationError);
  };

  // Effect for handling debounced search
  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearchQuery || error) {
        return;
      }

      try {
        setIsSearching(true);
        await onSearchChange(debouncedSearchQuery);
      } catch (err) {
        console.error('Search failed:', err);
        setError({
          field: 'search',
          message: 'Search failed. Please try again.'
        });
      } finally {
        setIsSearching(false);
      }
    };

    handleSearch();
  }, [debouncedSearchQuery, error, onSearchChange]);

  return (
    <div
      className={`w-full ${className}`}
      role="search"
      aria-label="Patient search"
    >
      <div className="relative">
        <label htmlFor="patient-search" className="sr-only">
          Search patients
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {(isLoading || isSearching) ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-gray-400 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400"
              aria-hidden="true"
            />
          )}
        </div>
        <input
          id="patient-search"
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2
            ${error ?
              'border-red-300 focus:ring-red-500' :
              'border-gray-300 focus:ring-blue-500'
            }
          `}
          disabled={isLoading}
          aria-label="Search patients"
          aria-describedby={error ? "search-error" : undefined}
          aria-invalid={error ? "true" : "false"}
          aria-busy={isLoading || isSearching}
        />
        <span className="sr-only" aria-live="polite">
          {(isLoading || isSearching) ? 'Searching...' : ''}
        </span>
      </div>
      {error && (
        <p id="search-error" className="mt-1 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default PatientSearchBar;
