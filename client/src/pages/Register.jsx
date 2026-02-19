import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register: registerUser, googleAuth } = useAuth();

  // 🔹 Google OAuth Handler
  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/google`,
        {
          credential: response.credential,
        }
      );

      const { data, token } = res.data;

      googleAuth(data, token);

      toast.success("Google account connected successfully!");

      if (data.role === 'admin') navigate('/admin/dashboard');
      else if (data.role === 'organizer') navigate('/organizer/dashboard');
      else navigate('/user/dashboard');

    } catch (error) {
      console.error("Google registration failed", error);
      toast.error("Google authentication failed");
    }
  };

  // 🔹 Initialize Google Button
  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleRegisterDiv"),
        {
          theme: "outline",
          size: "large",
          width: 385,
        }
      );
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 100);
    }
  }, []);

  // 🔹 Normal Register Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerUser(formData);

      if (result.success && result.data) {
        const user = result.data;

        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'organizer') navigate('/organizer/dashboard');
        else navigate('/user/dashboard');
      } else if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      // Error already handled by AuthContext (toast)
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

      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-accent-600 to-accent-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80"
          alt="Citizens and Community"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <Logo size={48} className="text-white" />
            <div>
              <h1 className="text-2xl font-bold">Schemz Portal</h1>
              <p className="text-sm text-white/90">Government Scheme Management</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4">
            Join Thousands of Citizens
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Register today to discover government schemes tailored for you.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col">

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">

            <div className="bg-white rounded-lg shadow-medium border border-gov-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">Create Account</h2>
                <p className="text-sm text-gov-600">Register to access government schemes</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gov-500">Must be at least 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* 🔹 Google Button Section */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gov-500 mb-3">Or continue with</p>
                <div id="googleRegisterDiv"></div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gov-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-accent-600 hover:text-accent-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

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
