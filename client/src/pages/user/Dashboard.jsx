import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { schemeAPI, applicationAPI } from '../../services/api';
import { isProfileComplete } from '../../utils/profileUtils';
import { FileText, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    matchedSchemes: 0,
    profileComplete: false,
  });
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Always try to fetch matched schemes first - if successful, profile is complete
      let matchedCount = 0;
      let profileComplete = false;
      
      try {
        const response = await schemeAPI.getMatchedSchemes();
        matchedCount = response.data.data?.length || 0;
        // If API call succeeds (even with 0 matches), profile is complete enough
        profileComplete = true;
      } catch (error) {
        // If API call fails, check field-based completion
        profileComplete = isProfileComplete(user);
        if (error.response?.status !== 400) {
          console.error('Error fetching matched schemes:', error);
        }
      }

      const appResponse = await applicationAPI.getApplicationStatus();
      setApplicationStatus(appResponse.data.data);

      setStats({
        matchedSchemes: matchedCount,
        profileComplete,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to field-based check if everything fails
      setStats({
        matchedSchemes: 0,
        profileComplete: isProfileComplete(user),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 h-48 bg-gradient-to-r from-accent-600 to-accent-700 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
          alt="Government Services"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {user?.name}
            </h1>
            <p className="text-white/90 text-lg">
              Access government schemes tailored for you
            </p>
          </div>
        </div>
      </div>

      {/* Profile Alert */}
      {!stats.profileComplete && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                Complete Your Profile
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Update your profile to see schemes you're eligible for
              </p>
              <Link to="/user/profile" className="btn-primary text-sm">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Matched Schemes */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-accent-100 rounded-lg">
              <FileText className="text-accent-600" size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.matchedSchemes}</div>
          <div className="stat-label">Matched Schemes</div>
          {stats.profileComplete && (
            <Link
              to="/user/matched-schemes"
              className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium inline-block"
            >
              View Matches →
            </Link>
          )}
        </div>

        {/* Profile Status */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-lg ${stats.profileComplete ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <User className={stats.profileComplete ? 'text-green-600' : 'text-yellow-600'} size={20} />
            </div>
          </div>
          <div className="text-lg font-semibold text-gov-900 mb-1">
            {stats.profileComplete ? 'Complete' : 'Incomplete'}
          </div>
          <div className="stat-label">Profile Status</div>
          <Link
            to="/user/profile"
            className="mt-3 text-sm text-accent-600 hover:text-accent-700 font-medium inline-block"
          >
            {stats.profileComplete ? 'Edit Profile' : 'Complete Profile'} →
          </Link>
        </div>
      </div>

      {/* Organizer Application Status */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gov-900 mb-4">Organizer Application</h2>
        
        {!applicationStatus ? (
          <div>
            <p className="text-sm text-gov-600 mb-4">
              Apply to become an organizer and create schemes for citizens
            </p>
            <Link to="/user/apply-organizer" className="btn-primary">
              Apply as Organizer
            </Link>
          </div>
        ) : (
          <div className="flex items-start space-x-3">
            {applicationStatus.status === 'pending' && (
              <>
                <Clock className="text-yellow-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-gov-900">Application Pending</p>
                  <p className="text-sm text-gov-600">Your application is under review</p>
                </div>
              </>
            )}
            {applicationStatus.status === 'approved' && (
              <>
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-gov-900">Application Approved</p>
                  <p className="text-sm text-gov-600">You are now an organizer</p>
                </div>
              </>
            )}
            {applicationStatus.status === 'rejected' && (
              <>
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-gov-900">Application Rejected</p>
                  <p className="text-sm text-gov-600">{applicationStatus.remarks}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gov-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/user/matched-schemes"
            className="p-4 border border-gov-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
          >
            <h3 className="font-medium text-gov-900 mb-1">View Matched Schemes</h3>
            <p className="text-sm text-gov-600">See schemes you're eligible for</p>
          </Link>
          <Link
            to="/user/all-schemes"
            className="p-4 border border-gov-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all"
          >
            <h3 className="font-medium text-gov-900 mb-1">Browse All Schemes</h3>
            <p className="text-sm text-gov-600">Explore all available schemes</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
