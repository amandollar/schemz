import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { data, token: authToken } = response.data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(data);
      
      toast.success('Login successful!');
      return { success: true, user: data };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };
  const googleAuth = (userData, authToken) => {
  localStorage.setItem('token', authToken);
  setToken(authToken);
  setUser(userData);
};


  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { data, token: authToken } = response.data;
      
      // Registration returns a token for automatic login
      if (authToken) {
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(data);
      }
      
      toast.success(response.data.message || 'Registration successful!');
      return { success: true, data, token: authToken };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.data);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return { success: false };
    }
  };

  /** Update user from API response (e.g. after document upload) - avoids refetch delay */
  const setUserFromResponse = (userData) => {
    if (userData) setUser(userData);
  };

  const value = {
  user,
  loading,
  login,
  register,
  logout,
  updateUserProfile,
  refreshUser,
  setUserFromResponse,
  googleAuth, 
  isAuthenticated: !!user,
  isUser: user?.role === 'user',
  isOrganizer: user?.role === 'organizer',
  isAdmin: user?.role === 'admin',
};


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
