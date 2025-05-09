import React, { useState, useEffect } from 'react';
import medicalService from '../../../services/medicalService';
import LoadingSpinner from '../../LoadingSpinner';

interface PatientBillingViewProps {
  patientId: string;
}

interface InsuranceInfo {
  id: string;
  patient_id: string;
  provider_name: string;
  policy_number: string;
  group_number: string;
  coverage_type: string;
  primary_holder_name?: string;
  primary_holder_relationship?: string;
  effective_date: string;
  expiry_date?: string;
  coverage_details?: string;
  status: string;
}

interface Claim {
  id: string;
  patient_id: string;
  date_of_service: string;
  provider_id: string;
  provider_name: string;
  claim_number: string;
  insurance_id: string;
  insurance_name: string;
  total_amount: number;
  status: string;
  submitted_date?: string;
  accepted_date?: string;
  rejected_date?: string;
  rejection_reason?: string;
  paid_amount?: number;
  paid_date?: string;
  service_items: ClaimServiceItem[];
}

interface ClaimServiceItem {
  id: string;
  claim_id: string;
  service_code: string;
  description: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  insurance_covers: boolean;
  coverage_amount?: number;
  patient_responsibility?: number;
}

interface Payment {
  id: string;
  patient_id: string;
  date: string;
  amount: number;
  payment_type: string;
  reference_number?: string;
  claim_id?: string;
  notes?: string;
}

/**
 * Patient Billing View Component
 * 
 * Displays patient insurance information, claims, and payment history
 */
