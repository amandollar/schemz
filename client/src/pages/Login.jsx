import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Mail, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showVerificationError, setShowVerificationError] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'organizer') navigate('/organizer/dashboard');
      else navigate('/user/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowVerificationError(false);

    const result = await login(formData);
    
    if (result.success) {
      // Redirect based on role
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user?.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      // Check if error is about email verification
      // Check both error message and response structure
      const errorMessage = result.error?.toLowerCase() || '';
      if (errorMessage.includes('verify') || errorMessage.includes('verification')) {
        setShowVerificationError(true);
      }
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setResendingEmail(true);
    try {
      await authAPI.resendVerification(formData.email);
      toast.success('Verification email sent! Please check your inbox.');
      setShowVerificationError(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gov-100 flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-accent-700 to-accent-900">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"
          alt="Government Building"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Logo size={48} className="text-white" />
              <div>
                <h1 className="text-2xl font-bold">Schemz Portal</h1>
                <p className="text-sm text-white/90">Government Scheme Management</p>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Empowering Citizens Through Government Schemes
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Access, discover, and apply for government welfare schemes designed for your benefit. 
            Join thousands of citizens already benefiting from our platform.
          </p>
          <div className="flex items-center space-x-8 text-sm">
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-white/80">Active Schemes</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-white/80">Citizens Helped</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-white/80">Secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gov-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-3">
              <Logo size={40} className="text-accent-600" />
              <div>
                <h1 className="text-lg font-semibold text-gov-900">Schemz Portal</h1>
                <p className="text-xs text-gov-600">Government Scheme Management System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white rounded-lg shadow-medium border border-gov-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">Sign In</h2>
                <p className="text-sm text-gov-600">Enter your credentials to access your account</p>
              </div>

              {/* Email Verification Alert */}
              {showVerificationError && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
                  <div className="flex items-start">
                    <AlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                        Email Not Verified
                      </h3>
                      <p className="text-sm text-yellow-800 mb-3">
                        Please verify your email before logging in. Check your inbox for the verification link.
                      </p>
                      <button
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="inline-flex items-center text-sm font-medium text-yellow-900 hover:text-yellow-700 disabled:opacity-50"
                      >
                        <Mail size={16} className="mr-1" />
                        {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gov-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-accent-600 hover:text-accent-700 font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center text-xs text-gov-600">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
