import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';

interface MFAEnrollmentModalProps {
  userId: string;
  onComplete: () => void;
  onClose: () => void;
}

type EnrollmentStep = 'loading' | 'qr-display' | 'verify-code' | 'success' | 'error';

const MFAEnrollmentModal: React.FC<MFAEnrollmentModalProps> = ({ userId, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState<EnrollmentStep>('loading');
  const [enrollmentData, setEnrollmentData] = useState<{
    qrCode: string;
    secret: string;
    recoveryKeys: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch the MFA enrollment data when the component mounts
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`/api/admin/users/${userId}/mfa/setup`);
        setEnrollmentData(response.data);
        setCurrentStep('qr-display');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to set up MFA. Please try again.');
        setCurrentStep('error');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentData();
  }, [userId]);

  // Handle verification code submission
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`/api/admin/users/${userId}/mfa/verify`, {
        code: verificationCode,
        secret: enrollmentData?.secret
      });
      
      setCurrentStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful completion
  const handleComplete = () => {
    onComplete();
  };

  // Render based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'loading':
        return (
          <div className="flex flex-col items-center py-8">
            <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-gray-700">Setting up MFA...</p>
          </div>
        );

      case 'qr-display':
        return (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Scan the QR Code</h3>
              <p className="mt-2 text-gray-600">
                Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              {enrollmentData?.qrCode && (
                <QRCode value={enrollmentData.qrCode} size={200} />
              )}
            </div>

            <div className="mb-6">
              <p className="font-medium text-gray-700 mb-2">
                Manual Entry Code:
              </p>
              <div className="bg-gray-100 p-3 rounded-md text-center font-mono select-all">
                {enrollmentData?.secret}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                If you can't scan the QR code, you can manually enter this code in your authenticator app.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep('verify-code')}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next: Verify Code
            </button>
          </>
        );

      case 'verify-code':
        return (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Verify Authentication Code</h3>
              <p className="mt-2 text-gray-600">
                Enter the 6-digit code from your authenticator app to verify setup.
              </p>
            </div>

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

            <div className="mb-6">
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="verification-code"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-center tracking-wider text-lg py-3"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep('qr-display')}
                className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleVerifyCode}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-xl font-bold text-gray-900">MFA Setup Successful</h3>
              <p className="mt-2 text-gray-600">
                Multi-factor authentication has been successfully set up for this user.
              </p>
            </div>

            {enrollmentData?.recoveryKeys && enrollmentData.recoveryKeys.length > 0 && (
              <div className="mb-6">
                <p className="font-medium text-gray-700 mb-2">
                  Recovery Keys:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <ul className="font-mono text-sm">
                    {enrollmentData.recoveryKeys.map((key, index) => (
                      <li key={index} className="mb-1">{key}</li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Important: Save these recovery keys in a secure place. They can be used to access the account if the user loses access to their authentication device.
                </p>
              </div>
            )}

            <button
              onClick={handleComplete}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Done
            </button>
          </>
        );

      case 'error':
        return (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-3 text-xl font-bold text-gray-900">Setup Failed</h3>
              <p className="mt-2 text-gray-600">
                {error || 'There was an error setting up MFA. Please try again.'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCurrentStep('loading');
                  setError(null);
                  setEnrollmentData(null);
                }}
                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Set Up Multi-Factor Authentication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-2">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default MFAEnrollmentModal;