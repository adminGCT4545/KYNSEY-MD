import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import medicalService from '../../services/medicalService';
import LoadingSpinner from '../LoadingSpinner';

/**
 * BillingClaimsView Component
 * 
 * Main view for billing and claims management
 */
const BillingClaimsView: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  // Mock data for claims until API is available
  const mockClaims = [
    {
      claim_id: 1,
      patient_id: 101,
      patient_first_name: 'John',
      patient_last_name: 'Doe',
      insurance_name: 'Blue Cross',
      policy_number: 'BC123456789',
      date_of_service: '2025-04-15',
      date_submitted: '2025-04-16',
      total_amount: 350.00,
      status: 'Pending',
      notes: 'Routine checkup with lab work'
    },
    {
      claim_id: 2,
      patient_id: 102,
      patient_first_name: 'Jane',
      patient_last_name: 'Smith',
      insurance_name: 'Aetna',
      policy_number: 'AE987654321',
      date_of_service: '2025-04-10',
      date_submitted: '2025-04-11',
      total_amount: 750.00,
      status: 'Paid',
      notes: 'Specialist consultation'
    },
    {
      claim_id: 3,
      patient_id: 103,
      patient_first_name: 'Robert',
      patient_last_name: 'Johnson',
      insurance_name: 'Medicare',
      policy_number: 'MC456789123',
      date_of_service: '2025-04-05',
      date_submitted: '2025-04-06',
      total_amount: 1200.00,
      status: 'Denied',
      notes: 'Procedure not covered by insurance'
    },
    {
      claim_id: 4,
      patient_id: 104,
      patient_first_name: 'Emily',
      patient_last_name: 'Wilson',
      insurance_name: 'Cigna',
      policy_number: 'CI789123456',
      date_of_service: '2025-04-20',
      date_submitted: '2025-04-21',
      total_amount: 500.00,
      status: 'Pending',
      notes: 'Follow-up appointment'
    },
    {
      claim_id: 5,
      patient_id: 105,
      patient_first_name: 'Michael',
      patient_last_name: 'Brown',
      insurance_name: 'United Healthcare',
      policy_number: 'UH654321987',
      date_of_service: '2025-04-18',
      date_submitted: '2025-04-19',
      total_amount: 850.00,
      status: 'Paid',
      notes: 'Emergency visit'
    }
  ];

  // Fetch claims on component mount
  useEffect(() => {
    const fetchClaims = async () => {
      console.log('BillingClaimsView: Fetching claims with date range:', dateRange);
      try {
        setLoading(true);
        // TODO: Replace with actual API call when available
        // const data = await medicalService.getClaims({
        //   startDate: dateRange.startDate,
        //   endDate: dateRange.endDate
        // });
        
        // Using mock data for now
        setTimeout(() => {
          setClaims(mockClaims);
          setFilteredClaims(mockClaims);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims. Please try again later.');
        setLoading(false);
      }
    };

    fetchClaims();
  }, [dateRange]);

  // Apply filters when status filter changes
  useEffect(() => {
    console.log('BillingClaimsView: Applying status filter:', statusFilter);
    if (statusFilter === 'all') {
      setFilteredClaims(claims);
      console.log('BillingClaimsView: Showing all claims');
      return;
    }

    const filtered = claims.filter(claim => claim.status === statusFilter);
    console.log(`BillingClaimsView: Filtered to ${filtered.length} claims with status ${statusFilter}`);
    setFilteredClaims(filtered);
  }, [statusFilter, claims]);

  // Handle claim selection
  const handleClaimSelect = (claim: any) => {
    console.log('BillingClaimsView: Selected claim:', claim.claim_id);
    setSelectedClaim(claim);
  };

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Handle new claim creation
  const handleCreateClaim = () => {
    console.log('BillingClaimsView: Navigating to create new claim');
    navigate('/medical/billing/claims/new');
  };

  // Handle claim details navigation
  const handleViewClaimDetails = (claimId: number) => {
    console.log('BillingClaimsView: Viewing details for claim:', claimId);
    navigate(`/medical/billing/claims/${claimId}`);
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const total = filteredClaims.reduce((sum, claim) => sum + claim.total_amount, 0);
    const pending = filteredClaims
      .filter(claim => claim.status === 'Pending')
      .reduce((sum, claim) => sum + claim.total_amount, 0);
    const paid = filteredClaims
      .filter(claim => claim.status === 'Paid')
      .reduce((sum, claim) => sum + claim.total_amount, 0);
    const denied = filteredClaims
      .filter(claim => claim.status === 'Denied')
      .reduce((sum, claim) => sum + claim.total_amount, 0);
    
    return {
      totalClaims: filteredClaims.length,
      totalAmount: total.toFixed(2),
      pendingAmount: pending.toFixed(2),
      paidAmount: paid.toFixed(2),
      deniedAmount: denied.toFixed(2)
    };
  };

  const summary = calculateSummary();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Billing & Claims</h1>
        
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex space-x-4 mb-2 sm:mb-0">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="statusFilter"
                name="statusFilter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Denied">Denied</option>
              </select>
            </div>
          </div>
          
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateClaim}
          >
            New Claim
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total Claims</p>
            <p className="text-xl font-bold">{summary.totalClaims}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold">${summary.totalAmount}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-xl font-bold">${summary.pendingAmount}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm text-green-600">Paid</p>
            <p className="text-xl font-bold">${summary.paidAmount}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg shadow-sm">
            <p className="text-sm text-red-600">Denied</p>
            <p className="text-xl font-bold">${summary.deniedAmount}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Service</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    No claims found
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr 
                    key={claim.claim_id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedClaim?.claim_id === claim.claim_id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleClaimSelect(claim)}
                  >
                    <td className="py-2 px-4 border-b">{claim.claim_id}</td>
                    <td className="py-2 px-4 border-b font-medium">
                      {claim.patient_first_name} {claim.patient_last_name}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {claim.insurance_name}<br />
                      <span className="text-xs text-gray-500">{claim.policy_number}</span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(claim.date_of_service).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(claim.date_submitted).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b font-medium">
                      ${claim.total_amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        claim.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : claim.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClaimDetails(claim.claim_id);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingClaimsView;
