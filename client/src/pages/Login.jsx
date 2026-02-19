import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const { login, googleAuth, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 🔹 Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'organizer') navigate('/organizer/dashboard');
      else navigate('/user/dashboard');
    }
  }, [user, authLoading, navigate]);

  // 🔹 Google Login Initialization
  useEffect(() => {
  const initializeGoogle = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      {
        theme: "outline",
        size: "large",
        width: 383,
      }
    );
  };

  // If already loaded
  if (window.google) {
    initializeGoogle();
  } else {
    // Wait for script to load
    const interval = setInterval(() => {
      if (window.google) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 100);
  }
}, []);


  // 🔹 Handle Google Response
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

    toast.success("Google login successful!");

    if (data.role === 'admin') navigate('/admin/dashboard');
    else if (data.role === 'organizer') navigate('/organizer/dashboard');
    else navigate('/user/dashboard');

  } catch (error) {
    console.error("Google login failed", error);
    toast.error("Google login failed");
  }
};


  // 🔹 Normal Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user?.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }

    setLoading(false);
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
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-accent-700 to-accent-900">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"
          alt="Government Building"
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
            Empowering Citizens Through Government Schemes
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Access, discover, and apply for government welfare schemes designed for your benefit.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col">

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">

            <div className="bg-white rounded-lg shadow-medium border border-gov-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gov-900 mb-2">Sign In</h2>
                <p className="text-sm text-gov-600">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
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
                  <label htmlFor="password" className="form-label">Password</label>
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

              {/* 🔹 Google Button */}
              <div className="mt-6">
                <div id="googleSignInDiv"></div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gov-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-accent-600 hover:text-accent-700 font-medium">
                    Register here
                  </Link>
                </p>
              </div>
            </div>

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