const PatientBillingView: React.FC<PatientBillingViewProps> = ({ patientId }) => {
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch billing data on component mount
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        
        const [insuranceResponse, claimsResponse, paymentsResponse] = await Promise.all([
          medicalService.getPatientInsurance(patientId),
          medicalService.getClaims({ patientId }),
          medicalService.getPatientPayments(patientId)
        ]);
        
        setInsuranceInfo(insuranceResponse.data);
        setClaims(claimsResponse.data);
        setPayments(paymentsResponse.data);
        
        if (claimsResponse.data.length > 0) {
          setSelectedClaim(claimsResponse.data[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchBillingData();
  }, [patientId]);
  
  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'expired':
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Calculate claim totals
  const calculateClaimTotals = (claim: Claim): {
    totalAmount: number;
    insurancePaid: number;
    patientResponsibility: number;
    remainingBalance: number;
  } => {
    let totalAmount = 0;
    let insurancePaid = 0;
    let patientResponsibility = 0;
    
    claim.service_items.forEach(item => {
      totalAmount += item.total_price;
      insurancePaid += item.coverage_amount || 0;
      patientResponsibility += item.patient_responsibility || 0;
    });
    
    // Calculate payments made for this claim
    const paymentsMade = payments
      .filter(payment => payment.claim_id === claim.id)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const remainingBalance = patientResponsibility - paymentsMade;
    
    return {
      totalAmount,
      insurancePaid,
      patientResponsibility,
      remainingBalance: remainingBalance < 0 ? 0 : remainingBalance
    };
  };
  
  // Sort claims by date (newest first)
  const sortedClaims = [...claims].sort((a, b) => {
    return new Date(b.date_of_service).getTime() - new Date(a.date_of_service).getTime();
  });

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Insurance Information */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Insurance Information</h2>
        
        {insuranceInfo ? (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Provider</span>
                <span className="font-medium">{insuranceInfo.provider_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Policy Number</span>
                <span className="font-medium">{insuranceInfo.policy_number}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Group Number</span>
                <span className="font-medium">{insuranceInfo.group_number || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Coverage Type</span>
                <span className="font-medium">{insuranceInfo.coverage_type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Effective Date</span>
                <span className="font-medium">{formatDate(insuranceInfo.effective_date)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Expiry Date</span>
                <span className="font-medium">{formatDate(insuranceInfo.expiry_date)}</span>
              </div>
              {insuranceInfo.primary_holder_name && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Primary Holder</span>
                  <span className="font-medium">{insuranceInfo.primary_holder_name}</span>
                </div>
              )}
              {insuranceInfo.primary_holder_relationship && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Relationship to Primary</span>
                  <span className="font-medium">{insuranceInfo.primary_holder_relationship}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(insuranceInfo.status)}`}>
                  {insuranceInfo.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            {insuranceInfo.coverage_details && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">Coverage Details</span>
                <p className="bg-white p-2 border border-gray-200 rounded mt-1">
                  {insuranceInfo.coverage_details}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 text-center rounded-md border border-gray-200">
            <p className="text-gray-500">No insurance information available.</p>
          </div>
        )}
      </div>
      
      {/* Claims */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Claims</h2>
        
        {sortedClaims.length > 0 ? (
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Claims List */}
            <div className="w-full lg:w-1/3">
              <div className="bg-gray-50 rounded-md border border-gray-200 h-80 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {sortedClaims.map((claim) => (
                    <li
                      key={claim.id}
                      className={`cursor-pointer hover:bg-gray-100 p-4 ${selectedClaim?.id === claim.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">
                          Claim #{claim.claim_number}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(claim.status)}`}>
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Date of Service: {formatDate(claim.date_of_service)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: {formatCurrency(claim.total_amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Claim Details */}
            <div className="w-full lg:w-2/3 bg-gray-50 rounded-md border border-gray-200 p-4">
              {selectedClaim ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Claim #{selectedClaim.claim_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedClaim.date_of_service)} | Provider: {selectedClaim.provider_name}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(selectedClaim.status)}`}>
                      {selectedClaim.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Claim Timeline */}
                  <div className="mb-4 bg-white p-3 rounded border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 uppercase mb-2">Claim Timeline</h4>
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-green-500 z-10"></div>
                        <div className="absolute top-0 h-2 w-2 rounded-full bg-green-500 z-10"></div>
                        <div className={`absolute top-0 ml-1 h-0.5 w-full ${selectedClaim.submitted_date ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                      </div>
                      
                      <div className="relative flex-grow">
                        <div className={`absolute top-0 -ml-1 h-2 w-2 rounded-full ${selectedClaim.submitted_date ? 'bg-green-500' : 'bg-gray-300'} z-10`}></div>
                        <div className={`absolute top-0 h-0.5 w-full ${selectedClaim.accepted_date || selectedClaim.rejected_date ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                      </div>
                      
                      <div className="relative">
                        <div className={`absolute top-0 -ml-1 h-2 w-2 rounded-full ${
                          selectedClaim.accepted_date ? 'bg-green-500' : 
                          selectedClaim.rejected_date ? 'bg-red-500' : 'bg-gray-300'
                        } z-10`}></div>
                        <div className={`absolute top-0 h-0.5 w-full ${selectedClaim.paid_date ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                      </div>
                      
                      <div className="relative">
                        <div className={`absolute top-0 -ml-1 h-2 w-2 rounded-full ${selectedClaim.paid_date ? 'bg-green-500' : 'bg-gray-300'} z-10`}></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <div className="text-center">
                        <div>Created</div>
                        <div>{formatDate(selectedClaim.date_of_service)}</div>
                      </div>
                      <div className="text-center">
                        <div>Submitted</div>
                        <div>{formatDate(selectedClaim.submitted_date)}</div>
                      </div>
                      <div className="text-center">
                        <div>{selectedClaim.accepted_date ? 'Approved' : selectedClaim.rejected_date ? 'Rejected' : 'Processing'}</div>
                        <div>
                          {selectedClaim.accepted_date ? formatDate(selectedClaim.accepted_date) : 
                           selectedClaim.rejected_date ? formatDate(selectedClaim.rejected_date) : '—'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div>Paid</div>
                        <div>{formatDate(selectedClaim.paid_date)}</div>
                      </div>
                    </div>
                    
                    {selectedClaim.rejection_reason && (
                      <div className="mt-2 text-sm text-red-600">
                        <span className="font-medium">Rejection Reason:</span> {selectedClaim.rejection_reason}
                      </div>
                    )}
                  </div>
                  
                  {/* Service Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase mb-2">Service Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Code
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Description
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                              Qty
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedClaim.service_items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.service_code}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-500">
                                {item.description}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(item.total_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Claim Summary */}
                  {selectedClaim && (
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 uppercase mb-2">Claim Summary</h4>
                      
                      {(() => {
                        const totals = calculateClaimTotals(selectedClaim);
                        
                        return (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-gray-600">
                              Total Charges:
                            </div>
                            <div className="text-sm font-medium text-right">
                              {formatCurrency(totals.totalAmount)}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Insurance Paid:
                            </div>
                            <div className="text-sm font-medium text-right">
                              {formatCurrency(totals.insurancePaid)}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Patient Responsibility:
                            </div>
                            <div className="text-sm font-medium text-right">
                              {formatCurrency(totals.patientResponsibility)}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Payments Made:
                            </div>
                            <div className="text-sm font-medium text-right">
                              {formatCurrency(totals.patientResponsibility - totals.remainingBalance)}
                            </div>
                            
                            <div className="text-sm font-semibold border-t border-gray-200 pt-1 mt-1">
                              Balance Due:
                            </div>
                            <div className="text-sm font-bold text-right border-t border-gray-200 pt-1 mt-1">
                              {formatCurrency(totals.remainingBalance)}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                  <p className="text-gray-500">Select a claim to view details</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 text-center rounded-md border border-gray-200">
            <p className="text-gray-500">No claims available for this patient.</p>
          </div>
        )}
      </div>
      
      {/* Payment History */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment History</h2>
        
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  // Find the claim this payment applies to (if any)
                  const appliedToClaim = claims.find(c => c.id === payment.claim_id);
                  
                  return (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference_number || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appliedToClaim ? `Claim #${appliedToClaim.claim_number}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payment.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 text-center rounded-md border border-gray-200">
            <p className="text-gray-500">No payment history available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientBillingView;