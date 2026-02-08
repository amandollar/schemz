import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Shield, CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      
      // Check for success
      if (response.data && response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully! You can now login.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Unexpected response format
        setStatus('error');
        setMessage('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      // Check if it's actually a success (backend might return 200 but axios treats as error)
      if (error.response?.data?.success) {
        setStatus('success');
        setMessage(error.response.data.message || 'Email verified successfully! You can now login.');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Actual error
        setStatus('error');
        const errorMsg = error.response?.data?.message || 'Verification failed. The link may be invalid or expired.';
        setMessage(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gov-100 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gov-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-600 rounded flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gov-900">Schemz Portal</h1>
              <p className="text-xs text-gov-600">Government Scheme Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-medium border border-gov-200 p-8 text-center">
            {/* Verifying State */}
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="text-accent-600 animate-spin" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">
                  Verifying Email
                </h2>
                <p className="text-gov-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {/* Success State */}
            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-fade-in">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-gov-700 mb-6">
                  {message}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    ✓ Your account is now active
                  </p>
                  <p className="text-sm text-green-700">
                    Redirecting to login page in 3 seconds...
                  </p>
                </div>
                <Link to="/login" className="btn-primary w-full">
                  Go to Login Now
                </Link>
              </>
            )}

            {/* Error State */}
            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="text-red-600" size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gov-700 mb-6">
                  {message}
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-left">
                  <p className="text-sm text-yellow-900 mb-2">
                    <strong>What to do:</strong>
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Request a new verification email from the login page</li>
                    <li>Make sure you're using the latest link from your email</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
                <Link to="/login" className="btn-primary w-full">
                  Go to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
