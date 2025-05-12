import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientSearchBar from '../PatientSearchBar';

describe('PatientSearchBar', () => {
  const mockOnSearchChange = jest.fn();
  const defaultProps = {
    searchQuery: '',
    onSearchChange: mockOnSearchChange,
    isLoading: false,
    minLength: 2,
    placeholder: 'Search patients...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PatientSearchBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search patients...')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<PatientSearchBar {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('animate-spin');
  });

  it('validates minimum length requirement', async () => {
    render(<PatientSearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search patients...');
    
    await userEvent.type(input, 'a');
    expect(screen.getByRole('alert')).toHaveTextContent('Search term must be at least 2 characters');
    
    await userEvent.type(input, 'bc');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('validates invalid characters', async () => {
    render(<PatientSearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search patients...');
    
    await userEvent.type(input, 'test<script>');
    expect(screen.getByRole('alert')).toHaveTextContent('Search term contains invalid characters');
  });

  it('debounces search callback', async () => {
    jest.useFakeTimers();
    render(<PatientSearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search patients...');
    
    await userEvent.type(input, 'test query');
    
    // Should not call immediately
    expect(mockOnSearchChange).not.toHaveBeenCalled();
    
    // Fast forward debounce timer
    jest.advanceTimersByTime(500);
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('test query');
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });

  it('disables input while loading', () => {
    render(<PatientSearchBar {...defaultProps} isLoading={true} />);
    const input = screen.getByPlaceholderText('Search patients...');
    expect(input).toBeDisabled();
  });

  it('handles error state correctly', async () => {
    const mockError = new Error('API Error');
    const mockFailingSearch = jest.fn().mockRejectedValue(mockError);
    
    render(
      <PatientSearchBar 
        {...defaultProps} 
        onSearchChange={mockFailingSearch}
      />
    );
    
    const input = screen.getByPlaceholderText('Search patients...');
    await userEvent.type(input, 'test query');
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Search failed. Please try again.');
    });
  });
});