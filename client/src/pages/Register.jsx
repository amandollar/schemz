import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Registration successful!');
        
        // Automatically log in the user after registration
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data));
          
          // Redirect based on role
          if (response.data.data.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (response.data.data.role === 'organizer') {
            navigate('/organizer/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
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
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-accent-600 to-accent-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80"
          alt="Citizens and Community"
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
            Join Thousands of Citizens
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Register today to discover government schemes tailored for you. 
            Simple, secure, and designed to help you access the benefits you deserve.
          </p>
          <div className="flex items-center space-x-8 text-sm">
            <div>
              <div className="text-3xl font-bold">Free</div>
              <div className="text-white/80">Always</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Secure</div>
              <div className="text-white/80">Your Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Easy</div>
              <div className="text-white/80">To Use</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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

        {/* Register Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Register Card */}
            <div className="bg-white rounded-lg shadow-medium border border-gov-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">Create Account</h2>
                <p className="text-sm text-gov-600">Register to access government schemes</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gov-500">Must be at least 6 characters</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gov-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-accent-600 hover:text-accent-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center text-xs text-gov-600">
              <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
